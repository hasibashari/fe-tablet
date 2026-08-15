'use server'

import db from '@/src/lib/db/client'
import {
  Reminder,
  ReminderStatus,
  ReminderType,
  DailyProgressStats,
  AdminNudge,
  AdherenceTrendPoint,
} from '../types'

interface ReminderRow {
  id: string
  patient_id?: string
  schedule_id?: string | null
  title: string
  description: string | null
  date: string
  time: string
  status: string
  type: string
}

interface DailyStatsRow {
  total: string | number
  completed: string | number
  pending: string | number
  missed: string | number
}

export async function getRemindersAction(patientId: string = 'usr_1'): Promise<Reminder[]> {
  try {
    const res = await db.query<ReminderRow>(
      `SELECT id, title, description, date, time, status, type 
       FROM reminders 
       WHERE patient_id = $1 
       ORDER BY date ASC, time ASC`,
      [patientId]
    )

    return res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      date: r.date,
      time: r.time,
      status: r.status as ReminderStatus,
      type: r.type as ReminderType,
    }))
  } catch (error) {
    console.error('Error in getRemindersAction:', error)
    return []
  }
}

export async function getRemindersByDateAction(
  dateStr: string,
  patientId: string = 'usr_1'
): Promise<Reminder[]> {
  try {
    const res = await db.query<ReminderRow>(
      `SELECT id, title, description, date, time, status, type 
       FROM reminders 
       WHERE patient_id = $1 AND date = $2
       ORDER BY time ASC`,
      [patientId, dateStr]
    )

    return res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      date: r.date,
      time: r.time,
      status: r.status as ReminderStatus,
      type: r.type as ReminderType,
    }))
  } catch (error) {
    console.error('Error in getRemindersByDateAction:', error)
    return []
  }
}

