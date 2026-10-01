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

export async function loginUserAction(credentials: LoginCredentials): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
  redirectTo?: string;
  isProfileComplete?: boolean;
}> {
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

    // 2. If not found by exact email, support roleHint / keyword fallback for demo
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

    // 3. Check active schedule count to determine if user has set up their initial schedule
    const schedRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif'`,
      [row.id],
    );
    const scheduleCount = Number(schedRes.rows[0]?.count || 0);

    const hasSchool = Boolean(row.school_or_org && row.school_or_org.trim());
    const hasSchedule = scheduleCount > 0;
    const isProfileComplete = row.role === 'admin' || (hasSchool && hasSchedule);

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
      hbLevel: row.hb_level !== null ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
      isProfileComplete,
    };

    const redirectTo =
      authUser.role === 'admin'
        ? '/admin/dashboard'
        : isProfileComplete
          ? '/user/dashboard'
          : '/user/setup';

    return { success: true, user: authUser, redirectTo, isProfileComplete };
  } catch (error: unknown) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat login.' };
  }
}

export async function quickLoginAction(
  role: UserRole,
): Promise<{ success: boolean; user?: AuthUser; redirectTo: string; isProfileComplete?: boolean }> {
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

    const schedRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif'`,
      [row.id],
    );
    const scheduleCount = Number(schedRes.rows[0]?.count || 0);
    const hasSchool = Boolean(row.school_or_org && row.school_or_org.trim());
    const hasSchedule = scheduleCount > 0;
    const isProfileComplete = row.role === 'admin' || (hasSchool && hasSchedule);

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
      hbLevel: row.hb_level !== null ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
      isProfileComplete,
    };

    const redirectTo =
      authUser.role === 'admin'
        ? '/admin/dashboard'
        : isProfileComplete
          ? '/user/dashboard'
          : '/user/setup';

    return {
      success: true,
      user: authUser,
      redirectTo,
      isProfileComplete,
    };
  } catch (error: unknown) {
    console.error('Quick login error:', error);
    return {
      success: false,
      redirectTo: '/auth/login',
    };
  }
}

export async function registerUserAction(
  data: RegisterCredentials,
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Nama lengkap wajib diisi.' };
    }

    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'Alamat email wajib diisi.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingRes = await db.query(`SELECT id FROM users WHERE lower(email) = $1`, [
      normalizedEmail,
    ]);
    if (existingRes.rows.length > 0) {
      return {
        success: false,
        error: 'Email sudah terdaftar. Silakan masuk menggunakan email tersebut.',
      };
    }

    const cleanName = data.name.trim();
    const cleanTag =
      cleanName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'USER';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const friendCode = `FE-${cleanTag}-${randNum}`;

    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`;

    await db.transaction(async client => {
      // 1. Insert into users table
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, gender, avatar_url)
         VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
        [
          newId,
          cleanName,
          normalizedEmail,
          data.phone?.trim() || null,
          'Perempuan',
          avatarUrl,
        ],
      );

      // 2. Insert into user_profiles table without dummy default biometrics/school
      await client.query(
        `INSERT INTO user_profiles (
          user_id, friend_code, school_or_org, hb_level, hb_status, risk_level, height, weight, blood_type, streak_count, level_title, status
        ) VALUES ($1, $2, NULL, NULL, 'Normal', 'Rendah', NULL, NULL, NULL, 0, 'Pemula Sehat', 'Aktif')`,
        [newId, friendCode],
      );
      // NOTE: No dummy reminder_schedules inserted! User sets up their own schedule after login.
    });

    return {
      success: true,
      message: 'Pendaftaran akun berhasil! Silakan masuk dengan akun baru Anda.',
    };
  } catch (error: unknown) {
    console.error('Register error:', error);
    return { success: false, error: 'Gagal mendaftarkan akun baru. Silakan coba kembali.' };
  }
}

export const registerPatientAction = registerUserAction;
