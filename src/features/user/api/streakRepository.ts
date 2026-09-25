'use server';

import db from '@/src/db/client';
import { StreakResult } from '../types';
import { calculateChronologicalStreak } from '../utils/streakCalculator';

export async function calculateAndSyncUserStreak(
  userId: string,
  scheduleFrequency: 'daily' | 'weekly' = 'weekly',
): Promise<StreakResult> {
  const logsRes = await db.query<{ scheduled_date: string | Date }>(
    `SELECT scheduled_date 
     FROM consumption_logs 
     WHERE user_id = $1 AND status IN ('ON_TIME', 'LATE') 
     ORDER BY scheduled_date DESC`,
    [userId],
  );

  const completedDates = logsRes.rows.map(r => r.scheduled_date);
  const result = await calculateChronologicalStreak(completedDates, scheduleFrequency);

  // Sync to user_profiles table in PostgreSQL
  await db.query(
    `UPDATE user_profiles 
     SET streak_count = $1, last_active_at = CURRENT_TIMESTAMP 
     WHERE user_id = $2`,
    [result.streakCount, userId],
  );

  return result;
}
