'use server';

import db from '@/src/db/client';
import { AuthUser, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth.types';

interface UserDbRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone: string | null;
  avatar_url: string | null;
  gender: 'Perempuan' | 'Laki-laki' | null;
  friend_code: string | null;
  school_or_org: string | null;
  hb_level: number | null;
  streak_count: number | null;
}

export async function loginUserAction(
  credentials: LoginCredentials,
): Promise<{ success: boolean; user?: AuthUser; error?: string; redirectTo?: string }> {
  try {
    const normalizedEmail = credentials.email.trim().toLowerCase();

    // 1. Check direct email match
    const res = await db.query<UserDbRow>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.gender,
              p.friend_code, p.school_or_org, p.hb_level, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE lower(u.email) = $1`,
      [normalizedEmail],
    );
    let row = res.rows[0];

    // 2. If not found by exact email, support roleHint / keyword fallback
    if (!row) {
      if (normalizedEmail.includes('admin') || credentials.roleHint === 'admin') {
        const adminRes = await db.query<UserDbRow>(
          `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.gender,
                  p.friend_code, p.school_or_org, p.hb_level, p.streak_count
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.role = 'admin' LIMIT 1`,
        );
        row = adminRes.rows[0];
      } else if (
        normalizedEmail.includes('sarah') ||
        normalizedEmail.includes('user') ||
        normalizedEmail.includes('budi') ||
        credentials.roleHint === 'user'
      ) {
        const userRes = await db.query<UserDbRow>(
          `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.gender,
                  p.friend_code, p.school_or_org, p.hb_level, p.streak_count
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.role = 'user' LIMIT 1`,
        );
        row = userRes.rows[0];
      }
    }

    if (!row) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan. Silakan periksa kembali email Anda.',
      };
    }

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatarUrl: row.avatar_url || undefined,
      gender: row.gender || 'Perempuan',
      friendCode: row.friend_code || undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
    };

    const redirectTo = authUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return { success: true, user: authUser, redirectTo };
  } catch (error: unknown) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat login.' };
  }
}

export async function quickLoginAction(
  role: UserRole,
): Promise<{ success: boolean; user?: AuthUser; redirectTo: string }> {
  try {
    const targetRole = role === 'admin' ? 'admin' : 'user';
    const res = await db.query<UserDbRow>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.gender,
              p.friend_code, p.school_or_org, p.hb_level, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.role = $1 
       ORDER BY u.id ASC LIMIT 1`,
      [targetRole],
    );
    const row = res.rows[0];

    if (!row) {
      throw new Error(`No user found for role ${role}`);
    }

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatarUrl: row.avatar_url || undefined,
      gender: row.gender || 'Perempuan',
      friendCode: row.friend_code || undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
    };

    return {
      success: true,
      user: authUser,
      redirectTo: role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
    };
  } catch (error: unknown) {
    console.error('Quick login error:', error);
    return {
      success: false,
      redirectTo: '/auth/login',
    };
  }
}

export async function registerPatientAction(
  data: RegisterCredentials,
): Promise<{ success: boolean; user?: AuthUser; error?: string; redirectTo?: string }> {
  try {
    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'Email wajib diisi.' };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingRes = await db.query(`SELECT id FROM users WHERE lower(email) = $1`, [
      normalizedEmail,
    ]);
    if (existingRes.rows.length > 0) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
    }

    // Default friendly name
    const defaultName =
      data.name?.trim() ||
      normalizedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()) ||
      'Pengguna Fe-Tablet';

    const cleanTag = defaultName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'USER';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const friendCode = `FE-${cleanTag}-${randNum}`;

    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultName)}`;

    await db.transaction(async client => {
      // 1. Insert into users (role 'user')
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, gender, avatar_url)
         VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
        [
          newId,
          defaultName,
          normalizedEmail,
          data.phone || null,
          data.gender || 'Perempuan',
          avatarUrl,
        ],
      );

      // 2. Insert into user_profiles
      await client.query(
        `INSERT INTO user_profiles (
          user_id, friend_code, school_or_org, hb_level, hb_status, risk_level, streak_count, level_title, status
        ) VALUES ($1, $2, $3, 12.4, 'Normal', 'Rendah', 0, 'Pemula Sehat', 'Aktif')`,
        [newId, friendCode, data.schoolOrOrg || 'SMA Negeri 1 Sehat'],
      );

      // 3. Create default weekly TTD schedule (Sabtu 08:00)
      const schId = `sch_${newId}`;
      await client.query(
        `INSERT INTO reminder_schedules (
          id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
        ) VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', '1 tablet', 'weekly', 'Sabtu', '08:00', true, true, 'Minum setelah sarapan atau sebelum tidur dengan air putih.', 'Aktif')`,
        [schId, newId],
      );
    });

    const authUser: AuthUser = {
      id: newId,
      name: defaultName,
      email: normalizedEmail,
      role: 'user',
      phone: data.phone || undefined,
      gender: data.gender || 'Perempuan',
      avatarUrl: avatarUrl,
      friendCode: friendCode,
      schoolOrOrg: data.schoolOrOrg || 'SMA Negeri 1 Sehat',
      hbLevel: 12.4,
      streakCount: 0,
    };

    return { success: true, user: authUser, redirectTo: '/user/dashboard' };
  } catch (error: unknown) {
    console.error('Register error:', error);
    return { success: false, error: 'Gagal mendaftarkan akun baru.' };
  }
}
