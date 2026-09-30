'use server';

import db from '@/src/db/client';
import { UserProfile } from '../types';

export async function getUserProfileAction(userId: string = 'usr_1'): Promise<UserProfile | null> {
  try {
    const res = await db.query<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
      date_of_birth: string | null;
      blood_type: string | null;
      height: number | null;
      weight: number | null;
      school_or_org: string | null;
      hb_level: number | null;
      friend_code: string | null;
      streak_count: number | null;
    }>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.date_of_birth,
              p.blood_type, p.height, p.weight, p.school_or_org, p.hb_level, p.friend_code, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId],
    );
    const row = res.rows[0];

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      avatarUrl: row.avatar_url || '',
      dateOfBirth: row.date_of_birth ? String(row.date_of_birth).split('T')[0] : undefined,
      bloodType: row.blood_type || undefined,
      height: row.height ? Number(row.height) : undefined,
      weight: row.weight ? Number(row.weight) : undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level ? Number(row.hb_level) : undefined,
      friendCode: row.friend_code || undefined,
      streakCount: Number(row.streak_count) || 0,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfileAction(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    avatarUrl?: string | null;
    dateOfBirth?: string;
    schoolOrOrg?: string;
    hbLevel?: number;
    bloodType?: string;
    height?: number;
    weight?: number;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async client => {
      // 1. Update users
      const userFields: string[] = [];
      const userParams: unknown[] = [];
      let pIdx = 1;

      if (data.name !== undefined) {
        userFields.push(`name = $${pIdx++}`);
        userParams.push(data.name);
      }
      if (data.phone !== undefined) {
        userFields.push(`phone = $${pIdx++}`);
        userParams.push(data.phone);
      }
      if (data.avatarUrl !== undefined) {
        userFields.push(`avatar_url = $${pIdx++}`);
        userParams.push(data.avatarUrl);
      }
      if (data.dateOfBirth !== undefined) {
        userFields.push(`date_of_birth = $${pIdx++}`);
        userParams.push(data.dateOfBirth ? data.dateOfBirth : null);
      }

      if (userFields.length > 0) {
        userFields.push(`updated_at = CURRENT_TIMESTAMP`);
        userParams.push(userId);
        await client.query(
          `UPDATE users SET ${userFields.join(', ')} WHERE id = $${pIdx}`,
          userParams,
        );
      }

      // 2. Update user_profiles
      await client.query(
        `UPDATE user_profiles 
         SET 
           school_or_org = COALESCE($1, school_or_org),
           hb_level = COALESCE($2, hb_level),
           blood_type = COALESCE($3, blood_type),
           height = COALESCE($4, height),
           weight = COALESCE($5, weight),
           last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [
          data.schoolOrOrg ?? null,
          data.hbLevel ?? null,
          data.bloodType ?? null,
          data.height ?? null,
          data.weight ?? null,
          userId,
        ],
      );
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating user profile:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui profil.';
    return { success: false, error: errMsg };
  }
}

export async function saveUserInitialSetupAction(
  userId: string,
  data: {
    schoolOrOrg: string;
    dateOfBirth?: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    hbLevel?: number;
    schedule: {
      dayOfWeek: string;
      timeSlot: string;
      remind15MinBefore?: boolean;
      frequency?: 'weekly' | 'daily';
      tabletName?: string;
      dosage?: string;
    };
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.schoolOrOrg || !data.schoolOrOrg.trim()) {
      return { success: false, error: 'Asal sekolah atau kelas wajib diisi.' };
    }

    await db.transaction(async client => {
      // 1. Update user date of birth if provided
      if (data.dateOfBirth) {
        await client.query(
          `UPDATE users SET date_of_birth = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [data.dateOfBirth, userId],
        );
      }

      // 2. Update user_profiles with real data
      await client.query(
        `UPDATE user_profiles 
         SET 
           school_or_org = $1,
           blood_type = $2,
           height = $3,
           weight = $4,
           hb_level = $5,
           last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [
          data.schoolOrOrg.trim(),
          data.bloodType?.trim() || null,
          data.height || null,
          data.weight || null,
          data.hbLevel || null,
          userId,
        ],
      );

      // 3. Create active schedule in reminder_schedules
      const schId = `sch_${userId}_${Date.now().toString().slice(-4)}`;
      const dayOfWeek = data.schedule.dayOfWeek || 'Sabtu';
      const timeSlot = data.schedule.timeSlot || '20:00';
      const remind15 = data.schedule.remind15MinBefore !== false;
      const frequency = data.schedule.frequency || 'weekly';
      const tabletName = data.schedule.tabletName || 'Tablet Tambah Darah (TTD)';
      const dosage = data.schedule.dosage || '1 tablet';

      // Remove any pre-existing orphan schedules if any, or insert fresh
      await client.query(`DELETE FROM reminder_schedules WHERE user_id = $1`, [userId]);

      await client.query(
        `INSERT INTO reminder_schedules (
          id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, 'Minum setelah makan malam atau sebelum tidur dengan air putih.', 'Aktif')`,
        [schId, userId, tabletName, dosage, frequency, dayOfWeek, timeSlot, remind15],
      );
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in saveUserInitialSetupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menyimpan profil & jadwal awal.';
    return { success: false, error: errMsg };
  }
}
