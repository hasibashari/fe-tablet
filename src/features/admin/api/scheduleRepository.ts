'use server';

import db from '@/src/db/client';
import { MedicationSchedule, ScheduleCategory } from '../types/admin.types';

interface ScheduleDbRow {
  id: string;
  user_id: string;
  patient_name: string | null;
  tablet_name: string;
  dosage: string;
  frequency: string;
  day_of_week: string;
  time_slot: string;
  status: 'Aktif' | 'Selesai' | 'Diberhentikan';
  instructions: string | null;
  created_at: string;
}

// ============================================================
// SCHEDULE MANAGEMENT (ADMIN VIEW FOR TTD SCHEDULES)
// ============================================================
export async function getSchedulesAction(): Promise<MedicationSchedule[]> {
  try {
    const res = await db.query<ScheduleDbRow>(`
      SELECT 
        s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, s.day_of_week, s.time_slot, s.status, s.instructions, s.created_at,
        u.name as patient_name
      FROM reminder_schedules s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    const rows = res.rows;

    // Timezone Asia/Jakarta (WIB)
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // 'YYYY-MM-DD'

    // Fetch logs recorded for today and recent weekly logs
    const logsRes = await db.query<{
      user_id: string;
      schedule_id: string | null;
      status: string;
      scheduled_date: string;
      taken_at: string | null;
    }>(
      `SELECT user_id, schedule_id, status, scheduled_date, taken_at 
       FROM consumption_logs 
       WHERE scheduled_date = $1 OR scheduled_date >= CURRENT_DATE - INTERVAL '6 days'
       ORDER BY scheduled_date DESC`,
      [todayStr],
    );
    const recentLogs = logsRes.rows;

    // Batch fetch schedule time slots
    const allSlotsRes = await db.query<{ schedule_id: string; time: string }>(
      `SELECT schedule_id, time FROM schedule_time_slots ORDER BY time ASC`,
    );
    const slotsByScheduleId: Record<string, string[]> = {};
    for (const slot of allSlotsRes.rows) {
      if (!slotsByScheduleId[slot.schedule_id]) {
        slotsByScheduleId[slot.schedule_id] = [];
      }
      slotsByScheduleId[slot.schedule_id].push(slot.time);
    }

    const result: MedicationSchedule[] = [];

    for (const r of rows) {
      const customSlots = slotsByScheduleId[r.id];
      const slots = customSlots && customSlots.length > 0 ? customSlots : [r.time_slot || '08:00'];

      const isDaily =
        r.frequency === 'daily' ||
        r.frequency === 'Harian' ||
        (r.day_of_week || '').toLowerCase().includes('setiap hari') ||
        (r.day_of_week || '').toLowerCase().includes('harian');
      const isSupplement =
        (r.tablet_name || '').toLowerCase().includes('vitamin') ||
        (r.tablet_name || '').toLowerCase().includes('suplemen');
      const category: ScheduleCategory = isSupplement
        ? 'Suplemen Tambahan'
        : isDaily
          ? 'Terapi Anemia'
          : 'TTD Rutin';

      // Match consumption log: for daily check today, for weekly check this week
      const log = isDaily
        ? recentLogs.find(
            l =>
              l.user_id === r.user_id &&
              (l.schedule_id === r.id || !l.schedule_id) &&
              (typeof l.scheduled_date === 'string'
                ? l.scheduled_date.startsWith(todayStr)
                : new Date(l.scheduled_date).toISOString().split('T')[0] === todayStr),
          )
        : recentLogs.find(
            l => l.user_id === r.user_id && (l.schedule_id === r.id || !l.schedule_id),
          );

      const isCompleted = log && (log.status === 'ON_TIME' || log.status === 'LATE');
      const todayStatus: 'COMPLETED' | 'PENDING' = isCompleted ? 'COMPLETED' : 'PENDING';

      result.push({
        id: r.id,
        patientId: r.user_id,
        patientName: r.patient_name || 'Siswi Fe-Tablet',
        medicationName: r.tablet_name || 'Tablet Tambah Darah (TTD)',
        dosage: r.dosage || '1 tablet',
        frequency: isDaily ? 'Harian' : '1x Seminggu',
        dayOfWeek: r.day_of_week || 'Sabtu',
        timeSlots: slots,
        startDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        endDate: '2026-12-31',
        status: r.status,
        category,
        instructions:
          r.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
        lastReminderSent: `${r.day_of_week || 'Sabtu'}, ${r.time_slot || '08:00'} WIB`,
        todayStatus,
      });
    }

    return result;
  } catch (error) {
    console.error('Error in getSchedulesAction:', error);
    return [];
  }
}

export async function sendReminderNudgeAction(data: {
  patientId: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  scheduleId?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  message: string;
  channel: 'app' | 'whatsapp';
}): Promise<{ success: boolean; nudgeId?: string; error?: string }> {
  try {
    const newId = `ndg_${Date.now().toString().slice(-6)}`;

    await db.query(
      `INSERT INTO admin_nudges (
        id, user_id, sender_id, schedule_id, title, message, channel, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'UNREAD')`,
      [
        newId,
        data.patientId,
        data.senderId ?? null,
        data.scheduleId ?? null,
        data.medicationName ? `Pengingat ${data.medicationName}` : 'Pengingat Minum TTD',
        data.message,
        data.channel,
      ],
    );

    return { success: true, nudgeId: newId };
  } catch (error: unknown) {
    console.error('Error sending reminder nudge:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal mengirim pengingat.';
    return { success: false, error: errMsg };
  }
}

export async function createScheduleAction(data: {
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  dayOfWeek?: string;
  timeSlots: string[];
  startDate?: string;
  endDate?: string;
  category?: 'TTD Rutin' | 'Terapi Anemia' | 'Suplemen Tambahan';
  instructions?: string;
}): Promise<{ success: boolean; schedule?: MedicationSchedule; error?: string }> {
  try {
    const newId = `sch_${Date.now().toString().slice(-6)}`;
    const mainSlot = data.timeSlots[0] || '08:00';
    const dayOfWeek = data.dayOfWeek || 'Sabtu';
    const dbFrequency =
      data.frequency === 'Harian' || data.category === 'Terapi Anemia' ? 'daily' : 'weekly';

    await db.transaction(async client => {
      // Upsert/override any active schedule for this user
      await client.query(
        `INSERT INTO reminder_schedules (
          id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, status, instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Aktif', $8)`,
        [
          newId,
          data.patientId,
          data.medicationName || 'Tablet Tambah Darah (TTD)',
          data.dosage || '1 tablet',
          dbFrequency,
          dayOfWeek,
          mainSlot,
          data.instructions ||
            'Minum 1 tablet setelah sarapan atau sebelum tidur dengan air putih.',
        ],
      );

      for (const slot of data.timeSlots) {
        await client.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [
          newId,
          slot,
        ]);
      }
    });

    const schedules = await getSchedulesAction();
    const created = schedules.find(s => s.id === newId);
    return { success: true, schedule: created };
  } catch (error: unknown) {
    console.error('Error creating schedule:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat jadwal';
    return { success: false, error: errMsg };
  }
}

