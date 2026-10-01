'use server';

import db from '@/src/db/client';
import { UserProfile, UserScheduleData, UserDashboardData, StreakResult } from '../types';
import { calculateNextSchedule } from '../utils/scheduleHelpers';
import { calculateChronologicalStreak as calcChronStreak } from '../utils/streakCalculator';
import {
  getUserProfileAction as getProfile,
  updateUserProfileAction as updateProfile,
  saveUserInitialSetupAction as saveInitialSetup,
} from './profileRepository';
import {
  getUserScheduleAction as getSchedule,
  createUserScheduleAction as createSchedule,
  updateUserScheduleSettingsAction as updateSchedule,
} from './scheduleRepository';
import { calculateAndSyncUserStreak as syncStreak } from './streakRepository';
import { calculateAndSyncGroupStreak } from '@/src/features/buddy/api/buddyRepository';

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

export async function getUserScheduleAction(userId?: string): Promise<UserScheduleData | null> {
  return getSchedule(userId);
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
  return createSchedule(userId, data);
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
    dateOfBirth?: string;
    schoolOrOrg?: string;
    hbLevel?: number;
    bloodType?: string;
    height?: number;
    weight?: number;
  },
): Promise<{ success: boolean; error?: string }> {
  return updateProfile(userId, data);
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
  return saveInitialSetup(userId, data);
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

    // Parallelize user, schedule, today's log, featured article, and primary group queries
    const [userRes, scheduleRes, todayLogRes, articleRes, groupRes] = await Promise.all([
      db.query<{
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
      ),
      db.query<{
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
      ),
      db.query<{ status: string; taken_at: string | null }>(
        `SELECT status, taken_at 
         FROM consumption_logs 
         WHERE user_id = $1 AND scheduled_date = $2
         ORDER BY created_at DESC LIMIT 1`,
        [effectiveUserId, todayStr],
      ),
      db.query<{
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
      ),
      db.query<{
        id: string;
        name: string;
        group_code: string;
        streak_count: number;
        avatar_url: string | null;
      }>(
        `SELECT g.id, g.name, g.group_code, g.streak_count, g.avatar_url
         FROM buddy_groups g
         JOIN buddy_group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = $1
         ORDER BY g.updated_at DESC, g.created_at DESC
         LIMIT 1`,
        [effectiveUserId],
      ),
    ]);

    const userRow = userRes.rows[0];
    const userName = userRow?.name || 'Siswi FEMORY';
    const userEmail = userRow?.email || '';
    const userPhone = userRow?.phone || '';
    const userAvatarUrl = userRow?.avatar_url || '';

    // Active schedule
    let activeSchedule: UserScheduleData | null = null;
    let schedFrequencyType: 'daily' | 'weekly' = 'weekly';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      schedFrequencyType = sch.frequency === 'daily' ? 'daily' : 'weekly';
      const dayOfWeek = sch.day_of_week || 'Sabtu';
      const timeSlot = sch.time_slot || '20:00';
      const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

      activeSchedule = {
        id: sch.id,
        patientId: effectiveUserId,
        tabletName: sch.tablet_name || 'Tablet Tambah Darah (TTD)',
        dosage: sch.dosage || '1 tablet, 1x seminggu',
        frequency: sch.frequency === 'daily' ? 'Harian' : 'Mingguan',
        category: sch.frequency === 'daily' ? 'Terapi Anemia' : 'TTD Rutin',
        dayOfWeek,
        time: timeSlot,
        isEnabled: sch.is_enabled,
        remind15MinBefore: sch.remind_15min_before,
        instructions:
          sch.instructions ||
          'Minum 1 tablet seminggu sekali setelah makan malam atau sebelum tidur.',
        nextDate,
        daysRemaining,
      };
    }

    // Dynamic chronological streak calculation from database
    const streakResult = await calculateAndSyncUserStreak(effectiveUserId, schedFrequencyType);

    // Today's consumption status
    let todayStatus: 'recorded' | 'missed' | 'pending' = 'pending';
    let todayRecordedTime: string | undefined;

    if (todayLogRes.rows.length > 0) {
      const log = todayLogRes.rows[0];
      if (log.status === 'ON_TIME' || log.status === 'LATE') {
        todayStatus = 'recorded';
        todayRecordedTime = log.taken_at || '20:00 WIB';
      } else if (log.status === 'MISSED' || log.status === 'SKIPPED') {
        todayStatus = 'missed';
      }
    }

    // Featured Article
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

    // Active Group Buddy
    let primaryGroup = null;
    if (groupRes.rows.length > 0) {
      const gRow = groupRes.rows[0];

      // Dynamically calculate and synchronize group streak from PostgreSQL
      const dynamicGroupStreak = await calculateAndSyncGroupStreak(gRow.id);

      const membersRes = await db.query<{
        user_id: string;
        name: string;
        avatar_url: string | null;
        status_this_week: string | null;
      }>(
        `SELECT u.id as user_id, u.name, u.avatar_url,
                (SELECT cl.status 
                 FROM consumption_logs cl 
                 WHERE cl.user_id = u.id 
                   AND cl.scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
                 ORDER BY cl.created_at DESC LIMIT 1) as status_this_week
         FROM buddy_group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at ASC`,
        [gRow.id],
      );

      const gMembers = membersRes.rows;
      const gMemberCount = gMembers.length;
      const gCompletedCount = gMembers.filter(
        m => m.status_this_week === 'ON_TIME' || m.status_this_week === 'LATE',
      ).length;
      const gRate = gMemberCount > 0 ? Math.round((gCompletedCount / gMemberCount) * 100) : 0;

      primaryGroup = {
        id: gRow.id,
        name: gRow.name,
        groupCode: gRow.group_code,
        streakCount: dynamicGroupStreak,
        memberCount: gMemberCount,
        membersSummary: gMembers.map(m => m.name.split(' ')[0]),
        weeklyCompletedCount: gCompletedCount,
        weeklyTotalCount: gMemberCount,
        weeklyCompletionRate: gRate,
        avatarUrl:
          gRow.avatar_url ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(gRow.name)}`,
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
        hbLevel:
          userRow?.hb_level !== null && userRow?.hb_level !== undefined
            ? Number(userRow.hb_level)
            : null,
        schoolOrOrg: userRow?.school_or_org || null,
        riskLevel: userRow?.risk_level || null,
        friendCode: userRow?.friend_code || undefined,
      },
      todayStatus,
      todayRecordedTime,
      activeSchedule,
      featuredArticle,
      activeBuddy: null,
      primaryGroup,
    };
  } catch (error) {
    console.error('Error in getUserDashboardDataAction:', error);
    return {
      user: {
        id: userId || 'usr_1',
        name: 'Siswi FEMORY',
        email: '',
        phone: '',
        avatarUrl: '',
        streakCount: 0,
        streakUnit: 'Minggu',
        consecutiveDates: [],
        hbLevel: null,
        schoolOrOrg: null,
        riskLevel: null,
      },
      todayStatus: 'pending',
      activeSchedule: null,
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
          ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, '20:00', $7, $8, 'Self')`,
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

    // Sync all group streaks the user belongs to
    const userGroupsRes = await db.query<{ group_id: string }>(
      `SELECT group_id FROM buddy_group_members WHERE user_id = $1`,
      [userId],
    );
    for (const row of userGroupsRes.rows) {
      await calculateAndSyncGroupStreak(row.group_id);
    }

    return { success: true, status, newStreak: streakResult.streakCount };
  } catch (error) {
    console.error('Error in recordUserConsumptionAction:', error);
    return { success: false, status: 'pending', error: 'Gagal mencatat status konsumsi.' };
  }
}
