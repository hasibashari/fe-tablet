'use server';

import db from '@/src/db/client';
import {
  Reminder,
  ReminderStatus,
  ReminderType,
  DailyProgressStats,
  AdminNudge,
  AdherenceTrendPoint,
} from '../types';

interface ConsumptionLogRow {
  id: string;
  user_id: string;
  schedule_id: string | null;
  title: string;
  category: string;
  dosage: string | null;
  scheduled_date: string;
  scheduled_time: string;
  taken_at: string | null;
  status: string;
  notes: string | null;
}

export async function getRemindersAction(userId: string = 'usr_1'): Promise<Reminder[]> {
  try {
    const res = await db.query<ConsumptionLogRow>(
      `SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes
       FROM consumption_logs 
       WHERE user_id = $1 
       ORDER BY scheduled_date DESC, scheduled_time ASC`,
      [userId],
    );

    if (res.rows.length === 0) {
      // If no logs, generate default schedule reminder
      const schRes = await db.query<{
        id: string;
        tablet_name: string;
        day_of_week: string;
        time_slot: string;
        instructions: string | null;
      }>(
        `SELECT id, tablet_name, day_of_week, time_slot, instructions FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
        [userId],
      );
      const sch = schRes.rows[0];
      const today = new Date().toISOString().split('T')[0];

      return [
        {
          id: sch?.id || 'sch_fe_1',
          title: sch?.tablet_name || 'Tablet Tambah Darah (TTD)',
          description: sch?.instructions || 'Minum setelah makan malam atau sebelum tidur.',
          date: today,
          time: sch?.time_slot || '08:00',
          status: 'PENDING' as ReminderStatus,
          type: 'MEDICATION' as ReminderType,
        },
      ];
    }

    return res.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.notes || 'Tablet Tambah Darah (1x seminggu)',
      date:
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date
          : new Date(r.scheduled_date).toISOString().split('T')[0],
      time: r.scheduled_time,
      status: (r.status === 'ON_TIME' || r.status === 'LATE'
        ? 'COMPLETED'
        : r.status === 'MISSED'
          ? 'MISSED'
          : 'PENDING') as ReminderStatus,
      type: 'MEDICATION' as ReminderType,
    }));
  } catch (error) {
    console.error('Error in getRemindersAction:', error);
    return [];
  }
}

export async function getRemindersByDateAction(
  dateStr: string,
  userId: string = 'usr_1',
): Promise<Reminder[]> {
  try {
    const res = await db.query<ConsumptionLogRow>(
      `SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes
       FROM consumption_logs 
       WHERE user_id = $1 AND scheduled_date = $2
       ORDER BY scheduled_time ASC`,
      [userId, dateStr],
    );

    if (res.rows.length === 0) {
      return [
        {
          id: `rem_${dateStr}`,
          title: 'Tablet Tambah Darah (TTD)',
          description: 'Minum setelah makan malam bersama air jeruk atau air putih.',
          date: dateStr,
          time: '08:00',
          status: 'PENDING' as ReminderStatus,
          type: 'MEDICATION' as ReminderType,
        },
      ];
    }

    return res.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.notes || 'Tablet Tambah Darah (1x seminggu)',
      date:
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date
          : new Date(r.scheduled_date).toISOString().split('T')[0],
      time: r.scheduled_time,
      status: (r.status === 'ON_TIME' || r.status === 'LATE'
        ? 'COMPLETED'
        : r.status === 'MISSED'
          ? 'MISSED'
          : 'PENDING') as ReminderStatus,
      type: 'MEDICATION' as ReminderType,
    }));
  } catch (error) {
    console.error('Error in getRemindersByDateAction:', error);
    return [];
  }
}

export async function toggleReminderStatusAction(
  reminderId: string,
  currentStatus: string,
  userId: string = 'usr_1',
): Promise<{ success: boolean; newStatus: ReminderStatus; error?: string }> {
  try {
    const newStatus: ReminderStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const nowTime =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const todayStr = new Date().toISOString().split('T')[0];

    const dbStatus = newStatus === 'COMPLETED' ? 'ON_TIME' : 'PENDING';

    await db.query(
      `INSERT INTO consumption_logs (
        id, user_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, taken_by
      ) VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', 'TTD', '1 Tablet', $3, '08:00', $4, $5, 'Self')
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        taken_at = EXCLUDED.taken_at`,
      [reminderId, userId, todayStr, newStatus === 'COMPLETED' ? nowTime : null, dbStatus],
    );

    return { success: true, newStatus };
  } catch (error: unknown) {
    console.error('Error toggling reminder status:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui status pengingat';
    return { success: false, newStatus: currentStatus as ReminderStatus, error: errMsg };
  }
}

export async function getDailyProgressStatsAction(
  userId: string = 'usr_1',
  dateStr?: string,
): Promise<DailyProgressStats> {
  try {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    const res = await db.query<{
      total: string | number;
      completed: string | number;
      pending: string | number;
      missed: string | number;
    }>(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed
       FROM consumption_logs 
       WHERE user_id = $1 AND scheduled_date = $2`,
      [userId, targetDate],
    );
    const stats = res.rows[0];

    let total = Number(stats?.total) || 0;
    const completed = Number(stats?.completed) || 0;
    let pending = Number(stats?.pending) || 0;
    const missed = Number(stats?.missed) || 0;

    if (total === 0) {
      total = 1;
      pending = 1;
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      missed,
      percentage,
    };
  } catch (error) {
    console.error('Error in getDailyProgressStatsAction:', error);
    return { total: 1, completed: 0, pending: 1, missed: 0, percentage: 0 };
  }
}

interface NudgeRow {
  id: string;
  user_id: string;
  sender_id: string | null;
  sender_name?: string;
  schedule_id: string | null;
  title: string;
  message: string;
  channel: string;
  status: string;
  created_at: string;
}

export async function getActiveNudgeAction(userId: string = 'usr_1'): Promise<AdminNudge | null> {
  try {
    const res = await db.query<NudgeRow>(
      `SELECT n.id, n.user_id, n.sender_id, n.schedule_id, n.title, n.message, n.channel, n.status, n.created_at,
              u.name as sender_name
       FROM admin_nudges n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.user_id = $1 AND n.status = 'UNREAD' 
       ORDER BY n.created_at DESC 
       LIMIT 1`,
      [userId],
    );
    const row = res.rows[0];

    if (!row) return null;

    const d = new Date(row.created_at);
    const timeStr = !isNaN(d.getTime())
      ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      : 'Baru saja';

    return {
      id: row.id,
      patientId: row.user_id,
      senderName: row.sender_name || 'Fasilitator Medis Fe-Tablet',
      senderRole: 'Fasilitator Kesehatan UKS',
      scheduleId: row.schedule_id || undefined,
      medicationName: 'Tablet Tambah Darah (TTD)',
      dosage: '1 tablet',
      timeSlot: '08:00',
      message: row.message,
      channel: (row.channel as 'app' | 'whatsapp') || 'app',
      status: row.status as 'UNREAD' | 'READ' | 'DISMISSED',
      sentAt: timeStr,
    };
  } catch (error) {
    console.error('Error fetching active nudge:', error);
    return null;
  }
}

export async function dismissNudgeAction(
  nudgeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`UPDATE admin_nudges SET status = 'DISMISSED' WHERE id = $1`, [nudgeId]);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error dismissing nudge:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menutup pengingat.';
    return { success: false, error: errMsg };
  }
}

export async function getAdherenceTrendAction(
  userId: string = 'usr_1',
  days: number = 7,
): Promise<AdherenceTrendPoint[]> {
  try {
    const result: AdherenceTrendPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const logRes = await db.query<{
        total_logs: string | number;
        completed_logs: string | number | null;
      }>(
        `SELECT 
           COUNT(*) as total_logs,
           SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1 ELSE 0 END) as completed_logs
         FROM consumption_logs 
         WHERE user_id = $1 AND scheduled_date = $2`,
        [userId, dateStr],
      );
      const logStats = logRes.rows[0];

      const total = Number(logStats?.total_logs) || 0;
      const completed = Number(logStats?.completed_logs) || 0;
      const adherence = total > 0 ? Math.round((completed / total) * 100) : 100;

      result.push({
        day: dayLabel,
        date: dateLabel,
        adherence,
        totalReminders: total || 1,
        completedReminders: completed,
      });
    }

    return result;
  } catch (error) {
    console.error('Error in getAdherenceTrendAction:', error);
    return [];
  }
}