export async function updateScheduleAction(
  scheduleId: string,
  data: Partial<MedicationSchedule>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dbFrequency = data.frequency
      ? data.frequency === 'Harian' || data.category === 'Terapi Anemia'
        ? 'daily'
        : 'weekly'
      : null;

    const mainSlot = data.timeSlots && data.timeSlots.length > 0 ? data.timeSlots[0] : null;

    await db.transaction(async client => {
      await client.query(
        `UPDATE reminder_schedules
         SET
           tablet_name = COALESCE($1, tablet_name),
           dosage = COALESCE($2, dosage),
           status = COALESCE($3, status),
           instructions = COALESCE($4, instructions),
           day_of_week = COALESCE($5, day_of_week),
           frequency = COALESCE($6, frequency),
           time_slot = COALESCE($7, time_slot),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [
          data.medicationName ?? null,
          data.dosage ?? null,
          data.status ?? null,
          data.instructions ?? null,
          data.dayOfWeek ?? null,
          dbFrequency,
          mainSlot,
          scheduleId,
        ],
      );

      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId]);
        for (const slot of data.timeSlots) {
          await client.query(
            `INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`,
            [scheduleId, slot],
          );
        }
      }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating schedule:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui jadwal';
    return { success: false, error: errMsg };
  }
}

export async function deleteScheduleAction(
  scheduleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async client => {
      await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId]);
      await client.query(`DELETE FROM reminder_schedules WHERE id = $1`, [scheduleId]);
    });
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting schedule:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus jadwal';
    return { success: false, error: errMsg };
  }
}
