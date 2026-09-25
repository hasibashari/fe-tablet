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
      phone: row.phone || '-',
      avatarUrl: row.avatar_url || '',
      dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : '2008-04-12',
      bloodType: row.blood_type || 'O+',
      height: Number(row.height) || 158,
      weight: Number(row.weight) || 48,
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
