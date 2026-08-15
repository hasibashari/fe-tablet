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
  active_schedules_count: string | number
  total_logs: string | number
  completed_logs: string | number
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
    const res = await db.query<PatientDbRow>(`
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
    `)

    return res.rows.map((r) => {
      const totalLogs = Number(r.total_logs) || 0
      const completedLogs = Number(r.completed_logs) || 0
      const adherenceRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 80

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
        activeSchedulesCount: Number(r.active_schedules_count) || 0,
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
    const defaultDoctorRes = await db.query<DoctorRow>(`SELECT id, name FROM users WHERE role = 'admin' LIMIT 1`)
    const defaultDoctor = defaultDoctorRes.rows[0]

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, avatar, age, gender, assigned_doctor_id)
         VALUES ($1, $2, $3, 'patient', $4, $5, $6, $7, $8)`,
        [
          newId,
          data.name,
          data.email,
          data.phone,
          avatarUrl,
          data.age,
          data.gender,
          defaultDoctor?.id || null,
        ]
      )

      await client.query(
        `INSERT INTO patient_profiles (user_id, risk_level, status, medical_notes, join_date, last_active)
         VALUES ($1, $2, 'Aktif', $3, CURRENT_DATE::text, 'Baru bergabung')`,
        [
          newId,
          data.riskLevel,
          data.medicalNotes || null,
        ]
      )
    })

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
    await db.transaction(async (client) => {
      if (data.name || data.email || data.phone || data.age || data.gender) {
        await client.query(
          `UPDATE users 
           SET 
             name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             age = COALESCE($4, age),
             gender = COALESCE($5, gender),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [
            data.name ?? null,
            data.email ?? null,
            data.phone ?? null,
            data.age ?? null,
            data.gender ?? null,
            patientId,
          ]
        )
      }

      if (data.riskLevel || data.status || data.medicalNotes) {
        await client.query(
          `UPDATE patient_profiles
           SET 
             risk_level = COALESCE($1, risk_level),
             status = COALESCE($2, status),
             medical_notes = COALESCE($3, medical_notes)
           WHERE user_id = $4`,
          [
            data.riskLevel ?? null,
            data.status ?? null,
            data.medicalNotes ?? null,
            patientId,
          ]
        )
      }
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data pasien'
    return { success: false, error: errMsg }
  }
}

export async function deletePatientAction(patientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`DELETE FROM users WHERE id = $1`, [patientId])
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
    await db.query(`UPDATE patient_profiles SET last_reminder_sent = $1 WHERE user_id = $2`, [nowStr, patientId])
    return { success: true }
  } catch (error) {
    console.error('Error sending reminder nudge:', error)
    return { success: false }
  }
}
