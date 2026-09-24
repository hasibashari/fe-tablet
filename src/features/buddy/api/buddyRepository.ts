'use server';

import db from '@/src/db/client';
import {
  BuddyStreakData,
  BuddyActivity,
  BuddyItem,
  CheerType,
  SendCheerResult,
  AddBuddyResult,
  RemoveBuddyResult,
  ConsumptionStatus,
} from '../types';

interface BuddyConnRow {
  id: string;
  user_id: string;
  buddy_user_id: string;
  status: string;
  shared_streak_count: number;
  this_week_user_status: string;
  this_week_buddy_status: string;
  buddy_name: string;
  buddy_avatar_url: string | null;
  buddy_friend_code: string | null;
  buddy_school_or_org: string | null;
  user_friend_code: string | null;
}

interface ActivityRow {
  id: string;
  action_type: string;
  action_text: string;
  icon_type: string;
  is_positive: boolean;
  created_at: string;
  actor_name: string;
}

export async function getBuddyStreakDataAction(
  userId: string = 'usr_1',
  activeConnectionId?: string,
): Promise<BuddyStreakData> {
  try {
    // 1. Fetch user's own friend code
    const profileRes = await db.query<{ friend_code: string }>(
      `SELECT friend_code FROM user_profiles WHERE user_id = $1`,
      [userId],
    );
    const userFriendCode = profileRes.rows[0]?.friend_code || 'FE-SARAH-9901';

    // 2. Query all active buddy connections for this user
    const res = await db.query<BuddyConnRow>(
      `SELECT bc.id, bc.user_id, bc.buddy_user_id, bc.status, bc.shared_streak_count,
              bc.this_week_user_status, bc.this_week_buddy_status,
              bu.name as buddy_name, bu.avatar_url as buddy_avatar_url,
              bp.friend_code as buddy_friend_code, bp.school_or_org as buddy_school_or_org,
              up.friend_code as user_friend_code
       FROM buddy_connections bc
       JOIN users bu ON (CASE WHEN bc.user_id = $1 THEN bc.buddy_user_id ELSE bc.user_id END) = bu.id
       LEFT JOIN user_profiles bp ON bu.id = bp.user_id
       LEFT JOIN user_profiles up ON up.user_id = $1
       WHERE (bc.user_id = $1 OR bc.buddy_user_id = $1) AND bc.status = 'ACCEPTED'
       ORDER BY bc.shared_streak_count DESC, bc.updated_at DESC`,
      [userId],
    );

    const rows = res.rows;

    // Handle Empty State (0 friends)
    if (rows.length === 0) {
      return {
        connectionId: '',
        buddyId: '',
        buddyName: '',
        buddyAvatarUrl: '',
        sharedStreakCount: 0,
        userStatusThisWeek: 'pending',
        buddyStatusThisWeek: 'pending',
        userFriendCode,
        activeBuddy: null,
        friendsList: [],
        activities: [],
      };
    }

    // Determine active connection
    let targetRow = rows[0];
    if (activeConnectionId) {
      const found = rows.find(r => r.id === activeConnectionId);
      if (found) targetRow = found;
    }

    const activeConnId = targetRow.id;

    // Build friendsList
    const friendsList: BuddyItem[] = rows.map(r => {
      const isUserInitiator = r.user_id === userId;
      const bStatus = (isUserInitiator ? r.this_week_buddy_status : r.this_week_user_status) as ConsumptionStatus;
      const bId = isUserInitiator ? r.buddy_user_id : r.user_id;

      return {
        connectionId: r.id,
        buddyId: bId,
        name: r.buddy_name || 'Sahabat Sehat',
        avatarUrl:
          r.buddy_avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.buddy_name || 'Buddy')}`,
        friendCode: r.buddy_friend_code || 'FE-TEMAN-2026',
        sharedStreakCount: Number(r.shared_streak_count) || 0,
        statusThisWeek: bStatus || 'pending',
        schoolOrOrg: r.buddy_school_or_org || 'SMA Negeri 1 Sehat',
        isActive: r.id === activeConnId,
      };
    });

    const isUserInitiator = targetRow.user_id === userId;
    const activeBuddyId = isUserInitiator ? targetRow.buddy_user_id : targetRow.user_id;
    const activeUserStatus = (isUserInitiator ? targetRow.this_week_user_status : targetRow.this_week_buddy_status) as ConsumptionStatus;
    const activeBuddyStatus = (isUserInitiator ? targetRow.this_week_buddy_status : targetRow.this_week_user_status) as ConsumptionStatus;

    const activeBuddyItem: BuddyItem = {
      connectionId: targetRow.id,
      buddyId: activeBuddyId,
      name: targetRow.buddy_name || 'Sahabat Sehat',
      avatarUrl:
        targetRow.buddy_avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetRow.buddy_name || 'Buddy')}`,
      friendCode: targetRow.buddy_friend_code || 'FE-TEMAN-2026',
      sharedStreakCount: Number(targetRow.shared_streak_count) || 0,
      statusThisWeek: activeBuddyStatus || 'pending',
      schoolOrOrg: targetRow.buddy_school_or_org || 'SMA Negeri 1 Sehat',
      isActive: true,
    };

    // 3. Fetch activities for the active connection
    const actRes = await db.query<ActivityRow>(
      `SELECT ba.id, ba.action_type, ba.action_text, ba.icon_type, ba.is_positive, ba.created_at,
              u.name as actor_name
       FROM buddy_activities ba
       JOIN users u ON ba.actor_id = u.id
       WHERE ba.connection_id = $1
       ORDER BY ba.created_at DESC
       LIMIT 10`,
      [activeConnId],
    );

    const activities: BuddyActivity[] = actRes.rows.map(a => {
      const d = new Date(a.created_at);
      const timeStr = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { weekday: 'long' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : 'Baru saja';

      return {
        id: a.id,
        userName: a.actor_name,
        action: a.action_text,
        timestamp: timeStr,
        isPositive: a.is_positive,
        iconType: (a.icon_type as any) || 'check',
      };
    });

    return {
      connectionId: targetRow.id,
      buddyId: activeBuddyId,
      buddyName: targetRow.buddy_name || 'Sahabat Sehat',
      buddyAvatarUrl: activeBuddyItem.avatarUrl,
      sharedStreakCount: activeBuddyItem.sharedStreakCount,
      userStatusThisWeek: activeUserStatus || 'recorded',
      buddyStatusThisWeek: activeBuddyStatus || 'recorded',
      userFriendCode,
      buddyFriendCode: targetRow.buddy_friend_code || undefined,
      activeBuddy: activeBuddyItem,
      friendsList,
      activities: activities.length > 0 ? activities : [
        {
          id: 'act_default',
          userName: targetRow.buddy_name || 'Sahabat Sehat',
          action: 'terhubung sebagai Buddy Sehat Fe-Tablet 🌸',
          timestamp: 'Hari ini',
          isPositive: true,
          iconType: 'heart',
        },
      ],
    };
  } catch (error) {
    console.error('Error in getBuddyStreakDataAction:', error);
    return {
      connectionId: '',
      buddyId: '',
      buddyName: '',
      buddyAvatarUrl: '',
      sharedStreakCount: 0,
      userStatusThisWeek: 'pending',
      buddyStatusThisWeek: 'pending',
      userFriendCode: 'FE-SARAH-9901',
      activeBuddy: null,
      friendsList: [],
      activities: [],
    };
  }
}

export async function removeBuddyAction(
  connectionId: string,
  userId: string,
): Promise<RemoveBuddyResult> {
  try {
    if (!connectionId || !userId) {
      return { success: false, error: 'Parameter tidak lengkap.' };
    }

    // Delete connection ensuring user is a participant
    const res = await db.query(
      `DELETE FROM buddy_connections 
       WHERE id = $1 AND (user_id = $2 OR buddy_user_id = $2)
       RETURNING id`,
      [connectionId, userId],
    );

    if (res.rowCount === 0) {
      return { success: false, error: 'Hubungan pertemanan tidak ditemukan atau sudah dihapus.' };
    }

    return { success: true, message: 'Buddy berhasil dihapus dari daftar teman.' };
  } catch (error: unknown) {
    console.error('Error in removeBuddyAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus teman';
    return { success: false, error: errMsg };
  }
}

export async function sendBuddyCheerAction(
  connectionId: string,
  senderId: string,
  receiverId: string,
  cheerType: CheerType = 'HEART',
  message?: string,
): Promise<SendCheerResult> {
  try {
    if (!senderId || !receiverId) {
      return { success: false, error: 'Sender dan Receiver ID wajib diisi.' };
    }

    // 1. Resolve actual connection_id if provided connectionId does not exist
    let validConnId = connectionId;
    const checkConn = await db.query(
      `SELECT id FROM buddy_connections 
       WHERE id = $1 AND (user_id = $2 OR buddy_user_id = $2)`,
      [connectionId, senderId],
    );

    if (checkConn.rows.length === 0) {
      // Try to find valid connection between sender and receiver
      const findConn = await db.query(
        `SELECT id FROM buddy_connections 
         WHERE ((user_id = $1 AND buddy_user_id = $2) OR (user_id = $2 AND buddy_user_id = $1))
           AND status = 'ACCEPTED'`,
        [senderId, receiverId],
      );

      if (findConn.rows.length > 0) {
        validConnId = findConn.rows[0].id;
      } else {
        return { success: false, error: 'Koneksi pertemanan tidak ditemukan di database.' };
      }
    }

    const cheerId = `chr_${Date.now().toString().slice(-6)}`;
    const actId = `act_${Date.now().toString().slice(-6)}`;

    await db.transaction(async client => {
      // 1. Insert cheer
      await client.query(
        `INSERT INTO buddy_cheers (id, connection_id, sender_id, receiver_id, cheer_type, message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cheerId, validConnId, senderId, receiverId, cheerType, message || null],
      );

      // 2. Insert activity
      await client.query(
        `INSERT INTO buddy_activities (id, connection_id, actor_id, action_type, action_text, icon_type, is_positive)
         VALUES ($1, $2, $3, 'CHEER_SENT', 'mengirimkan stiker semangat untukmu ❤️', 'heart', true)`,
        [actId, validConnId, senderId],
      );
    });

    return { success: true, cheerId };
  } catch (error: unknown) {
    console.error('Error in sendBuddyCheerAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal mengirim stiker semangat';
    return { success: false, error: errMsg };
  }
}

export async function addBuddyByCodeAction(
  userId: string,
  friendCode: string,
): Promise<AddBuddyResult> {
  try {
    const normalizedCode = friendCode.trim().toUpperCase();

    // 1. Search friend by friend_code
    const friendRes = await db.query<{ user_id: string; name: string }>(
      `SELECT p.user_id, u.name 
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE upper(p.friend_code) = $1`,
      [normalizedCode],
    );
    const friend = friendRes.rows[0];

    if (!friend) {
      return { success: false, error: `Kode teman '${friendCode}' tidak ditemukan.` };
    }

    if (friend.user_id === userId) {
      return { success: false, error: 'Anda tidak dapat menambahkan kode teman milik Anda sendiri.' };
    }

    // Check if already connected
    const existingConnRes = await db.query(
      `SELECT id FROM buddy_connections 
       WHERE (user_id = $1 AND buddy_user_id = $2) OR (user_id = $2 AND buddy_user_id = $1)`,
      [userId, friend.user_id],
    );

    if (existingConnRes.rows.length > 0) {
      // Re-activate if was removed or existing
      const existingId = existingConnRes.rows[0].id;
      await db.query(`UPDATE buddy_connections SET status = 'ACCEPTED' WHERE id = $1`, [existingId]);
      return { success: true, buddyName: friend.name };
    }

    const connId = `con_${userId}_${friend.user_id}`;
    const actId = `act_${Date.now().toString().slice(-6)}`;

    await db.transaction(async client => {
      await client.query(
        `INSERT INTO buddy_connections (id, user_id, buddy_user_id, status, shared_streak_count)
         VALUES ($1, $2, $3, 'ACCEPTED', 1)`,
        [connId, userId, friend.user_id],
      );

      await client.query(
        `INSERT INTO buddy_activities (id, connection_id, actor_id, action_type, action_text, icon_type, is_positive)
         VALUES ($1, $2, $3, 'CONNECTED', 'terhubung sebagai Buddy Sehat Fe-Tablet 🎉', 'flame', true)`,
        [actId, connId, userId],
      );
    });

    return { success: true, buddyName: friend.name };
  } catch (error: unknown) {
    console.error('Error in addBuddyByCodeAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menambahkan kawan baru.';
    return { success: false, error: errMsg };
  }
}