export async function toggleReminderStatusAction(
  reminderId: string,
  currentStatus: string,
  patientId: string = 'usr_1'
): Promise<{ success: boolean; newStatus: ReminderStatus; error?: string }> {
  try {
    const newStatus: ReminderStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    const reminderRes = await db.query<ReminderRow>(`SELECT * FROM reminders WHERE id = $1`, [reminderId])
    const reminder = reminderRes.rows[0]

    if (!reminder) {
      return { success: false, newStatus: currentStatus as ReminderStatus, error: 'Reminder tidak ditemukan' }
    }

    await db.transaction(async (client) => {
      // 1. Update reminder status
      await client.query(`UPDATE reminders SET status = $1 WHERE id = $2`, [newStatus, reminderId])

      // 2. Sync to consumption_logs
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      const logId = `log-rem-${reminderId}`

      if (newStatus === 'COMPLETED') {
        await client.query(
          `INSERT INTO consumption_logs (
            id, patient_id, reminder_id, schedule_id, title, category, scheduled_date, scheduled_time, taken_at, status, taken_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ON_TIME', 'Pasien Mandiri')
          ON CONFLICT (id) DO UPDATE SET
            patient_id = EXCLUDED.patient_id,
            reminder_id = EXCLUDED.reminder_id,
            schedule_id = EXCLUDED.schedule_id,
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            scheduled_date = EXCLUDED.scheduled_date,
            scheduled_time = EXCLUDED.scheduled_time,
            taken_at = EXCLUDED.taken_at,
            status = EXCLUDED.status,
            taken_by = EXCLUDED.taken_by`,
          [
            logId,
            patientId,
            reminderId,
            reminder.schedule_id || null,
            reminder.title,
            reminder.type,
            reminder.date,
            reminder.time,
            nowTime,
          ]
        )
      } else {
        // Remove or mark pending in consumption log
        await client.query(`DELETE FROM consumption_logs WHERE id = $1 OR reminder_id = $2`, [logId, reminderId])
      }
    })

    return { success: true, newStatus }
  } catch (error: unknown) {
    console.error('Error toggling reminder status:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui status pengingat'
    return { success: false, newStatus: currentStatus as ReminderStatus, error: errMsg }
  }
}

export async function getDailyProgressStatsAction(
  patientId: string = 'usr_1',
  dateStr?: string
): Promise<DailyProgressStats> {
  try {
    const targetDate = dateStr || new Date().toISOString().split('T')[0]

    const res = await db.query<DailyStatsRow>(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed
       FROM reminders 
       WHERE patient_id = $1 AND date = $2`,
      [patientId, targetDate]
    )
    const stats = res.rows[0]

    const total = Number(stats?.total) || 0
    const completed = Number(stats?.completed) || 0
    const pending = Number(stats?.pending) || 0
    const missed = Number(stats?.missed) || 0
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      missed,
      percentage,
    }
  } catch (error) {
    console.error('Error in getDailyProgressStatsAction:', error)
    return { total: 0, completed: 0, pending: 0, missed: 0, percentage: 0 }
  }
}

interface NudgeRow {
  id: string
  patient_id: string
  sender_id: string | null
  sender_name: string
  sender_role: string
  schedule_id: string | null
  medication_name: string | null
  dosage: string | null
  time_slot: string | null
  message: string
  channel: string
  status: string
  created_at: string
}

export async function getActiveNudgeAction(patientId: string = 'usr_1'): Promise<AdminNudge | null> {
  try {
    const res = await db.query<NudgeRow>(
      `SELECT * FROM admin_nudges 
       WHERE patient_id = $1 AND status = 'UNREAD' 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [patientId]
    )
    const row = res.rows[0]

    if (!row) return null

    // Format time, e.g. 14:30 WIB
    const d = new Date(row.created_at)
    const timeStr = !isNaN(d.getTime())
      ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      : 'Baru saja'

    return {
      id: row.id,
      patientId: row.patient_id,
      senderName: row.sender_name,
      senderRole: row.sender_role,
      scheduleId: row.schedule_id || undefined,
      medicationName: row.medication_name || undefined,
      dosage: row.dosage || undefined,
      timeSlot: row.time_slot || undefined,
      message: row.message,
      channel: (row.channel as 'app' | 'whatsapp') || 'app',
      status: row.status as 'UNREAD' | 'READ' | 'DISMISSED',
      sentAt: timeStr,
    }
  } catch (error) {
    console.error('Error fetching active nudge:', error)
    return null
  }
}

export async function dismissNudgeAction(nudgeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`UPDATE admin_nudges SET status = 'DISMISSED' WHERE id = $1`, [nudgeId])
    return { success: true }
  } catch (error: unknown) {
    console.error('Error dismissing nudge:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menutup pengingat.'
    return { success: false, error: errMsg }
  }
}

export async function getAdherenceTrendAction(
  patientId: string = 'usr_1',
  days: number = 7
): Promise<AdherenceTrendPoint[]> {
  try {
    const result: AdherenceTrendPoint[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)

      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' })
      const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

      const reminderRes = await db.query<{ total: string | number; completed: string | number | null }>(
        `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
         FROM reminders 
         WHERE patient_id = $1 AND date = $2`,
        [patientId, dateStr]
      )
      const reminderStats = reminderRes.rows[0]

      const logRes = await db.query<{ total_logs: string | number; completed_logs: string | number | null }>(
        `SELECT 
           COUNT(*) as total_logs,
           SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1 ELSE 0 END) as completed_logs
         FROM consumption_logs 
         WHERE patient_id = $1 AND scheduled_date = $2`,
        [patientId, dateStr]
      )
      const logStats = logRes.rows[0]

      let total = Number(reminderStats?.total) || 0
      let completed = Number(reminderStats?.completed) || 0

      const totalLogs = Number(logStats?.total_logs) || 0
      const completedLogs = Number(logStats?.completed_logs) || 0

      if (total === 0 && totalLogs > 0) {
        total = totalLogs
        completed = completedLogs
      }

      const adherence = total > 0 ? Math.round((completed / total) * 100) : 100

      result.push({
        day: dayLabel,
        date: dateLabel,
        adherence,
        totalReminders: total,
        completedReminders: completed,
      })
    }

    return result
  } catch (error) {
    console.error('Error in getAdherenceTrendAction:', error)
    return []
  }
}
