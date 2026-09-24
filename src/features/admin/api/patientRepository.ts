'use server';

import db from '@/src/db/client';
import { PatientUser } from '../types/admin.types';

interface UserManagementDbRow {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan' | null;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  risk_level: 'Tinggi' | 'Sedang' | 'Rendah' | null;
  status: 'Aktif' | 'Nonaktif' | null;
  notes: string | null;
  school_or_org: string | null;
  hb_level: number | null;
  friend_code: string | null;
  streak_count: number | null;
  last_active_at: string | null;
  created_at: string;
  active_schedules_count: string | number;
  total_logs: string | number;
  completed_logs: string | number;
}

// ============================================================
// USER MANAGEMENT (ADMIN VIEW FOR SISWI / USERS)
// ============================================================
export async function getPatientsAction(): Promise<PatientUser[]> {
  try {
    const res = await db.query<UserManagementDbRow>(`
      SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.hb_level, p.friend_code, p.streak_count, p.last_active_at,
        (SELECT count(*) FROM reminder_schedules WHERE user_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC, u.name ASC
    `);

    return res.rows.map(r => {
      const totalLogs = Number(r.total_logs) || 0;
      const completedLogs = Number(r.completed_logs) || 0;
      const adherenceRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 85;

      const d = r.last_active_at ? new Date(r.last_active_at) : new Date();
      const lastActiveStr = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : 'Hari ini';

      return {
        id: r.id,
        name: r.name,
        age: 16,
        gender: r.gender || 'Perempuan',
        phone: r.phone || '-',
        email: r.email,
        avatarUrl: r.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
        riskLevel: r.risk_level || 'Rendah',
        status: r.status || 'Aktif',
        assignedDoctor: r.school_or_org || 'SMA Negeri 1 Sehat',
        schoolOrOrg: r.school_or_org || 'SMA Negeri 1 Sehat',
        activeSchedulesCount: Number(r.active_schedules_count) || 1,
        adherenceRate,
        lastActive: lastActiveStr,
        joinDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        medicalNotes: `Kadar Hb: ${r.hb_level || 12.4} g/dL • ${r.notes || 'Rutin suplementasi'}`,
        lastReminderSent: 'Hari ini, 08:00 WIB',
      };
    });
  } catch (error) {
    console.error('Error in getPatientsAction:', error);
    return [];
  }
}

export async function createPatientAction(data: {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  assignedDoctor?: string;
  medicalNotes?: string;
}): Promise<{ success: boolean; patient?: PatientUser; error?: string }> {
  try {
    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;
    const cleanTag = data.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'USER';
    const friendCode = `FE-${cleanTag}-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.transaction(async client => {
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, avatar_url, gender)
         VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
        [
          newId,
          data.name,
          data.email.toLowerCase().trim(),
          data.phone,
          avatarUrl,
          data.gender || 'Perempuan',
        ],
      );

      await client.query(
        `INSERT INTO user_profiles (user_id, friend_code, school_or_org, risk_level, status, notes)
         VALUES ($1, $2, $3, $4, 'Aktif', $5)`,
        [newId, friendCode, data.assignedDoctor || 'SMA Negeri 1 Sehat', data.riskLevel, data.medicalNotes || null],
      );

      // Create default weekly schedule
      await client.query(
        `INSERT INTO reminder_schedules (id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, status)
         VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', '1 tablet', 'weekly', 'Sabtu', '08:00', true, 'Aktif')`,
        [`sch_${newId}`, newId],
      );
    });

    const patients = await getPatientsAction();
    const created = patients.find(p => p.id === newId);
    return { success: true, patient: created };
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat data pengguna baru';
    return { success: false, error: errMsg };
  }
}

export async function updatePatientAction(
  patientId: string,
  data: Partial<PatientUser>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async client => {
      if (data.name || data.email || data.phone || data.gender) {
        await client.query(
          `UPDATE users 
           SET 
             name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             gender = COALESCE($4, gender),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [
            data.name ?? null,
            data.email ? data.email.toLowerCase().trim() : null,
            data.phone ?? null,
            data.gender ?? null,
            patientId,
          ],
        );
      }

      if (data.riskLevel || data.status || data.medicalNotes || data.assignedDoctor) {
        await client.query(
          `UPDATE user_profiles
           SET 
             risk_level = COALESCE($1, risk_level),
             status = COALESCE($2, status),
             school_or_org = COALESCE($3, school_or_org),
             notes = COALESCE($4, notes),
             last_active_at = CURRENT_TIMESTAMP
           WHERE user_id = $5`,
          [data.riskLevel ?? null, data.status ?? null, data.assignedDoctor ?? null, data.medicalNotes ?? null, patientId],
        );
      }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating patient:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data pengguna';
    return { success: false, error: errMsg };
  }
}

export async function deletePatientAction(
  patientId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`DELETE FROM users WHERE id = $1`, [patientId]);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data pengguna';
    return { success: false, error: errMsg };
  }
}

export async function sendPatientReminderAction(
  patientId: string,
  message?: string,
): Promise<{ success: boolean }> {
  try {
    const nudgeId = `ndg_${Date.now().toString().slice(-6)}`;
    const msg = message || 'Halo! Jangan lupa minum Tablet Tambah Darah (TTD) minggu ini ya 🌸';

    await db.query(
      `INSERT INTO admin_nudges (id, user_id, title, message, channel, status)
       VALUES ($1, $2, 'Pengingat Minum TTD', $3, 'app', 'UNREAD')`,
      [nudgeId, patientId, msg],
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending reminder nudge:', error);
    return { success: false };
  }
}
