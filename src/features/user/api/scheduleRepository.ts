'use server';

import db from '@/src/db/client';
import { UserScheduleData } from '../types';
import { calculateNextSchedule } from '../utils/scheduleHelpers';

export async function getUserScheduleAction(userId: string = 'usr_1'): Promise<UserScheduleData | null> {
  try {
    const scheduleRes = await db.query<{
      id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
      day_of_week: string;
      time_slot: string;
      is_enabled: boolean;
      remind_15min_before: boolean;
      instructions: string | null;
    }>(
      `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions
       FROM reminder_schedules
       WHERE user_id = $1 AND status = 'Aktif'
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    if (scheduleRes.rows.length === 0) {
      return null;
    }

    const sch = scheduleRes.rows[0];
    const tabletName = sch.tablet_name || 'Tablet Tambah Darah (TTD)';
    const dosage = sch.dosage ? `${sch.dosage}, 1x seminggu` : '1 tablet, 1x seminggu';
    const frequency = sch.frequency === 'daily' ? 'Harian' : 'Mingguan';
    const dayOfWeek = sch.day_of_week || 'Sabtu';
    const timeSlot = sch.time_slot || '20:00';
    const isEnabled = sch.is_enabled;
    const remind15MinBefore = sch.remind_15min_before;
    const instructions =
      sch.instructions || 'Minum 1 tablet seminggu sekali setelah makan malam atau sebelum tidur dengan air putih.';

    const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

    return {
      id: sch.id,
      patientId: userId,
      dayOfWeek,
      time: timeSlot,
      tabletName,
      dosage,
      frequency,
      category: frequency === 'Harian' ? 'Terapi Anemia' : 'TTD Rutin',
      isEnabled,
      remind15MinBefore,
      nextDate,
      daysRemaining,
      instructions,
    };
  } catch (error) {
    console.error('Error in getUserScheduleAction:', error);
    return null;
  }
}

export async function createUserScheduleAction(
  userId: string,
  data: {
    dayOfWeek: string;
    timeSlot: string;
    remind15MinBefore?: boolean;
    frequency?: string;
    tabletName?: string;
    dosage?: string;
    instructions?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const schId = `sch_${userId}_${Date.now().toString().slice(-4)}`;
    const dayOfWeek = data.dayOfWeek || 'Sabtu';
    const timeSlot = data.timeSlot || '20:00';
    const remind15 = data.remind15MinBefore !== false;
    const frequency = data.frequency === 'daily' || data.frequency === 'Harian' ? 'daily' : 'weekly';
    const tabletName = data.tabletName || 'Tablet Tambah Darah (TTD)';
    const dosage = data.dosage || '1 tablet';
    const instructions = data.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.';

    await db.query(
      `INSERT INTO reminder_schedules (
        id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, 'Aktif')`,
      [schId, userId, tabletName, dosage, frequency, dayOfWeek, timeSlot, remind15, instructions],
    );

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in createUserScheduleAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat jadwal.';
    return { success: false, error: errMsg };
  }
}

export async function updateUserScheduleSettingsAction(
  scheduleId: string,
  data: {
    dayOfWeek?: string;
    time?: string;
    frequency?: string;
    isEnabled?: boolean;
    remind15MinBefore?: boolean;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.isEnabled !== undefined) {
      updates.push(`is_enabled = $${paramIndex++}`);
      params.push(data.isEnabled);
      updates.push(`status = $${paramIndex++}`);
      params.push(data.isEnabled ? 'Aktif' : 'Diberhentikan');
    }

    if (data.dayOfWeek) {
      updates.push(`day_of_week = $${paramIndex++}`);
      params.push(data.dayOfWeek);
    }

    if (data.time) {
      updates.push(`time_slot = $${paramIndex++}`);
      params.push(data.time);
    }

    if (data.remind15MinBefore !== undefined) {
      updates.push(`remind_15min_before = $${paramIndex++}`);
      params.push(data.remind15MinBefore);
    }

    if (data.frequency) {
      updates.push(`frequency = $${paramIndex++}`);
      params.push(data.frequency === 'Harian' ? 'daily' : 'weekly');
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(scheduleId);
      await db.query(
        `UPDATE reminder_schedules SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params,
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserScheduleSettingsAction:', error);
    return { success: false, error: 'Gagal memperbarui jadwal.' };
  }
}
