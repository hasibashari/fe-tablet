'use server'

import db from '@/src/lib/db/client'
import { AuthUser, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth.types'

interface UserDbRow {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  avatar: string | null
  title: string | null
  age: number | null
  gender: string | null
  blood_type: string | null
  assigned_doctor_id: string | null
}

interface DoctorDbRow {
  id: string
  name: string
}

export async function loginUserAction(
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: AuthUser; error?: string; redirectTo?: string }> {
  try {
    const normalizedEmail = credentials.email.trim().toLowerCase()

    // 1. Check direct email match
    const res = await db.query<UserDbRow>(
      `SELECT id, name, email, role, phone, avatar, title, age, gender, blood_type, assigned_doctor_id 
       FROM users WHERE lower(email) = $1`,
      [normalizedEmail]
    )
    let row = res.rows[0]

    // 2. If not found by exact email, support roleHint / role keyword fallback
    if (!row) {
      if (normalizedEmail.includes('admin') || credentials.roleHint === 'admin') {
        const adminRes = await db.query<UserDbRow>(
          `SELECT id, name, email, role, phone, avatar, title, age, gender, blood_type, assigned_doctor_id 
           FROM users WHERE role = 'admin' LIMIT 1`
        )
        row = adminRes.rows[0]
      } else if (
        normalizedEmail.includes('budi') ||
        normalizedEmail.includes('patient') ||
        normalizedEmail.includes('user') ||
        credentials.roleHint === 'patient'
      ) {
        const patientRes = await db.query<UserDbRow>(
          `SELECT id, name, email, role, phone, avatar, title, age, gender, blood_type, assigned_doctor_id 
           FROM users WHERE role = 'patient' LIMIT 1`
        )
        row = patientRes.rows[0]
      }
    }

    if (!row) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan. Silakan periksa kembali email Anda.',
      }
    }

    // Resolve doctor name if patient
    let doctorName: string | undefined
    if (row.assigned_doctor_id) {
      const docRes = await db.query<DoctorDbRow>(
        `SELECT name FROM users WHERE id = $1`,
        [row.assigned_doctor_id]
      )
      const doc = docRes.rows[0]
      if (doc) doctorName = doc.name
    }

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatar: row.avatar || undefined,
      title: row.title || undefined,
      age: row.age || undefined,
      gender: (row.gender as 'Laki-laki' | 'Perempuan') || undefined,
      bloodType: row.blood_type || undefined,
      assignedDoctor: doctorName || row.assigned_doctor_id || undefined,
    }

    const redirectTo = authUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
    return { success: true, user: authUser, redirectTo }
  } catch (error: unknown) {
    console.error('Login error:', error)
    return { success: false, error: 'Terjadi kesalahan sistem saat login.' }
  }
}

export async function quickLoginAction(
  role: UserRole
): Promise<{ success: boolean; user?: AuthUser; redirectTo: string }> {
  try {
    const res = await db.query<UserDbRow>(
      `SELECT id, name, email, role, phone, avatar, title, age, gender, blood_type, assigned_doctor_id 
       FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1`,
      [role]
    )
    const row = res.rows[0]

    if (!row) {
      throw new Error(`No user found for role ${role}`)
    }

    let doctorName: string | undefined
    if (row.assigned_doctor_id) {
      const docRes = await db.query<DoctorDbRow>(
        `SELECT name FROM users WHERE id = $1`,
        [row.assigned_doctor_id]
      )
      const doc = docRes.rows[0]
      if (doc) doctorName = doc.name
    }

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatar: row.avatar || undefined,
      title: row.title || undefined,
      age: row.age || undefined,
      gender: (row.gender as 'Laki-laki' | 'Perempuan') || undefined,
      bloodType: row.blood_type || undefined,
      assignedDoctor: doctorName || undefined,
    }

    return {
      success: true,
      user: authUser,
      redirectTo: role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
    }
  } catch (error: unknown) {
    console.error('Quick login error:', error)
    return {
      success: false,
      redirectTo: '/auth/login',
    }
  }
}

export async function registerPatientAction(
  data: RegisterCredentials
): Promise<{ success: boolean; user?: AuthUser; error?: string; redirectTo?: string }> {
  try {
    if (!data.name || !data.email) {
      return { success: false, error: 'Nama dan Email wajib diisi.' }
    }

    const existingRes = await db.query(`SELECT id FROM users WHERE lower(email) = $1`, [data.email.toLowerCase()])
    if (existingRes.rows.length > 0) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' }
    }

    const newId = `PAT-${Date.now().toString().slice(-4)}`
    const defaultDoctorRes = await db.query<DoctorDbRow>(`SELECT id, name FROM users WHERE role = 'admin' LIMIT 1`)
    const defaultDoctor = defaultDoctorRes.rows[0]

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, gender, age, assigned_doctor_id, avatar)
         VALUES ($1, $2, $3, 'patient', $4, $5, $6, $7, $8)`,
        [
          newId,
          data.name,
          data.email.toLowerCase(),
          data.phone || null,
          data.gender || 'Laki-laki',
          data.age || 30,
          defaultDoctor?.id || null,
          avatarUrl,
        ]
      )

      await client.query(
        `INSERT INTO patient_profiles (user_id, risk_level, status, medical_notes, join_date)
         VALUES ($1, 'Rendah', 'Aktif', 'Pasien baru terdaftar secara mandiri', CURRENT_DATE::text)`,
        [newId]
      )
    })

    const authUser: AuthUser = {
      id: newId,
      name: data.name,
      email: data.email.toLowerCase(),
      role: 'patient',
      phone: data.phone || undefined,
      gender: data.gender || 'Laki-laki',
      age: data.age || 30,
      assignedDoctor: defaultDoctor?.name || undefined,
      avatar: avatarUrl,
    }

    return { success: true, user: authUser, redirectTo: '/user/dashboard' }
  } catch (error: unknown) {
    console.error('Register error:', error)
    return { success: false, error: 'Gagal mendaftarkan akun baru.' }
  }
}
