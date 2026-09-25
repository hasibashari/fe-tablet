'use server';

import db from '@/src/db/client';
import { UserProfile, UserScheduleData, UserDashboardData, StreakResult } from '../types';
import { calculateNextSchedule } from '../utils/scheduleHelpers';
import { calculateChronologicalStreak as calcChronStreak } from '../utils/streakCalculator';
import {
  getUserProfileAction as getProfile,
  updateUserProfileAction as updateProfile,
} from './profileRepository';
import {
  getUserScheduleAction as getSchedule,
  updateUserScheduleSettingsAction as updateSchedule,
} from './scheduleRepository';
import { calculateAndSyncUserStreak as syncStreak } from './streakRepository';

export type { UserProfile, UserScheduleData, UserDashboardData, StreakResult } from '../types';

export async function calculateChronologicalStreak(
  completedDates: (string | Date)[],
  frequency: 'daily' | 'weekly' = 'weekly',
  now: Date = new Date(),
): Promise<StreakResult> {
  return calcChronStreak(completedDates, frequency, now);
}

export async function calculateAndSyncUserStreak(
  userId: string,
  scheduleFrequency: 'daily' | 'weekly' = 'weekly',
): Promise<StreakResult> {
  return syncStreak(userId, scheduleFrequency);
}

export async function getUserScheduleAction(userId?: string): Promise<UserScheduleData> {
  return getSchedule(userId);
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
  return updateSchedule(scheduleId, data);
}

export async function getUserProfileAction(userId: string = 'usr_1'): Promise<UserProfile | null> {
  return getProfile(userId);
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
  return updateProfile(userId, data);
}

// ============================================================
// 1. GET USER DASHBOARD DATA (Aggregator Action)
// ============================================================
export async function getUserDashboardDataAction(userId?: string): Promise<UserDashboardData> {
  try {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

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
    const userAvatarUrl = userRow?.avatar_url || '';

    // 2. Active schedule
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
    let schedFrequencyType: 'daily' | 'weekly' = 'weekly';
    let remind15MinBefore = true;
    let instructions =
      'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      scheduleId = sch.id;
      tabletName = sch.tablet_name || tabletName;
      dosage = sch.dosage ? `${sch.dosage}, 1x seminggu` : dosage;
      schedFrequencyType = sch.frequency === 'daily' ? 'daily' : 'weekly';
      frequency = sch.frequency === 'daily' ? 'Harian' : 'Mingguan';
      dayOfWeek = sch.day_of_week || 'Sabtu';
      timeSlot = sch.time_slot || '08:00';
      isEnabled = sch.is_enabled;
      remind15MinBefore = sch.remind_15min_before;
      instructions = sch.instructions || instructions;
    }

    // 3. Dynamic chronological streak calculation from database
    const streakResult = await calculateAndSyncUserStreak(effectiveUserId, schedFrequencyType);

    // 4. Today's consumption status
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

    // 6. Active Buddy Connection
    let activeBuddy = null;
    const buddyRes = await db.query<{
      connection_id: string;
      user_id: string;
      buddy_user_id: string;
      shared_streak_count: number;
      this_week_user_status: string;
      this_week_buddy_status: string;
      buddy_id: string;
      buddy_name: string;
      buddy_avatar_url: string | null;
    }>(
      `SELECT bc.id as connection_id, bc.user_id, bc.buddy_user_id, bc.shared_streak_count,
              bc.this_week_user_status, bc.this_week_buddy_status,
              bu.id as buddy_id, bu.name as buddy_name, bu.avatar_url as buddy_avatar_url
       FROM buddy_connections bc
       JOIN users bu ON (CASE WHEN bc.user_id = $1 THEN bc.buddy_user_id ELSE bc.user_id END) = bu.id
       WHERE (bc.user_id = $1 OR bc.buddy_user_id = $1) AND bc.status = 'ACCEPTED'
       ORDER BY bc.shared_streak_count DESC, bc.updated_at DESC
       LIMIT 1`,
      [effectiveUserId],
    );

    if (buddyRes.rows.length > 0) {
      const bRow = buddyRes.rows[0];
      const isUserInitiator = bRow.user_id === effectiveUserId;
      const uStatus = (
        isUserInitiator ? bRow.this_week_user_status : bRow.this_week_buddy_status
      ) as 'recorded' | 'missed' | 'pending';
      const bStatus = (
        isUserInitiator ? bRow.this_week_buddy_status : bRow.this_week_user_status
      ) as 'recorded' | 'missed' | 'pending';

      activeBuddy = {
        connectionId: bRow.connection_id,
        buddyId: bRow.buddy_id,
        buddyName: bRow.buddy_name || 'Sahabat Sehat',
        buddyAvatarUrl: bRow.buddy_avatar_url || '',
        sharedStreakCount: Number(bRow.shared_streak_count) || 0,
        userStatusThisWeek: uStatus || 'pending',
        buddyStatusThisWeek: bStatus || 'pending',
      };
    }

    return {
      user: {
        id: effectiveUserId,
        name: userName,
        email: userEmail,
        phone: userPhone,
        avatarUrl: userAvatarUrl,
        streakCount: streakResult.streakCount,
        streakUnit: streakResult.streakUnit,
        consecutiveDates: streakResult.consecutiveDates,
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
      activeBuddy,
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
        avatarUrl: '',
        streakCount: 0,
        streakUnit: 'Minggu',
        consecutiveDates: [],
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
        instructions:
          'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur dengan air putih.',
      },
      featuredArticle: null,
      activeBuddy: null,
    };
  }
}

