'use server';

import db from '@/src/db/client';
import { UserProfile } from '../types';

export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    streakCount: number;
    hbLevel: number;
    schoolOrOrg: string;
    riskLevel: string;
    friendCode?: string;
  };
  todayStatus: 'recorded' | 'missed' | 'pending';
  todayRecordedTime?: string;
  activeSchedule: {
    id: string;
    dayOfWeek: string;
    time: string;
    tabletName: string;
    dosage: string;
    frequency: string;
    category?: string;
    isEnabled: boolean;
    remind15MinBefore: boolean;
    nextDate: string;
    daysRemaining: number;
    instructions: string;
  };
  featuredArticle: {
    id: string;
    title: string;
    category: string;
    readTime: string;
    summary: string;
    imageUrl: string;
  } | null;
}

export interface UserScheduleData {
  id: string;
  patientId: string;
  dayOfWeek: string;
  time: string;
  tabletName: string;
  dosage: string;
  frequency: string;
  category?: string;
  isEnabled: boolean;
  remind15MinBefore: boolean;
  nextDate: string;
  daysRemaining: number;
  instructions: string;
}

// ------------------------------------------------------------
// Helper: Calculate Day Of Week & Days Remaining
// ------------------------------------------------------------
const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function calculateNextSchedule(targetDayName: string, targetTime: string) {
  const now = new Date();
  const currentDayIndex = now.getDay();
  let targetDayIndex = INDO_DAYS.indexOf(targetDayName);
  if (targetDayIndex === -1) targetDayIndex = 6; // Default Sabtu

  let diff = targetDayIndex - currentDayIndex;
  if (diff < 0) diff += 7;
  if (diff === 0) {
    const [h, m] = targetTime.split(':').map(Number);
    const scheduleDate = new Date(now);
    scheduleDate.setHours(h || 8, m || 0, 0, 0);
    if (now.getTime() > scheduleDate.getTime()) {
      diff = 7;
    }
  }

  const nextDateObj = new Date(now);
  nextDateObj.setDate(now.getDate() + diff);

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const formattedNextDate = `${targetDayName}, ${nextDateObj.getDate()} ${months[nextDateObj.getMonth()]} ${nextDateObj.getFullYear()}`;

  return {
    nextDate: formattedNextDate,
    daysRemaining: diff,
  };
}

// ============================================================
// 1. GET USER DASHBOARD DATA
// ============================================================
export async function getUserDashboardDataAction(userId?: string): Promise<UserDashboardData> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Find user or fallback to first user
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const firstUserRes = await db.query<{ id: string }>(
        `SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 1`,
      );
      effectiveUserId = firstUserRes.rows[0]?.id || 'usr_1';
    }

    const userRes = await db.query<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
      school_or_org: string | null;
      hb_level: number | null;
      risk_level: string | null;
      friend_code: string | null;
      streak_count: number | null;
    }>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
              p.school_or_org, p.hb_level, p.risk_level, p.friend_code, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [effectiveUserId],
    );

    const userRow = userRes.rows[0];
    const userName = userRow?.name || 'Sarah Azzahra';
    const userEmail = userRow?.email || 'sarah@email.com';
    const userPhone = userRow?.phone || '0812-3456-7890';
    const userAvatarUrl =
      userRow?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    // 2. Streak count from user_profiles or logs
    let streakCount = Number(userRow?.streak_count) || 0;
    if (streakCount === 0) {
      const streakRes = await db.query<{ c: string | number }>(
        `SELECT count(DISTINCT scheduled_date) as c 
         FROM consumption_logs 
         WHERE user_id = $1 AND status IN ('ON_TIME', 'LATE')`,
        [effectiveUserId],
      );
      streakCount = Math.max(1, Number(streakRes.rows[0]?.c) || 6);
    }

    // 3. Today's consumption status
    const todayLogRes = await db.query<{ status: string; taken_at: string | null }>(
      `SELECT status, taken_at 
       FROM consumption_logs 
       WHERE user_id = $1 AND scheduled_date = $2
       ORDER BY created_at DESC LIMIT 1`,
      [effectiveUserId, todayStr],
    );

    let todayStatus: 'recorded' | 'missed' | 'pending' = 'pending';
    let todayRecordedTime: string | undefined;

    if (todayLogRes.rows.length > 0) {
      const log = todayLogRes.rows[0];
      if (log.status === 'ON_TIME' || log.status === 'LATE') {
        todayStatus = 'recorded';
        todayRecordedTime = log.taken_at || '08:00 WIB';
      } else if (log.status === 'MISSED' || log.status === 'SKIPPED') {
        todayStatus = 'missed';
      }
    }

    // 4. Active schedule
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
      [effectiveUserId],
    );

    let scheduleId = 'sch_fe_1';
    let dayOfWeek = 'Sabtu';
    let timeSlot = '08:00';
    let isEnabled = true;
    let dosage = '1 tablet, 1x seminggu';
    let tabletName = 'Tablet Tambah Darah (Sulfas Ferosus / Ferrous Fumarate)';
    let frequency = 'Mingguan';
    let remind15MinBefore = true;
    let instructions = 'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      scheduleId = sch.id;
      tabletName = sch.tablet_name || tabletName;
      dosage = sch.dosage ? `${sch.dosage}, 1x seminggu` : dosage;
      frequency = sch.frequency === 'weekly' ? 'Mingguan' : 'Harian';
      dayOfWeek = sch.day_of_week || 'Sabtu';
      timeSlot = sch.time_slot || '08:00';
      isEnabled = sch.is_enabled;
      remind15MinBefore = sch.remind_15min_before;
      instructions = sch.instructions || instructions;
    }

    const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

    // 5. Featured Article
    const articleRes = await db.query<{
      id: string;
      title: string;
      category: string;
      read_time: string;
      summary: string;
      image_url: string;
    }>(
      `SELECT id, title, category, read_time, summary, image_url 
       FROM articles 
       WHERE status = 'Terbit' 
       ORDER BY is_featured DESC, published_at DESC LIMIT 1`,
    );

    const art = articleRes.rows[0];
    const featuredArticle = art
      ? {
          id: art.id,
          title: art.title,
          category: art.category,
          readTime: art.read_time,
          summary: art.summary,
          imageUrl: art.image_url,
        }
      : null;

    return {
      user: {
        id: effectiveUserId,
        name: userName,
        email: userEmail,
        phone: userPhone,
        avatarUrl: userAvatarUrl,
        streakCount,
        hbLevel: Number(userRow?.hb_level) || 12.4,
        schoolOrOrg: userRow?.school_or_org || 'SMA Negeri 1 Sehat',
        riskLevel: userRow?.risk_level || 'Rendah',
        friendCode: userRow?.friend_code || 'FE-SARAH-9901',
      },
      todayStatus,
      todayRecordedTime,
      activeSchedule: {
        id: scheduleId,
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
      },
      featuredArticle,
    };
  } catch (error) {
    console.error('Error in getUserDashboardDataAction:', error);
    const { nextDate, daysRemaining } = calculateNextSchedule('Sabtu', '08:00');
    return {
      user: {
        id: userId || 'usr_1',
        name: 'Sarah Azzahra',
        email: 'sarah@email.com',
        phone: '0812-3456-7890',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        streakCount: 6,
        hbLevel: 12.4,
        schoolOrOrg: 'SMA Negeri 1 Sehat',
        riskLevel: 'Rendah',
        friendCode: 'FE-SARAH-9901',
      },
      todayStatus: 'pending',
      activeSchedule: {
        id: 'sch_fe_1',
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
        instructions: 'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.',
      },
      featuredArticle: null,
    };
  }
}

