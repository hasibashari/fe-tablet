'use server';

import db from '@/src/db/client';
import { UserScheduleData } from '../types';
import { calculateNextSchedule } from '../utils/scheduleHelpers';

export async function getUserScheduleAction(userId: string = 'usr_1'): Promise<UserScheduleData> {
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

    let scheduleId = 'sch_fe_1';
    let dayOfWeek = 'Sabtu';
    let timeSlot = '08:00';
    let isEnabled = true;
    let dosage = '1 tablet, 1x seminggu';
    let tabletName = 'Tablet Tambah Darah (Sulfas Ferosus / Ferrous Fumarate)';
    let frequency = 'Mingguan';
    let remind15MinBefore = true;
    let instructions =
      'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      scheduleId = sch.id;
      tabletName = sch.tablet_name || tabletName;
      dosage = sch.dosage ? `${sch.dosage}, 1x seminggu` : dosage;
      frequency = sch.frequency === 'daily' ? 'Harian' : 'Mingguan';
      dayOfWeek = sch.day_of_week || 'Sabtu';
      timeSlot = sch.time_slot || '08:00';
      isEnabled = sch.is_enabled;
      remind15MinBefore = sch.remind_15min_before;
      instructions = sch.instructions || instructions;
    }

    const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

    return {
      id: scheduleId,
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
    const { nextDate, daysRemaining } = calculateNextSchedule('Sabtu', '08:00');
    return {
      id: 'sch_fe_1',
      patientId: userId,
      dayOfWeek: 'Sabtu',
      time: '08:00',
      tabletName: 'Tablet Tambah Darah (Sulfas Ferosus / Ferrous Fumarate)',
      dosage: '1 tablet, 1x seminggu',
      frequency: 'Mingguan',
      category: 'TTD Rutin',
      isEnabled: true,
      remind15MinBefore: true,
      nextDate,
      daysRemaining,
      instructions:
        'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.',
    };
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
