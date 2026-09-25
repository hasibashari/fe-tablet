'use server';

import db from '@/src/db/client';
import {
  ConsumptionLog,
  ConsumptionStats,
  ConsumptionStatus,
  ConsumptionCategory,
  DateRangeFilter,
  CategoryFilter,
  StatusFilter,
} from '../types';
import { calculateAndSyncUserStreak, calculateChronologicalStreak } from '@/src/features/user/api/userRepository';

interface ConsumptionLogRow {
  id: string;
  schedule_id: string | null;
  title: string;
  category: string;
  dosage: string | null;
  scheduled_date: string | Date;
  scheduled_time: string;
  taken_at: string | null;
  status: string;
  notes: string | null;
  taken_by: string | null;
}

export interface ActivityDateInfo {
  id: string;
  status: 'recorded' | 'missed' | 'pending';
  rawStatus: ConsumptionStatus;
  title: string;
  category: string;
  dosage?: string;
  scheduledDate: string;
  scheduledTime: string;
  takenAt?: string;
  notes?: string;
}

export async function getConsumptionLogsAction(
  range: DateRangeFilter = 'ALL',
  category: CategoryFilter = 'ALL',
  status: StatusFilter = 'ALL',
  userId: string = 'usr_1',
  dateFilter?: string,
): Promise<ConsumptionLog[]> {
  try {
    let sql = `
      SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by 
      FROM consumption_logs 
      WHERE user_id = $1
    `;
    const params: unknown[] = [userId];
    let paramIndex = 2;

    // Specific date filter
    if (dateFilter && dateFilter.trim() !== '') {
      sql += ` AND scheduled_date = $${paramIndex++}`;
      params.push(dateFilter.trim());
    } else if (range !== 'ALL') {
      // Date range filter
      const days = range === '7_DAYS' ? 7 : range === '14_DAYS' ? 14 : 30;
      sql += ` AND scheduled_date >= CURRENT_DATE - INTERVAL '${days} days'`;
    }

    // Category filter
    if (category !== 'ALL') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    // Status filter
    if (status !== 'ALL') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY scheduled_date DESC, scheduled_time DESC`;

    const res = await db.query<ConsumptionLogRow>(sql, params);

    return res.rows.map(r => ({
      id: r.id,
      reminderId: r.schedule_id || undefined,
      title: r.title,
      category: (r.category as ConsumptionCategory) || 'MEDICATION',
      dosage: r.dosage || undefined,
      scheduledDate:
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date
          : new Date(r.scheduled_date).toISOString().split('T')[0],
      scheduledTime: r.scheduled_time,
      takenAt: r.taken_at || undefined,
      status: (r.status as ConsumptionStatus) || 'ON_TIME',
      notes: r.notes || undefined,
      takenBy: r.taken_by || 'Self',
    }));
  } catch (error) {
    console.error('Error in getConsumptionLogsAction:', error);
    return [];
  }
}

/**
 * Returns a map of YYYY-MM-DD -> ActivityDateInfo for all recorded dates.
 * Enables instant indicator lookup for any date on calendar/date strip.
 */
export async function getConsumptionActivityCalendarAction(
  userId: string = 'usr_1',
): Promise<Record<string, ActivityDateInfo>> {
  try {
    const res = await db.query<ConsumptionLogRow>(
      `SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by 
       FROM consumption_logs 
       WHERE user_id = $1
       ORDER BY scheduled_date ASC, created_at ASC`,
      [userId],
    );

    const activityMap: Record<string, ActivityDateInfo> = {};

    res.rows.forEach(r => {
      const dateKey =
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date.split('T')[0]
          : new Date(r.scheduled_date).toISOString().split('T')[0];

      const isCompleted = r.status === 'ON_TIME' || r.status === 'LATE';
      const isMissed = r.status === 'MISSED' || r.status === 'SKIPPED';
      const uiStatus: 'recorded' | 'missed' | 'pending' = isCompleted
        ? 'recorded'
        : isMissed
          ? 'missed'
          : 'pending';

      activityMap[dateKey] = {
        id: r.id,
        status: uiStatus,
        rawStatus: (r.status as ConsumptionStatus) || 'ON_TIME',
        title: r.title || 'Tablet Tambah Darah (TTD)',
        category: r.category || 'TTD',
        dosage: r.dosage || '1 Tablet',
        scheduledDate: dateKey,
        scheduledTime: r.scheduled_time || '08:00',
        takenAt: r.taken_at || undefined,
        notes: r.notes || undefined,
      };
    });

    return activityMap;
  } catch (error) {
    console.error('Error in getConsumptionActivityCalendarAction:', error);
    return {};
  }
}

/**
 * Record or update consumption status for a specific date (today, past, or scheduled).
 * Automatically recalculates and syncs streak to PostgreSQL.
 */
export async function recordConsumptionForDateAction(
  userId: string,
  targetDate: string,
  status: 'recorded' | 'missed' | 'pending',
  notes?: string,
): Promise<{ success: boolean; newStreak?: number; error?: string }> {
  try {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const nowTimeStr = timeFormatter.format(now) + ' WIB';

    // Get user active schedule frequency
    const schedRes = await db.query<{ id: string; tablet_name: string; dosage: string; frequency: string }>(
      `SELECT id, tablet_name, dosage, frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const activeSched = schedRes.rows[0];
    const schedId = activeSched?.id || null;
    const title = activeSched?.tablet_name || 'Tablet Tambah Darah (TTD)';
    const dosage = activeSched?.dosage || '1 Tablet';
    const schedFreq = (activeSched?.frequency as 'daily' | 'weekly') || 'weekly';

    if (status === 'pending') {
      await db.query(
        `DELETE FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2`,
        [userId, targetDate],
      );
    } else {
      const dbStatus = status === 'recorded' ? 'ON_TIME' : 'MISSED';

      const existingLogRes = await db.query<{ id: string }>(
        `SELECT id FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2 ORDER BY created_at DESC LIMIT 1`,
        [userId, targetDate],
      );

      if (existingLogRes.rows.length > 0) {
        await db.query(
          `UPDATE consumption_logs 
           SET status = $1, taken_at = $2, notes = COALESCE($3, notes), taken_by = 'Self', schedule_id = COALESCE($4, schedule_id)
           WHERE id = $5`,
          [
            dbStatus,
            status === 'recorded' ? nowTimeStr : null,
            notes || null,
            schedId,
            existingLogRes.rows[0].id,
          ],
        );
      } else {
        const logId = `log_${Date.now().toString().slice(-6)}`;
        await db.query(
          `INSERT INTO consumption_logs (
            id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
          ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, '08:00', $7, $8, $9, 'Self')`,
          [
            logId,
            userId,
            schedId,
            title,
            dosage,
            targetDate,
            status === 'recorded' ? nowTimeStr : null,
            dbStatus,
            notes || null,
          ],
        );
      }
    }

    // Dynamic chronological streak recalculation
    const streakResult = await calculateAndSyncUserStreak(userId, schedFreq);

    // Sync buddy connections
    await db.query(
      `UPDATE buddy_connections 
       SET shared_streak_count = $1, last_synced_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 OR buddy_user_id = $2`,
      [streakResult.streakCount, userId],
    );

    return { success: true, newStreak: streakResult.streakCount };
  } catch (error) {
    console.error('Error in recordConsumptionForDateAction:', error);
    return { success: false, error: 'Gagal mencatat status konsumsi untuk tanggal ini.' };
  }
}