// ============================================================
// 2. RECORD USER CONSUMPTION
// ============================================================
export async function recordUserConsumptionAction(
  userId: string,
  status: 'recorded' | 'missed' | 'pending' = 'recorded',
): Promise<{ success: boolean; status: 'recorded' | 'missed' | 'pending'; error?: string }> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    if (status === 'pending') {
      await db.query(`DELETE FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2`, [
        userId,
        todayStr,
      ]);
      return { success: true, status: 'pending' };
    }

    const dbStatus = status === 'recorded' ? 'ON_TIME' : 'MISSED';
    const logId = `log_${Date.now().toString().slice(-6)}`;

    await db.query(
      `INSERT INTO consumption_logs (
        id, user_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, taken_by
      ) VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', 'TTD', '1 Tablet', $3, '08:00', $4, $5, 'Self')
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        taken_at = EXCLUDED.taken_at`,
      [logId, userId, todayStr, status === 'recorded' ? nowTimeStr : null, dbStatus],
    );

    // Sync streak in user_profiles
    if (status === 'recorded') {
      await db.query(
        `UPDATE user_profiles 
         SET streak_count = streak_count + 1, last_active_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        [userId],
      );

      // Sync buddy_connections
      await db.query(
        `UPDATE buddy_connections 
         SET this_week_user_status = 'recorded', last_synced_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        [userId],
      );
      await db.query(
        `UPDATE buddy_connections 
         SET this_week_buddy_status = 'recorded', last_synced_at = CURRENT_TIMESTAMP 
         WHERE buddy_user_id = $1`,
        [userId],
      );
    }

    return { success: true, status };
  } catch (error) {
    console.error('Error in recordUserConsumptionAction:', error);
    return { success: false, status: 'pending', error: 'Gagal mencatat status konsumsi.' };
  }
}

// ============================================================
// 3. GET USER SCHEDULE
// ============================================================
export async function getUserScheduleAction(userId?: string): Promise<UserScheduleData> {
  const dashboard = await getUserDashboardDataAction(userId);
  return {
    ...dashboard.activeSchedule,
    patientId: dashboard.user.id,
    instructions: dashboard.activeSchedule.instructions || 'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.',
  };
}

// ============================================================
// 4. UPDATE USER SCHEDULE SETTINGS
// ============================================================
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

// ============================================================
// 5. GET USER PROFILE
// ============================================================
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
      avatarUrl:
        row.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.name)}`,
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

// ============================================================
// 6. UPDATE USER PROFILE
// ============================================================
export async function updateUserProfileAction(
  userId: string,
  data: {
    name?: string;
    phone?: string;
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
      if (data.name || data.phone) {
        await client.query(
          `UPDATE users 
           SET 
             name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [data.name ?? null, data.phone ?? null, userId],
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