// ============================================================
// 2. RECORD USER CONSUMPTION (Today's Quick Action)
// ============================================================
export async function recordUserConsumptionAction(
  userId: string,
  status: 'recorded' | 'missed' | 'pending' = 'recorded',
): Promise<{
  success: boolean;
  status: 'recorded' | 'missed' | 'pending';
  newStreak?: number;
  error?: string;
}> {
  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const nowTimeStr = timeFormatter.format(now) + ' WIB';

    // Get user active schedule details
    const schedRes = await db.query<{
      id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
    }>(
      `SELECT id, tablet_name, dosage, frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const activeSched = schedRes.rows[0];
    const schedId = activeSched?.id || null;
    const title = activeSched?.tablet_name || 'Tablet Tambah Darah (TTD)';
    const dosage = activeSched?.dosage || '1 Tablet';
    const schedFreq = (activeSched?.frequency as 'daily' | 'weekly') || 'weekly';

    if (status === 'pending') {
      await db.query(`DELETE FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2`, [
        userId,
        todayStr,
      ]);
    } else {
      const dbStatus = status === 'recorded' ? 'ON_TIME' : 'MISSED';

      // Check existing log for today
      const existingLogRes = await db.query<{ id: string }>(
        `SELECT id FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2 ORDER BY created_at DESC LIMIT 1`,
        [userId, todayStr],
      );

      if (existingLogRes.rows.length > 0) {
        await db.query(
          `UPDATE consumption_logs 
           SET status = $1, taken_at = $2, taken_by = 'Self', schedule_id = COALESCE($3, schedule_id)
           WHERE id = $4`,
          [dbStatus, status === 'recorded' ? nowTimeStr : null, schedId, existingLogRes.rows[0].id],
        );
      } else {
        const logId = `log_${Date.now().toString().slice(-6)}`;
        await db.query(
          `INSERT INTO consumption_logs (
            id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, taken_by
          ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, '08:00', $7, $8, 'Self')`,
          [
            logId,
            userId,
            schedId,
            title,
            dosage,
            todayStr,
            status === 'recorded' ? nowTimeStr : null,
            dbStatus,
          ],
        );
      }
    }

    // Dynamic streak calculation & synchronization in PostgreSQL
    const streakResult = await calculateAndSyncUserStreak(userId, schedFreq);

    // Sync buddy_connections
    await db.query(
      `UPDATE buddy_connections 
       SET this_week_user_status = $1, shared_streak_count = $2, last_synced_at = CURRENT_TIMESTAMP 
       WHERE user_id = $3`,
      [status, streakResult.streakCount, userId],
    );
    await db.query(
      `UPDATE buddy_connections 
       SET this_week_buddy_status = $1, shared_streak_count = $2, last_synced_at = CURRENT_TIMESTAMP 
       WHERE buddy_user_id = $3`,
      [status, streakResult.streakCount, userId],
    );

    return { success: true, status, newStreak: streakResult.streakCount };
  } catch (error) {
    console.error('Error in recordUserConsumptionAction:', error);
    return { success: false, status: 'pending', error: 'Gagal mencatat status konsumsi.' };
  }
}
