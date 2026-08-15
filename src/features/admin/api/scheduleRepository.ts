'use server'

import db from '@/src/lib/db/client'
import { MedicationSchedule } from '../types/admin.types'

interface ScheduleDbRow {
  id: string
  patient_id: string
  patient_name: string | null
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string
  status: 'Aktif' | 'Selesai' | 'Diberhentikan'
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions: string | null
  last_reminder_sent: string | null
}

// ============================================================
// MEDICATION SCHEDULES (SCHEDULES CRUD & REMINDER NUDGES)
// ============================================================
export async function getSchedulesAction(): Promise<MedicationSchedule[]> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const rows = db.prepare(`
      SELECT 
        s.*, 
        u.name as patient_name
      FROM medication_schedules s
      JOIN users u ON s.patient_id = u.id
      ORDER BY s.start_date DESC
    `).all() as ScheduleDbRow[]

    return rows.map((r) => {
      const timeSlots = db
        .prepare(`SELECT time FROM schedule_time_slots WHERE schedule_id = ? ORDER BY time ASC`)
        .all(r.id) as { time: string }[]

      const todayReminders = db
        .prepare(`SELECT status FROM reminders WHERE schedule_id = ? AND date = ?`)
        .all(r.id, today) as { status: string }[]

      let todayStatus: 'COMPLETED' | 'PENDING' | 'NO_REMINDER' = 'NO_REMINDER'
      if (todayReminders.length > 0) {
        const allCompleted = todayReminders.every((rem) => rem.status === 'COMPLETED')
        todayStatus = allCompleted ? 'COMPLETED' : 'PENDING'
      }

      return {
        id: r.id,
        patientId: r.patient_id,
        patientName: r.patient_name || 'Pasien',
        medicationName: r.medication_name,
        dosage: r.dosage,
        frequency: r.frequency,
        timeSlots: timeSlots.map((ts) => ts.time),
        startDate: r.start_date,
        endDate: r.end_date,
        status: r.status,
        category: r.category,
        instructions: r.instructions || '',
        lastReminderSent: r.last_reminder_sent || undefined,
        todayStatus,
      }
    })
  } catch (error) {
    console.error('Error in getSchedulesAction:', error)
    return []
  }
}

