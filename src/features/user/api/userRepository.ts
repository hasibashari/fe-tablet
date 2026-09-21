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
    isEnabled: boolean;
    remind15MinBefore: boolean;
    nextDate: string;
    daysRemaining: number;
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

    // 1. Find user or fallback to first patient
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const firstPatientRes = await db.query<{ id: string }>(
        `SELECT id FROM users WHERE role = 'patient' LIMIT 1`,
      );
      effectiveUserId = firstPatientRes.rows[0]?.id || 'usr_1';
    }

    const userRes = await db.query<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatarUrl: string | null;
      risk_level: string | null;
      medical_notes: string | null;
      weight: number | null;
    }>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatarUrl, u.weight,
              p.risk_level, p.medical_notes
       FROM users u
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [effectiveUserId],
    );

    const userRow = userRes.rows[0];
    const userName = userRow?.name || 'Pasien Fe-Tablet';
    const userEmail = userRow?.email || 'pasien@fe-tablet.com';
    const userPhone = userRow?.phone || '0812-3456-7890';
    const useravatarUrl =
      userRow?.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    // 2. Compute Streak from consumption_logs
    const streakRes = await db.query<{ c: string | number }>(
      `SELECT count(DISTINCT scheduled_date) as c 
       FROM consumption_logs 
       WHERE patient_id = $1 AND status IN ('ON_TIME', 'LATE')`,
      [effectiveUserId],
    );
    const streakCount = Math.max(1, Number(streakRes.rows[0]?.c) || 4);

    // 3. Today's consumption status
    const todayLogRes = await db.query<{ status: string; taken_at: string | null }>(
      `SELECT status, taken_at 
       FROM consumption_logs 
       WHERE patient_id = $1 AND scheduled_date = $2
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

    // 4. Get active schedule for user
    const scheduleRes = await db.query<{
      id: string;
      medication_name: string;
      dosage: string;
      frequency: string;
      status: string;
      instructions: string | null;
      start_date: string;
    }>(
      `SELECT id, medication_name, dosage, frequency, status, instructions, start_date
       FROM medication_schedules
       WHERE patient_id = $1 AND status = 'Aktif'
       ORDER BY created_at DESC LIMIT 1`,
      [effectiveUserId],
    );

    let scheduleId = 'SCH-DEFAULT';
    const dayOfWeek = 'Sabtu';
    let timeSlot = '08:00';
    let isEnabled = true;
    let dosage = '1 tablet, 1x seminggu';
    let tabletName = 'Tablet Tambah Darah (TTD)';
    let frequency = 'Mingguan';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      scheduleId = sch.id;
      tabletName = sch.medication_name || tabletName;
      dosage = sch.dosage ? `${sch.dosage}, 1x seminggu` : dosage;
      frequency = sch.frequency || frequency;
      isEnabled = sch.status === 'Aktif';

      const slotRes = await db.query<{ time: string }>(
        `SELECT time FROM schedule_time_slots WHERE schedule_id = $1 LIMIT 1`,
        [sch.id],
      );
      if (slotRes.rows.length > 0) {
        timeSlot = slotRes.rows[0].time;
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
       ORDER BY published_at DESC LIMIT 1`,
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
        avatarUrl: useravatarUrl,
        streakCount,
        hbLevel: 12.4,
        schoolOrOrg: 'SMA Negeri 1 Jakarta',
        riskLevel: userRow?.risk_level || 'Rendah',
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
        isEnabled,
        remind15MinBefore: true,
        nextDate,
        daysRemaining,
      },
      featuredArticle,
    };
  } catch (error) {
    console.error('Error in getUserDashboardDataAction:', error);
    const { nextDate, daysRemaining } = calculateNextSchedule('Sabtu', '08:00');
    return {
      user: {
        id: userId || 'usr_1',
        name: 'Pasien Fe-Tablet',
        email: 'pasien@fe-tablet.com',
        phone: '0812-3456-7890',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FeTablet',
        streakCount: 4,
        hbLevel: 12.4,
        schoolOrOrg: 'SMA Negeri 1 Jakarta',
        riskLevel: 'Rendah',
      },
      todayStatus: 'pending',
      activeSchedule: {
        id: 'SCH-DEFAULT',
        dayOfWeek: 'Sabtu',
        time: '08:00',
        tabletName: 'Tablet Tambah Darah (TTD)',
        dosage: '1 tablet, 1x seminggu',
        frequency: 'Mingguan',
        isEnabled: true,
        remind15MinBefore: true,
        nextDate,
        daysRemaining,
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
      await db.query(`DELETE FROM consumption_logs WHERE patient_id = $1 AND scheduled_date = $2`, [
        userId,
        todayStr,
      ]);
      return { success: true, status: 'pending' };
    }

    const dbStatus = status === 'recorded' ? 'ON_TIME' : 'MISSED';
    const logId = `log-${Date.now().toString().slice(-6)}`;

    await db.query(
      `INSERT INTO consumption_logs (
        id, patient_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, taken_by
      ) VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', 'MEDICATION', '1 Tablet', $3, '08:00', $4, $5, 'Self')
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        taken_at = EXCLUDED.taken_at`,
      [logId, userId, todayStr, status === 'recorded' ? nowTimeStr : null, dbStatus],
    );

    await db.query(
      `UPDATE reminders 
       SET status = $1 
       WHERE patient_id = $2 AND date = $3`,
      [status === 'recorded' ? 'COMPLETED' : 'MISSED', userId, todayStr],
    );

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
    instructions: 'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur.',
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
    if (data.isEnabled !== undefined) {
      await db.query(
        `UPDATE medication_schedules 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [data.isEnabled ? 'Aktif' : 'Diberhentikan', scheduleId],
      );
    }

    if (data.time) {
      await db.query(
        `UPDATE schedule_time_slots 
         SET time = $1 
         WHERE schedule_id = $2`,
        [data.time, scheduleId],
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
      avatarUrl: string | null;
      date_of_birth: string | null;
      blood_type: string | null;
      height: number | null;
      weight: number | null;
    }>(
      `SELECT id, name, email, phone, avatarUrl, date_of_birth, blood_type, height, weight 
       FROM users WHERE id = $1`,
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
        row.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.name)}`,
      dateOfBirth: row.date_of_birth || '2008-04-12',
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
    await db.query(
      `UPDATE users 
       SET 
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         blood_type = COALESCE($3, blood_type),
         height = COALESCE($4, height),
         weight = COALESCE($5, weight),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        data.name ?? null,
        data.phone ?? null,
        data.bloodType ?? null,
        data.height ?? null,
        data.weight ?? null,
        userId,
      ],
    );

    if (data.schoolOrOrg || data.hbLevel) {
      await db.query(
        `UPDATE patient_profiles 
         SET medical_notes = COALESCE($1, medical_notes) 
         WHERE user_id = $2`,
        [
          `Kadar Hb: ${data.hbLevel || 12.4} g/dL • Institusi: ${data.schoolOrOrg || 'SMA Negeri 1'}`,
          userId,
        ],
      );
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating user profile:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui profil.';
    return { success: false, error: errMsg };
  }
}
