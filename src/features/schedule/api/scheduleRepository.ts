'use server'

import db from '@/src/lib/db/client'
import { Reminder, ReminderStatus, ReminderType, DailyProgressStats, AdminNudge } from '../types'

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
  total: number
  completed: number
  pending: number
  missed: number
}

export async function getRemindersAction(patientId: string = 'usr_1'): Promise<Reminder[]> {
  try {
    const rows = db
      .prepare(
        `SELECT id, title, description, date, time, status, type 
         FROM reminders 
         WHERE patient_id = ? 
         ORDER BY date ASC, time ASC`
      )
      .all(patientId) as ReminderRow[]

    return rows.map((r) => ({
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
    const rows = db
      .prepare(
        `SELECT id, title, description, date, time, status, type 
         FROM reminders 
         WHERE patient_id = ? AND date = ?
         ORDER BY time ASC`
      )
      .all(patientId, dateStr) as ReminderRow[]

    return rows.map((r) => ({
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

    const reminder = db
      .prepare(`SELECT * FROM reminders WHERE id = ?`)
      .get(reminderId) as ReminderRow | undefined

    if (!reminder) {
      return { success: false, newStatus: currentStatus as ReminderStatus, error: 'Reminder tidak ditemukan' }
    }

    db.transaction(() => {
      // 1. Update reminder status
      db.prepare(`UPDATE reminders SET status = ? WHERE id = ?`).run(newStatus, reminderId)

      // 2. Sync to consumption_logs
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      const logId = `log-rem-${reminderId}`

      if (newStatus === 'COMPLETED') {
        db.prepare(
          `INSERT OR REPLACE INTO consumption_logs (
            id, patient_id, reminder_id, schedule_id, title, category, scheduled_date, scheduled_time, taken_at, status, taken_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ON_TIME', 'Pasien Mandiri')`
        ).run(
          logId,
          patientId,
          reminderId,
          reminder.schedule_id || null,
          reminder.title,
          reminder.type,
          reminder.date,
          reminder.time,
          nowTime
        )
      } else {
        // Remove or mark pending in consumption log
        db.prepare(`DELETE FROM consumption_logs WHERE id = ? OR reminder_id = ?`).run(logId, reminderId)
      }
    })()

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

    const stats = db
      .prepare(
        `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
           SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed
         FROM reminders 
         WHERE patient_id = ? AND date = ?`
      )
      .get(patientId, targetDate) as DailyStatsRow | undefined

    const total = stats?.total || 0
    const completed = stats?.completed || 0
    const pending = stats?.pending || 0
    const missed = stats?.missed || 0
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
    const row = db
      .prepare(
        `SELECT * FROM admin_nudges 
         WHERE patient_id = ? AND status = 'UNREAD' 
         ORDER BY created_at DESC 
         LIMIT 1`
      )
      .get(patientId) as NudgeRow | undefined

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
    db.prepare(`UPDATE admin_nudges SET status = 'DISMISSED' WHERE id = ?`).run(nudgeId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error dismissing nudge:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menutup pengingat.'
    return { success: false, error: errMsg }
  }
}