export async function sendReminderNudgeAction(data: {
  patientId: string
  senderId?: string
  senderName: string
  senderRole: string
  scheduleId?: string
  medicationName?: string
  dosage?: string
  timeSlot?: string
  message: string
  channel: 'app' | 'whatsapp'
}): Promise<{ success: boolean; nudgeId?: string; error?: string }> {
  try {
    const newId = `ndg-${Date.now().toString().slice(-6)}`
    const nowIso = new Date().toISOString()
    const nowFormatted = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'

    db.transaction(() => {
      // 1. Insert into admin_nudges
      db.prepare(`
        INSERT INTO admin_nudges (
          id, patient_id, sender_id, sender_name, sender_role, schedule_id, medication_name, dosage, time_slot, message, channel, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNREAD', ?)
      `).run(
        newId,
        data.patientId,
        data.senderId ?? null,
        data.senderName,
        data.senderRole,
        data.scheduleId ?? null,
        data.medicationName ?? null,
        data.dosage ?? null,
        data.timeSlot ?? null,
        data.message,
        data.channel,
        nowIso
      )

      // 2. Update last_reminder_sent on patient_profiles
      db.prepare(`
        UPDATE patient_profiles 
        SET last_reminder_sent = ?
        WHERE user_id = ?
      `).run(nowFormatted, data.patientId)

      // 3. Update last_reminder_sent on medication_schedules if scheduleId provided
      if (data.scheduleId) {
        db.prepare(`
          UPDATE medication_schedules 
          SET last_reminder_sent = ?
          WHERE id = ?
        `).run(nowFormatted, data.scheduleId)
      }
    })()

    return { success: true, nudgeId: newId }
  } catch (error: unknown) {
    console.error('Error sending reminder nudge:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal mengirim pengingat.'
    return { success: false, error: errMsg }
  }
}

export async function createScheduleAction(data: {
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  timeSlots: string[]
  startDate: string
  endDate: string
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions?: string
}): Promise<{ success: boolean; schedule?: MedicationSchedule; error?: string }> {
  try {
    const newId = `SCH-${Date.now().toString().slice(-3)}`

    db.transaction(() => {
      db.prepare(`
        INSERT INTO medication_schedules (
          id, patient_id, medication_name, dosage, frequency, start_date, end_date, status, category, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif', ?, ?)
      `).run(
        newId,
        data.patientId,
        data.medicationName,
        data.dosage,
        data.frequency,
        data.startDate,
        data.endDate,
        data.category,
        data.instructions || null
      )

      for (const slot of data.timeSlots) {
        db.prepare(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES (?, ?)`).run(newId, slot)
      }

      // Generate initial today reminder for this schedule
      const today = new Date().toISOString().split('T')[0]
      for (const slot of data.timeSlots) {
        db.prepare(`
          INSERT OR REPLACE INTO reminders (id, patient_id, schedule_id, title, description, date, time, status, type)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
        `).run(
          `rem-${newId}-${slot.replace(':', '')}`,
          data.patientId,
          newId,
          data.medicationName,
          data.instructions || data.dosage,
          today,
          slot,
          data.category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION'
        )
      }
    })()

    const schedules = await getSchedulesAction()
    const created = schedules.find((s) => s.id === newId)
    return { success: true, schedule: created }
  } catch (error: unknown) {
    console.error('Error creating schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat jadwal'
    return { success: false, error: errMsg }
  }
}

export async function updateScheduleAction(
  scheduleId: string,
  data: Partial<MedicationSchedule>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      // 1. Fetch current schedule data for fallback references
      const current = db
        .prepare(`SELECT * FROM medication_schedules WHERE id = ?`)
        .get(scheduleId) as
        | {
            id: string
            patient_id: string
            medication_name: string
            dosage: string
            frequency: string
            category: string
            instructions: string | null
          }
        | undefined

      if (!current) {
        throw new Error('Jadwal tidak ditemukan')
      }

      const patientId = data.patientId || current.patient_id
      const medicationName = data.medicationName || current.medication_name
      const dosage = data.dosage || current.dosage
      const category = data.category || current.category
      const instructions = data.instructions !== undefined ? data.instructions : current.instructions

      // 2. Update master medication schedule
      db.prepare(`
        UPDATE medication_schedules
        SET
          patient_id = COALESCE(?, patient_id),
          medication_name = COALESCE(?, medication_name),
          dosage = COALESCE(?, dosage),
          frequency = COALESCE(?, frequency),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          status = COALESCE(?, status),
          category = COALESCE(?, category),
          instructions = COALESCE(?, instructions),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.patientId ?? null,
        data.medicationName ?? null,
        data.dosage ?? null,
        data.frequency ?? null,
        data.startDate ?? null,
        data.endDate ?? null,
        data.status ?? null,
        data.category ?? null,
        data.instructions ?? null,
        scheduleId
      )

      // 3. Update time slots if provided
      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        db.prepare(`DELETE FROM schedule_time_slots WHERE schedule_id = ?`).run(scheduleId)
        for (const slot of data.timeSlots) {
          db.prepare(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES (?, ?)`).run(scheduleId, slot)
        }

        // 4. Synchronize today's reminders
        const today = new Date().toISOString().split('T')[0]

        // Remove pending reminders for today that are no longer in new time slots
        db.prepare(`
          DELETE FROM reminders 
          WHERE schedule_id = ? AND date = ? AND status = 'PENDING'
        `).run(scheduleId, today)

        // Find which slots are already completed today
        const completedSlots = db
          .prepare(`SELECT time FROM reminders WHERE schedule_id = ? AND date = ? AND status = 'COMPLETED'`)
          .all(scheduleId, today) as { time: string }[]
        const completedTimeSet = new Set(completedSlots.map((c) => c.time))

        // Create new pending reminders for slots that are not already completed
        for (const slot of data.timeSlots) {
          if (!completedTimeSet.has(slot)) {
            db.prepare(`
              INSERT OR REPLACE INTO reminders (id, patient_id, schedule_id, title, description, date, time, status, type)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
            `).run(
              `rem-${scheduleId}-${slot.replace(':', '')}`,
              patientId,
              scheduleId,
              medicationName,
              instructions || dosage,
              today,
              slot,
              category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION'
            )
          }
        }
      }

      // 5. Update title, description, and type for all existing reminders linked to this schedule
      db.prepare(`
        UPDATE reminders
        SET
          title = ?,
          description = ?,
          type = ?
        WHERE schedule_id = ?
      `).run(
        medicationName,
        instructions || dosage,
        category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION',
        scheduleId
      )
    })()

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui jadwal'
    return { success: false, error: errMsg }
  }
}

export async function deleteScheduleAction(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      db.prepare(`DELETE FROM reminders WHERE schedule_id = ?`).run(scheduleId)
      db.prepare(`DELETE FROM schedule_time_slots WHERE schedule_id = ?`).run(scheduleId)
      db.prepare(`DELETE FROM medication_schedules WHERE id = ?`).run(scheduleId)
    })()
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus jadwal'
    return { success: false, error: errMsg }
  }
}