export async function getConsumptionStatsAction(
  userId: string = 'usr_1',
): Promise<ConsumptionStats> {
  try {
    // 1. Get user active schedule frequency
    const schedRes = await db.query<{ frequency: string }>(
      `SELECT frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const schedFreq = (schedRes.rows[0]?.frequency as 'daily' | 'weekly') || 'weekly';

    const res = await db.query<{ scheduled_date: string | Date; status: ConsumptionStatus }>(
      `SELECT scheduled_date, status 
       FROM consumption_logs 
       WHERE user_id = $1`,
      [userId],
    );
    const rows = res.rows;

    const total = rows.length;
    if (total === 0) {
      return {
        adherenceRate: 100,
        currentStreakDays: 0,
        totalCompleted: 0,
        totalOnTime: 0,
        totalLate: 0,
        totalMissed: 0,
        totalScheduled: 0,
      };
    }

    const onTimeCount = rows.filter(l => l.status === 'ON_TIME').length;
    const lateCount = rows.filter(l => l.status === 'LATE').length;
    const missedCount = rows.filter(l => l.status === 'MISSED' || l.status === 'SKIPPED').length;
    const completedCount = onTimeCount + lateCount;

    const adherenceRate = total > 0 ? Math.round((completedCount / total) * 100) : 100;

    // Dynamic chronological streak calculation
    const completedDates = rows
      .filter(l => l.status === 'ON_TIME' || l.status === 'LATE')
      .map(l => l.scheduled_date);
    
    const streakResult = await calculateChronologicalStreak(completedDates, schedFreq);

    return {
      adherenceRate: adherenceRate,
      currentStreakDays: streakResult.streakCount,
      totalCompleted: completedCount,
      totalOnTime: onTimeCount,
      totalLate: lateCount,
      totalMissed: missedCount,
      totalScheduled: total,
    };
  } catch (error) {
    console.error('Error in getConsumptionStatsAction:', error);
    return {
      adherenceRate: 100,
      currentStreakDays: 0,
      totalCompleted: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalMissed: 0,
      totalScheduled: 0,
    };
  }
}

export async function logManualConsumptionAction(data: {
  userId?: string;
  patientId?: string;
  title: string;
  category: ConsumptionCategory;
  dosage?: string;
  notes?: string;
}): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const targetUserId = data.userId || data.patientId || 'usr_1';
    const id = `log_${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const nowTime =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    await db.query(
      `INSERT INTO consumption_logs (
        id, user_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
      ) VALUES ($1, $2, $3, 'TTD', $4, $5, '08:00', $6, 'ON_TIME', $7, 'Self')`,
      [
        id,
        targetUserId,
        data.title || 'Tablet Tambah Darah (TTD)',
        data.dosage || '1 Tablet',
        today,
        nowTime,
        data.notes || null,
      ],
    );

    // Sync streak in user_profiles
    await calculateAndSyncUserStreak(targetUserId, 'weekly');

    return { success: true, logId: id };
  } catch (error: unknown) {
    console.error('Error in logManualConsumptionAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal mencatat konsumsi';
    return { success: false, error: errMsg };
  }
}

