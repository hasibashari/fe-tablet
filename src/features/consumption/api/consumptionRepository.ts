'use server'

import db from '@/src/lib/db/client'
import {
  ConsumptionLog,
  ConsumptionStats,
  ConsumptionStatus,
  ConsumptionCategory,
  DateRangeFilter,
  CategoryFilter,
  StatusFilter,
} from '../types'

interface ConsumptionLogRow {
  id: string
  reminder_id: string | null
  schedule_id: string | null
  title: string
  category: string
  dosage: string | null
  scheduled_date: string
  scheduled_time: string
  taken_at: string | null
  status: string
  notes: string | null
  taken_by: string | null
}

export async function getConsumptionLogsAction(
  range: DateRangeFilter = 'ALL',
  category: CategoryFilter = 'ALL',
  status: StatusFilter = 'ALL',
  patientId: string = 'usr_1'
): Promise<ConsumptionLog[]> {
  try {
    let sql = `
      SELECT id, reminder_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by 
      FROM consumption_logs 
      WHERE patient_id = $1
    `
    const params: unknown[] = [patientId]
    let paramIndex = 2

    // Date range filter
    if (range !== 'ALL') {
      const days = range === '7_DAYS' ? 7 : range === '14_DAYS' ? 14 : 30
      sql += ` AND scheduled_date >= TO_CHAR(CURRENT_DATE - INTERVAL '${days} days', 'YYYY-MM-DD')`
    }

    // Category filter
    if (category !== 'ALL') {
      sql += ` AND category = $${paramIndex++}`
      params.push(category)
    }

    // Status filter
    if (status !== 'ALL') {
      sql += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    sql += ` ORDER BY scheduled_date DESC, scheduled_time DESC`

    const res = await db.query<ConsumptionLogRow>(sql, params)

    return res.rows.map((r) => ({
      id: r.id,
      reminderId: r.reminder_id || undefined,
      title: r.title,
      category: r.category as ConsumptionCategory,
      dosage: r.dosage || undefined,
      scheduledDate: r.scheduled_date,
      scheduledTime: r.scheduled_time,
      takenAt: r.taken_at || undefined,
      status: r.status as ConsumptionStatus,
      notes: r.notes || undefined,
      takenBy: r.taken_by || 'Pasien Mandiri',
    }))
  } catch (error) {
    console.error('Error in getConsumptionLogsAction:', error)
    return []
  }
}

export async function getConsumptionStatsAction(patientId: string = 'usr_1'): Promise<ConsumptionStats> {
  try {
    const res = await db.query<{ scheduled_date: string; status: ConsumptionStatus }>(
      `SELECT scheduled_date, status 
       FROM consumption_logs 
       WHERE patient_id = $1`,
      [patientId]
    )
    const rows = res.rows

    const total = rows.length
    if (total === 0) {
      return {
        adherenceRate: 100,
        currentStreakDays: 0,
        totalCompleted: 0,
        totalOnTime: 0,
        totalLate: 0,
        totalMissed: 0,
        totalScheduled: 0,
      }
    }

    const onTimeCount = rows.filter((l) => l.status === 'ON_TIME').length
    const lateCount = rows.filter((l) => l.status === 'LATE').length
    const missedCount = rows.filter((l) => l.status === 'MISSED').length
    const completedCount = onTimeCount + lateCount

    const adherenceRate = Math.round((completedCount / total) * 100)

    // Calculate streak
    const dateMap = new Map<string, boolean>()
    rows.forEach((l) => {
      const isSuccess = l.status === 'ON_TIME' || l.status === 'LATE'
      const prev = dateMap.get(l.scheduled_date) ?? true
      dateMap.set(l.scheduled_date, prev && isSuccess)
    })

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a))
    let streak = 0
    for (const date of sortedDates) {
      if (dateMap.get(date)) {
        streak++
      } else {
        break
      }
    }

    return {
      adherenceRate,
      currentStreakDays: streak,
      totalCompleted: completedCount,
      totalOnTime: onTimeCount,
      totalLate: lateCount,
      totalMissed: missedCount,
      totalScheduled: total,
    }
  } catch (error) {
    console.error('Error in getConsumptionStatsAction:', error)
    return {
      adherenceRate: 100,
      currentStreakDays: 0,
      totalCompleted: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalMissed: 0,
      totalScheduled: 0,
    }
  }
}

export async function logManualConsumptionAction(data: {
  patientId: string
  title: string
  category: ConsumptionCategory
  dosage?: string
  notes?: string
}): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const id = `log-man-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    await db.query(
      `INSERT INTO consumption_logs (
        id, patient_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ON_TIME', $9, 'Pasien Mandiri')`,
      [
        id,
        data.patientId,
        data.title,
        data.category,
        data.dosage || null,
        today,
        nowTime,
        nowTime,
        data.notes || null,
      ]
    )

    return { success: true, logId: id }
  } catch (error: unknown) {
    console.error('Error in logManualConsumptionAction:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal mencatat konsumsi'
    return { success: false, error: errMsg }
  }
}
