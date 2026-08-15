'use server'

import db from '@/src/lib/db/client'
import { PatientUser } from '../types/admin.types'

interface PatientDbRow {
  id: string
  name: string
  age: number | null
  gender: 'Laki-laki' | 'Perempuan' | null
  phone: string | null
  email: string
  risk_level: 'Tinggi' | 'Sedang' | 'Rendah'
  status: 'Aktif' | 'Nonaktif'
  medical_notes: string | null
  last_reminder_sent: string | null
  last_active: string | null
  join_date: string
  doctor_name: string | null
  active_schedules_count: number
  total_logs: number
  completed_logs: number
}

interface DoctorRow {
  id: string
  name?: string
}

// ============================================================
// PATIENT MANAGEMENT (USERS CRUD)
// ============================================================
export async function getPatientsAction(): Promise<PatientUser[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        u.id, u.name, u.age, u.gender, u.phone, u.email,
        p.risk_level, p.status, p.medical_notes, p.last_reminder_sent, p.last_active, p.join_date,
        doc.name as doctor_name,
        (SELECT count(*) FROM medication_schedules WHERE patient_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE patient_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE patient_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      JOIN patient_profiles p ON u.id = p.user_id
      LEFT JOIN users doc ON u.assigned_doctor_id = doc.id
      WHERE u.role = 'patient'
      ORDER BY p.join_date DESC, u.name ASC
    `).all() as PatientDbRow[]

    return rows.map((r) => {
      const adherenceRate = r.total_logs > 0 ? Math.round((r.completed_logs / r.total_logs) * 100) : 80
      return {
        id: r.id,
        name: r.name,
        age: r.age || 40,
        gender: r.gender || 'Laki-laki',
        phone: r.phone || '-',
        email: r.email,
        riskLevel: r.risk_level,
        status: r.status,
        assignedDoctor: r.doctor_name || 'dr. Siti Rahma, Sp.PD',
        activeSchedulesCount: r.active_schedules_count,
        adherenceRate,
        lastActive: r.last_active || 'Hari ini',
        joinDate: r.join_date,
        medicalNotes: r.medical_notes || undefined,
        lastReminderSent: r.last_reminder_sent || undefined,
      }
    })
  } catch (error) {
    console.error('Error in getPatientsAction:', error)
    return []
  }
}

export async function createPatientAction(data: {
  name: string
  email: string
  phone: string
  age: number
  gender: 'Laki-laki' | 'Perempuan'
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah'
  assignedDoctor?: string
  medicalNotes?: string
}): Promise<{ success: boolean; patient?: PatientUser; error?: string }> {
  try {
    const newId = `PAT-${Date.now().toString().slice(-3)}`
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`
    const defaultDoctor = db.prepare(`SELECT id, name FROM users WHERE role = 'admin' LIMIT 1`).get() as DoctorRow | undefined

    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, name, email, role, phone, avatar, age, gender, assigned_doctor_id)
        VALUES (?, ?, ?, 'patient', ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.name,
        data.email,
        data.phone,
        avatarUrl,
        data.age,
        data.gender,
        defaultDoctor?.id || null
      )

      db.prepare(`
        INSERT INTO patient_profiles (user_id, risk_level, status, medical_notes, join_date, last_active)
        VALUES (?, ?, 'Aktif', ?, date('now'), 'Baru bergabung')
      `).run(
        newId,
        data.riskLevel,
        data.medicalNotes || null
      )
    })()

    const patients = await getPatientsAction()
    const created = patients.find((p) => p.id === newId)
    return { success: true, patient: created }
  } catch (error: unknown) {
    console.error('Error creating patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat data pasien'
    return { success: false, error: errMsg }
  }
}

export async function updatePatientAction(
  patientId: string,
  data: Partial<PatientUser>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      if (data.name || data.email || data.phone || data.age || data.gender) {
        db.prepare(`
          UPDATE users 
          SET 
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            age = COALESCE(?, age),
            gender = COALESCE(?, gender),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          data.name ?? null,
          data.email ?? null,
          data.phone ?? null,
          data.age ?? null,
          data.gender ?? null,
          patientId
        )
      }

      if (data.riskLevel || data.status || data.medicalNotes) {
        db.prepare(`
          UPDATE patient_profiles
          SET 
            risk_level = COALESCE(?, risk_level),
            status = COALESCE(?, status),
            medical_notes = COALESCE(?, medical_notes)
          WHERE user_id = ?
        `).run(
          data.riskLevel ?? null,
          data.status ?? null,
          data.medicalNotes ?? null,
          patientId
        )
      }
    })()

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data pasien'
    return { success: false, error: errMsg }
  }
}

export async function deletePatientAction(patientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM users WHERE id = ?`).run(patientId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data pasien'
    return { success: false, error: errMsg }
  }
}

export async function sendPatientReminderAction(
  patientId: string,
  message?: string
): Promise<{ success: boolean }> {
  try {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const nowStr = message ? `Hari ini, ${timeStr} (${message})` : `Hari ini, ${timeStr}`
    db.prepare(`UPDATE patient_profiles SET last_reminder_sent = ? WHERE user_id = ?`).run(nowStr, patientId)
    return { success: true }
  } catch (error) {
    console.error('Error sending reminder nudge:', error)
    return { success: false }
  }
}
