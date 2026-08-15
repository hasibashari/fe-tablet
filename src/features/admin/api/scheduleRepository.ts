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
    const res = await db.query<ScheduleDbRow>(`
      SELECT 
        s.*, 
        u.name as patient_name
      FROM medication_schedules s
      JOIN users u ON s.patient_id = u.id
      ORDER BY s.start_date DESC
    `)
    const rows = res.rows

    const result: MedicationSchedule[] = []

    for (const r of rows) {
      const timeSlotsRes = await db.query<{ time: string }>(
        `SELECT time FROM schedule_time_slots WHERE schedule_id = $1 ORDER BY time ASC`,
        [r.id]
      )
      const timeSlots = timeSlotsRes.rows

      const todayRemindersRes = await db.query<{ status: string }>(
        `SELECT status FROM reminders WHERE schedule_id = $1 AND date = $2`,
        [r.id, today]
      )
      const todayReminders = todayRemindersRes.rows

      let todayStatus: 'COMPLETED' | 'PENDING' | 'NO_REMINDER' = 'NO_REMINDER'
      if (todayReminders.length > 0) {
        const allCompleted = todayReminders.every((rem) => rem.status === 'COMPLETED')
        todayStatus = allCompleted ? 'COMPLETED' : 'PENDING'
      }

      result.push({
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
      })
    }

    return result
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

    await db.transaction(async (client) => {
      // 1. Insert into admin_nudges
      await client.query(
        `INSERT INTO admin_nudges (
          id, patient_id, sender_id, sender_name, sender_role, schedule_id, medication_name, dosage, time_slot, message, channel, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'UNREAD', $12)`,
        [
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
          nowIso,
        ]
      )

      // 2. Update last_reminder_sent on patient_profiles
      await client.query(
        `UPDATE patient_profiles 
         SET last_reminder_sent = $1
         WHERE user_id = $2`,
        [nowFormatted, data.patientId]
      )

      // 3. Update last_reminder_sent on medication_schedules if scheduleId provided
      if (data.scheduleId) {
        await client.query(
          `UPDATE medication_schedules 
           SET last_reminder_sent = $1
           WHERE id = $2`,
          [nowFormatted, data.scheduleId]
        )
      }
    })

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

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO medication_schedules (
          id, patient_id, medication_name, dosage, frequency, start_date, end_date, status, category, instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Aktif', $8, $9)`,
        [
          newId,
          data.patientId,
          data.medicationName,
          data.dosage,
          data.frequency,
          data.startDate,
          data.endDate,
          data.category,
          data.instructions || null,
        ]
      )

      for (const slot of data.timeSlots) {
        await client.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [newId, slot])
      }

      // Generate initial today reminder for this schedule
      const today = new Date().toISOString().split('T')[0]
      for (const slot of data.timeSlots) {
        await client.query(
          `INSERT INTO reminders (id, patient_id, schedule_id, title, description, date, time, status, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8)
           ON CONFLICT (id) DO UPDATE SET
             patient_id = EXCLUDED.patient_id,
             schedule_id = EXCLUDED.schedule_id,
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             date = EXCLUDED.date,
             time = EXCLUDED.time,
             status = EXCLUDED.status,
             type = EXCLUDED.type`,
          [
            `rem-${newId}-${slot.replace(':', '')}`,
            data.patientId,
            newId,
            data.medicationName,
            data.instructions || data.dosage,
            today,
            slot,
            data.category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION',
          ]
        )
      }
    })

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
    await db.transaction(async (client) => {
      // 1. Fetch current schedule data for fallback references
      const currentRes = await client.query<{
        id: string
        patient_id: string
        medication_name: string
        dosage: string
        frequency: string
        category: string
        instructions: string | null
      }>(`SELECT * FROM medication_schedules WHERE id = $1`, [scheduleId])
      const current = currentRes.rows[0]

      if (!current) {
        throw new Error('Jadwal tidak ditemukan')
      }

      const patientId = data.patientId || current.patient_id
      const medicationName = data.medicationName || current.medication_name
      const dosage = data.dosage || current.dosage
      const category = data.category || current.category
      const instructions = data.instructions !== undefined ? data.instructions : current.instructions

      // 2. Update master medication schedule
      await client.query(
        `UPDATE medication_schedules
         SET
           patient_id = COALESCE($1, patient_id),
           medication_name = COALESCE($2, medication_name),
           dosage = COALESCE($3, dosage),
           frequency = COALESCE($4, frequency),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date),
           status = COALESCE($7, status),
           category = COALESCE($8, category),
           instructions = COALESCE($9, instructions),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $10`,
        [
          data.patientId ?? null,
          data.medicationName ?? null,
          data.dosage ?? null,
          data.frequency ?? null,
          data.startDate ?? null,
          data.endDate ?? null,
          data.status ?? null,
          data.category ?? null,
          data.instructions ?? null,
          scheduleId,
        ]
      )

      // 3. Update time slots if provided
      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId])
        for (const slot of data.timeSlots) {
          await client.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [scheduleId, slot])
        }

        // 4. Synchronize today's reminders
        const today = new Date().toISOString().split('T')[0]

        // Remove pending reminders for today that are no longer in new time slots
        await client.query(
          `DELETE FROM reminders 
           WHERE schedule_id = $1 AND date = $2 AND status = 'PENDING'`,
          [scheduleId, today]
        )

        // Find which slots are already completed today
        const completedSlotsRes = await client.query<{ time: string }>(
          `SELECT time FROM reminders WHERE schedule_id = $1 AND date = $2 AND status = 'COMPLETED'`,
          [scheduleId, today]
        )
        const completedTimeSet = new Set(completedSlotsRes.rows.map((c) => c.time))

        // Create new pending reminders for slots that are not already completed
        for (const slot of data.timeSlots) {
          if (!completedTimeSet.has(slot)) {
            await client.query(
              `INSERT INTO reminders (id, patient_id, schedule_id, title, description, date, time, status, type)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8)
               ON CONFLICT (id) DO UPDATE SET
                 patient_id = EXCLUDED.patient_id,
                 schedule_id = EXCLUDED.schedule_id,
                 title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 date = EXCLUDED.date,
                 time = EXCLUDED.time,
                 status = EXCLUDED.status,
                 type = EXCLUDED.type`,
              [
                `rem-${scheduleId}-${slot.replace(':', '')}`,
                patientId,
                scheduleId,
                medicationName,
                instructions || dosage,
                today,
                slot,
                category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION',
              ]
            )
          }
        }
      }

      // 5. Update title, description, and type for all existing reminders linked to this schedule
      await client.query(
        `UPDATE reminders
         SET
           title = $1,
           description = $2,
           type = $3
         WHERE schedule_id = $4`,
        [
          medicationName,
          instructions || dosage,
          category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION',
          scheduleId,
        ]
      )
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui jadwal'
    return { success: false, error: errMsg }
  }
}

export async function deleteScheduleAction(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async (client) => {
      await client.query(`DELETE FROM reminders WHERE schedule_id = $1`, [scheduleId])
      await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId])
      await client.query(`DELETE FROM medication_schedules WHERE id = $1`, [scheduleId])
    })
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus jadwal'
    return { success: false, error: errMsg }
  }
}
