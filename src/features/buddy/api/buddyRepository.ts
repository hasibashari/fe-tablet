'use server';

import db from '@/src/db/client';
import { calculateGroupChronologicalStreak } from '../utils/groupStreakCalculator';
import {
  BuddyGroupItem,
  BuddyGroupMember,
  BuddyGroupMessage,
  GroupChatDetail,
  CreateGroupResult,
  JoinGroupResult,
  AddGroupMemberResult,
  SendGroupMessageResult,
  LeaveGroupResult,
  GroupMessageType,
  CheerType,
  ConsumptionStatus,
} from '../types';

/**
 * 0. Calculate and sync dynamic group streak based on members' real consumption logs
 */
export async function calculateAndSyncGroupStreak(groupId: string): Promise<number> {
  try {
    const membersRes = await db.query<{ user_id: string }>(
      `SELECT user_id FROM buddy_group_members WHERE group_id = $1`,
      [groupId],
    );
    const memberIds = membersRes.rows.map(r => r.user_id);
    if (memberIds.length === 0) {
      await db.query(`UPDATE buddy_groups SET streak_count = 0 WHERE id = $1`, [groupId]);
      return 0;
    }

    const logsRes = await db.query<{ user_id: string; scheduled_date: string | Date }>(
      `SELECT user_id, scheduled_date 
       FROM consumption_logs 
       WHERE user_id = ANY($1) AND status IN ('ON_TIME', 'LATE')
       ORDER BY scheduled_date DESC`,
      [memberIds],
    );

    const completedLogs = logsRes.rows.map(r => ({
      userId: r.user_id,
      date: r.scheduled_date,
    }));

    const streak = calculateGroupChronologicalStreak(completedLogs, memberIds.length);

    await db.query(
      `UPDATE buddy_groups 
       SET streak_count = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [streak, groupId],
    );

    return streak;
  } catch (error) {
    console.error(`Error calculating group streak for ${groupId}:`, error);
    return 0;
  }
}

/**
 * Helper: Format timestamp into human-readable Indonesian format
 */
function formatTimestamp(dateStr?: string | Date | null): string {
  if (!dateStr) return 'Baru saja';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Baru saja';

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  if (isToday) return timeStr;

  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + timeStr;
}

/**
 * 1. Get all groups that a user is a member of
 */
export async function getUserGroupsAction(userId: string = 'usr_1'): Promise<BuddyGroupItem[]> {
  try {
    const groupsRes = await db.query<{
      id: string;
      name: string;
      description: string | null;
      group_code: string;
      creator_id: string | null;
      streak_count: number;
      avatar_url: string | null;
      created_at: string;
    }>(
      `SELECT g.id, g.name, g.description, g.group_code, g.creator_id, g.streak_count, g.avatar_url, g.created_at
       FROM buddy_groups g
       JOIN buddy_group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.updated_at DESC, g.created_at DESC`,
      [userId],
    );

    const groups = groupsRes.rows;
    if (groups.length === 0) return [];

    const groupIds = groups.map(g => g.id);

    // Batch 1 & 2: Concurrently fetch members and last messages for all groups
    const [membersRes, lastMsgsRes] = await Promise.all([
      db.query<{
        group_id: string;
        user_id: string;
        name: string;
        avatar_url: string | null;
        status_this_week: string | null;
      }>(
        `SELECT gm.group_id, u.id as user_id, u.name, u.avatar_url,
                (SELECT cl.status 
                 FROM consumption_logs cl 
                 WHERE cl.user_id = u.id 
                   AND cl.scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
                 ORDER BY cl.created_at DESC LIMIT 1) as status_this_week
         FROM buddy_group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = ANY($1)
         ORDER BY gm.joined_at ASC`,
        [groupIds],
      ),
      db.query<{
        group_id: string;
        content: string;
        sender_name: string | null;
        message_type: string;
        created_at: string;
      }>(
        `SELECT DISTINCT ON (m.group_id)
                m.group_id, m.content, u.name as sender_name, m.message_type, m.created_at
         FROM buddy_group_messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.group_id = ANY($1)
         ORDER BY m.group_id, m.created_at DESC`,
        [groupIds],
      ),
    ]);

    const membersByGroup = new Map<
      string,
      Array<{
        group_id: string;
        user_id: string;
        name: string;
        avatar_url: string | null;
        status_this_week: string | null;
      }>
    >();
    for (const m of membersRes.rows) {
      if (!membersByGroup.has(m.group_id)) {
        membersByGroup.set(m.group_id, []);
      }
      membersByGroup.get(m.group_id)!.push(m);
    }

    const lastMsgByGroup = new Map<string, (typeof lastMsgsRes.rows)[0]>();
    for (const msg of lastMsgsRes.rows) {
      lastMsgByGroup.set(msg.group_id, msg);
    }

    return groups.map(grp => {
      const members = membersByGroup.get(grp.id) || [];
      const memberCount = members.length;
      const membersSummary = members.map(m => m.name.split(' ')[0]);

      // Calculate weekly completion
      const completedCount = members.filter(
        m => m.status_this_week === 'ON_TIME' || m.status_this_week === 'LATE',
      ).length;
      const completionRate = memberCount > 0 ? Math.round((completedCount / memberCount) * 100) : 0;

      const lastMsg = lastMsgByGroup.get(grp.id);

      return {
        id: grp.id,
        name: grp.name,
        description: grp.description || undefined,
        groupCode: grp.group_code,
        creatorId: grp.creator_id,
        streakCount: Number(grp.streak_count) || 0,
        avatarUrl:
          grp.avatar_url ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(grp.name)}`,
        memberCount,
        membersSummary,
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              senderName: lastMsg.sender_name ? lastMsg.sender_name.split(' ')[0] : 'Sistem',
              timestamp: formatTimestamp(lastMsg.created_at),
              messageType: lastMsg.message_type as GroupMessageType,
            }
          : undefined,
        unreadCount: 0,
        weeklyCompletedCount: completedCount,
        weeklyTotalCount: memberCount,
        weeklyCompletionRate: completionRate,
        isCreator: grp.creator_id === userId,
      };
    });
  } catch (error) {
    console.error('Error in getUserGroupsAction:', error);
    return [];
  }
}

/**
 * 2. Get Group Chat Details with Strict Membership Authorization Guard
 */
export async function getGroupChatDetailsAction(
  groupId: string,
  userId: string = 'usr_1',
): Promise<GroupChatDetail | null> {
  try {
    if (!groupId || !userId) return null;

    // 1. Authorization Guard: Check if user is a valid member
    const checkMemberRes = await db.query<{ role: string }>(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId],
    );

    if (checkMemberRes.rows.length === 0) {
      console.warn(`Unauthorized access attempt to group ${groupId} by user ${userId}`);
      return null;
    }

    // 2. Fetch Group Metadata & Sync Streak dynamically from real logs
    const dynamicStreak = await calculateAndSyncGroupStreak(groupId);

    const grpRes = await db.query<{
      id: string;
      name: string;
      description: string | null;
      group_code: string;
      creator_id: string | null;
      streak_count: number;
      avatar_url: string | null;
    }>(`SELECT * FROM buddy_groups WHERE id = $1`, [groupId]);

    const grp = grpRes.rows[0];
    if (!grp) return null;

    // 3. Fetch All Members with profile data and weekly TTD status
    const membersRes = await db.query<{
      id: string;
      user_id: string;
      name: string;
      avatar_url: string | null;
      role: string;
      joined_at: string;
      friend_code: string | null;
      school_or_org: string | null;
      streak_count: number | null;
      status_this_week: string | null;
    }>(
      `SELECT gm.id, gm.user_id, u.name, u.avatar_url, gm.role, gm.joined_at,
              p.friend_code, p.school_or_org, p.streak_count,
              (SELECT cl.status 
               FROM consumption_logs cl 
               WHERE cl.user_id = u.id 
                 AND cl.scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
               ORDER BY cl.created_at DESC LIMIT 1) as status_this_week
       FROM buddy_group_members gm
       JOIN users u ON gm.user_id = u.id
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE gm.group_id = $1
       ORDER BY (CASE WHEN gm.role = 'admin' THEN 0 ELSE 1 END), gm.joined_at ASC`,
      [groupId],
    );

    const members: BuddyGroupMember[] = membersRes.rows.map(m => {
      let mappedStatus: ConsumptionStatus = 'pending';
      if (m.status_this_week === 'ON_TIME' || m.status_this_week === 'LATE') {
        mappedStatus = 'recorded';
      } else if (m.status_this_week === 'MISSED') {
        mappedStatus = 'missed';
      }

      return {
        id: m.id,
        userId: m.user_id,
        name: m.name,
        avatarUrl:
          m.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        friendCode: m.friend_code || 'FE-TEMAN-2026',
        role: (m.role as 'admin' | 'member') || 'member',
        schoolOrOrg: m.school_or_org || 'SMA Negeri 1 Sehat',
        streakCount: Number(m.streak_count) || 0,
        statusThisWeek: mappedStatus,
        joinedAt: formatTimestamp(m.joined_at),
      };
    });

    const memberCount = members.length;
    const completedCount = members.filter(m => m.statusThisWeek === 'recorded').length;
    const completionRate = memberCount > 0 ? Math.round((completedCount / memberCount) * 100) : 0;

    const groupItem: BuddyGroupItem = {
      id: grp.id,
      name: grp.name,
      description: grp.description || undefined,
      groupCode: grp.group_code,
      creatorId: grp.creator_id,
      streakCount: dynamicStreak,
      avatarUrl:
        grp.avatar_url ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(grp.name)}`,
      memberCount,
      membersSummary: members.map(m => m.name.split(' ')[0]),
      unreadCount: 0,
      weeklyCompletedCount: completedCount,
      weeklyTotalCount: memberCount,
      weeklyCompletionRate: completionRate,
      isCreator: grp.creator_id === userId,
    };

    // 4. Fetch Messages
    const msgsRes = await db.query<{
      id: string;
      group_id: string;
      sender_id: string | null;
      sender_name: string | null;
      sender_avatar_url: string | null;
      message_type: string;
      content: string;
      cheer_type: string | null;
      created_at: string;
    }>(
      `SELECT m.id, m.group_id, m.sender_id, u.name as sender_name, u.avatar_url as sender_avatar_url,
              m.message_type, m.content, m.cheer_type, m.created_at
       FROM buddy_group_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.group_id = $1
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [groupId],
    );

    const messages: BuddyGroupMessage[] = msgsRes.rows.map(msg => ({
      id: msg.id,
      groupId: msg.group_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name || 'Sistem FEMORY',
      senderAvatarUrl:
        msg.sender_avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.sender_name || 'Bot')}`,
      messageType: (msg.message_type as GroupMessageType) || 'text',
      content: msg.content,
      cheerType: (msg.cheer_type as CheerType) || null,
      timestamp: formatTimestamp(msg.created_at),
      isSelf: msg.sender_id === userId,
    }));

    return {
      group: groupItem,
      members,
      messages,
    };
  } catch (error) {
    console.error('Error in getGroupChatDetailsAction:', error);
    return null;
  }
}

/**
 * 3. Create a New Buddy Group
 */
export async function createBuddyGroupAction(
  creatorId: string,
  name: string,
  description?: string,
  initialFriendCodes?: string[],
): Promise<CreateGroupResult> {
  try {
    if (!creatorId || !name.trim()) {
      return { success: false, error: 'Nama grup wajib diisi.' };
    }

    const trimmedName = name.trim();
    const groupId = `grp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanPrefix =
      trimmedName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 5)
        .toUpperCase() || 'TTD';
    const groupCode = `GRP-${cleanPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedName)}`;

    // Get Creator Name
    const creatorRes = await db.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [
      creatorId,
    ]);
    const creatorName = creatorRes.rows[0]?.name || 'Sahabat Sehat';

    await db.transaction(async client => {
      // 1. Insert Group with streak_count = 0 initially
      await client.query(
        `INSERT INTO buddy_groups (id, name, description, group_code, creator_id, streak_count, avatar_url)
         VALUES ($1, $2, $3, $4, $5, 0, $6)`,
        [groupId, trimmedName, description?.trim() || null, groupCode, creatorId, avatarUrl],
      );

      // 2. Insert Creator as Admin
      const creatorMemberId = `gmb_${Date.now().toString(36)}_adm`;
      await client.query(
        `INSERT INTO buddy_group_members (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'admin')`,
        [creatorMemberId, groupId, creatorId],
      );

      // 3. Add initial friends by Friend Code if provided
      if (initialFriendCodes && initialFriendCodes.length > 0) {
        for (const code of initialFriendCodes) {
          const cleanCode = code.trim().toUpperCase();
          if (!cleanCode) continue;

          const friendRes = await client.query<{ user_id: string }>(
            `SELECT user_id FROM user_profiles WHERE UPPER(friend_code) = $1`,
            [cleanCode],
          );
          const friend = friendRes.rows[0];
          if (friend && friend.user_id !== creatorId) {
            const memberId = `gmb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
            await client.query(
              `INSERT INTO buddy_group_members (id, group_id, user_id, role)
               VALUES ($1, $2, $3, 'member')
               ON CONFLICT (group_id, user_id) DO NOTHING`,
              [memberId, groupId, friend.user_id],
            );
          }
        }
      }

      // 4. Insert Welcome System Message
      const sysMsgId = `gmsg_${Date.now().toString(36)}_init`;
      await client.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, $3, 'system', $4)`,
        [
          sysMsgId,
          groupId,
          creatorId,
          `🎉 ${creatorName} membuat grup "${trimmedName}". Ayo saling menyemangati minum TTD setiap minggu! 🌸`,
        ],
      );
    });

    // 5. Dynamic chronological streak calculation for new group
    const initialStreak = await calculateAndSyncGroupStreak(groupId);

    const createdGroup: BuddyGroupItem = {
      id: groupId,
      name: trimmedName,
      description: description?.trim() || undefined,
      groupCode,
      creatorId,
      streakCount: initialStreak,
      avatarUrl,
      memberCount: 1 + (initialFriendCodes?.length || 0),
      membersSummary: [creatorName.split(' ')[0]],
      unreadCount: 0,
      weeklyCompletedCount: 0,
      weeklyTotalCount: 1,
      weeklyCompletionRate: 0,
      isCreator: true,
    };

    return { success: true, group: createdGroup };
  } catch (error: unknown) {
    console.error('Error in createBuddyGroupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat grup baru.';
    return { success: false, error: errMsg };
  }
}

/**
 * 4. Join an Existing Buddy Group by Group Code
 */
export async function joinGroupByCodeAction(
  userId: string,
  groupCode: string,
): Promise<JoinGroupResult> {
  try {
    if (!userId || !groupCode.trim()) {
      return { success: false, error: 'Kode grup wajib diisi.' };
    }

    const cleanCode = groupCode.trim().toUpperCase();

    // 1. Find group
    const grpRes = await db.query<{
      id: string;
      name: string;
      description: string | null;
      group_code: string;
      creator_id: string | null;
      streak_count: number;
      avatar_url: string | null;
    }>(`SELECT * FROM buddy_groups WHERE UPPER(group_code) = $1`, [cleanCode]);

    const grp = grpRes.rows[0];
    if (!grp) {
      return { success: false, error: `Grup dengan kode '${groupCode}' tidak ditemukan.` };
    }

    // 2. Check if already member
    const memberCheck = await db.query(
      `SELECT id FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [grp.id, userId],
    );

    if (memberCheck.rows.length > 0) {
      return {
        success: true,
        group: {
          id: grp.id,
          name: grp.name,
          description: grp.description || undefined,
          groupCode: grp.group_code,
          creatorId: grp.creator_id,
          streakCount: Number(grp.streak_count) || 0,
          avatarUrl: grp.avatar_url || undefined,
          memberCount: 1,
          membersSummary: [],
          unreadCount: 0,
          weeklyCompletedCount: 0,
          weeklyTotalCount: 1,
          weeklyCompletionRate: 0,
          isCreator: grp.creator_id === userId,
        },
      };
    }

    // 3. Get User Name
    const userRes = await db.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [
      userId,
    ]);
    const userName = userRes.rows[0]?.name || 'Sahabat Sehat';

    const memberId = `gmb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const msgId = `gmsg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    await db.transaction(async client => {
      // Add member
      await client.query(
        `INSERT INTO buddy_group_members (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'member')`,
        [memberId, grp.id, userId],
      );

      // Post system announcement
      await client.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, $3, 'system', $4)`,
        [msgId, grp.id, userId, `👋 ${userName} bergabung ke dalam grup!`],
      );
    });

    const freshStreak = await calculateAndSyncGroupStreak(grp.id);

    return {
      success: true,
      group: {
        id: grp.id,
        name: grp.name,
        description: grp.description || undefined,
        groupCode: grp.group_code,
        creatorId: grp.creator_id,
        streakCount: freshStreak,
        avatarUrl: grp.avatar_url || undefined,
        memberCount: 2,
        membersSummary: [userName.split(' ')[0]],
        unreadCount: 0,
        weeklyCompletedCount: 0,
        weeklyTotalCount: 2,
        weeklyCompletionRate: 0,
        isCreator: false,
      },
    };
  } catch (error: unknown) {
    console.error('Error in joinGroupByCodeAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal bergabung ke dalam grup.';
    return { success: false, error: errMsg };
  }
}

/**
 * 5. Add Member to Group by Friend Code
 */
export async function addMemberToGroupAction(
  groupId: string,
  requesterId: string,
  friendCode: string,
): Promise<AddGroupMemberResult> {
  try {
    if (!groupId || !friendCode.trim()) {
      return { success: false, error: 'Kode teman wajib diisi.' };
    }

    // 1. Verify requester is in the group
    const checkReq = await db.query(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, requesterId],
    );
    if (checkReq.rows.length === 0) {
      return { success: false, error: 'Anda bukan anggota dari grup ini.' };
    }

    const cleanCode = friendCode.trim().toUpperCase();

    // 2. Find friend
    const friendRes = await db.query<{
      user_id: string;
      name: string;
      avatar_url: string | null;
      school_or_org: string | null;
      streak_count: number | null;
    }>(
      `SELECT p.user_id, u.name, u.avatar_url, p.school_or_org, p.streak_count
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE UPPER(p.friend_code) = $1`,
      [cleanCode],
    );

    const friend = friendRes.rows[0];
    if (!friend) {
      return { success: false, error: `Kode teman '${friendCode}' tidak ditemukan.` };
    }

    // 3. Check if already member
    const existingMember = await db.query(
      `SELECT id FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, friend.user_id],
    );
    if (existingMember.rows.length > 0) {
      return { success: false, error: `${friend.name} sudah menjadi anggota grup ini.` };
    }

    // Get Requester Name
    const reqUserRes = await db.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [
      requesterId,
    ]);
    const requesterName = reqUserRes.rows[0]?.name || 'Anggota Grup';

    const memberId = `gmb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const msgId = `gmsg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    await db.transaction(async client => {
      // Insert member
      await client.query(
        `INSERT INTO buddy_group_members (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'member')`,
        [memberId, groupId, friend.user_id],
      );

      // Post system announcement
      await client.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, $3, 'system', $4)`,
        [
          msgId,
          groupId,
          requesterId,
          `👋 ${friend.name} ditambahkan ke dalam grup oleh ${requesterName}!`,
        ],
      );
    });

    // Sync group streak dynamically
    await calculateAndSyncGroupStreak(groupId);

    const newMember: BuddyGroupMember = {
      id: memberId,
      userId: friend.user_id,
      name: friend.name,
      avatarUrl:
        friend.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friend.name)}`,
      friendCode: cleanCode,
      role: 'member',
      schoolOrOrg: friend.school_or_org || 'SMA Negeri 1 Sehat',
      streakCount: Number(friend.streak_count) || 0,
      statusThisWeek: 'pending',
      joinedAt: 'Hari ini',
    };

    return { success: true, member: newMember };
  } catch (error: unknown) {
    console.error('Error in addMemberToGroupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menambahkan anggota ke grup.';
    return { success: false, error: errMsg };
  }
}

/**
 * 6. Send a Message / Quick Cheer in Group Chat
 */
export async function sendGroupMessageAction(
  groupId: string,
  senderId: string,
  content: string,
  messageType: GroupMessageType = 'text',
  cheerType?: CheerType,
): Promise<SendGroupMessageResult> {
  try {
    if (!groupId || !senderId || !content.trim()) {
      return { success: false, error: 'Pesan tidak boleh kosong.' };
    }

    // 1. Verify sender is a member
    const checkMember = await db.query(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, senderId],
    );
    if (checkMember.rows.length === 0) {
      return { success: false, error: 'Anda bukan anggota grup ini.' };
    }

    // 2. Fetch sender info
    const senderRes = await db.query<{ name: string; avatar_url: string | null }>(
      `SELECT name, avatar_url FROM users WHERE id = $1`,
      [senderId],
    );
    const sender = senderRes.rows[0];
    const senderName = sender?.name || 'Siswi Sehat';
    const senderAvatarUrl =
      sender?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`;

    const msgId = `gmsg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    await db.query(
      `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content, cheer_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [msgId, groupId, senderId, messageType, content.trim(), cheerType || null],
    );

    // Update group updated_at
    await db.query(`UPDATE buddy_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [
      groupId,
    ]);

    const newMessage: BuddyGroupMessage = {
      id: msgId,
      groupId,
      senderId,
      senderName,
      senderAvatarUrl,
      messageType,
      content: content.trim(),
      cheerType: cheerType || null,
      timestamp: 'Baru saja',
      isSelf: true,
    };

    return { success: true, message: newMessage };
  } catch (error: unknown) {
    console.error('Error in sendGroupMessageAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal mengirim pesan.';
    return { success: false, error: errMsg };
  }
}

/**
 * 7. Leave or Delete Group
 */
export async function leaveOrDeleteGroupAction(
  groupId: string,
  userId: string,
): Promise<LeaveGroupResult> {
  try {
    if (!groupId || !userId) {
      return { success: false, error: 'Parameter tidak valid.' };
    }

    // Get User Name
    const userRes = await db.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [
      userId,
    ]);
    const userName = userRes.rows[0]?.name || 'Anggota';

    // Delete membership
    const delRes = await db.query(
      `DELETE FROM buddy_group_members WHERE group_id = $1 AND user_id = $2 RETURNING id`,
      [groupId, userId],
    );

    if (delRes.rowCount === 0) {
      return { success: false, error: 'Anda tidak terdaftar dalam grup ini.' };
    }

    // Check remaining members
    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM buddy_group_members WHERE group_id = $1`,
      [groupId],
    );
    const remainingCount = Number(countRes.rows[0]?.count) || 0;

    if (remainingCount === 0) {
      // Clean delete group if 0 members remain
      await db.query(`DELETE FROM buddy_groups WHERE id = $1`, [groupId]);
      return { success: true, message: 'Grup berhasil dihapus.' };
    } else {
      // Post system announcement
      const msgId = `gmsg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
      await db.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, NULL, 'system', $3)`,
        [msgId, groupId, `🚪 ${userName} telah keluar dari grup.`],
      );
      return { success: true, message: 'Anda berhasil keluar dari grup.' };
    }
  } catch (error: unknown) {
    console.error('Error in leaveOrDeleteGroupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal keluar dari grup.';
    return { success: false, error: errMsg };
  }
}

/**
 * 7b. Update Group Info (Name & Description) - Admin Only
 */
export async function updateBuddyGroupAction(
  groupId: string,
  requesterId: string,
  data: { name: string; description?: string },
): Promise<{ success: boolean; group?: BuddyGroupItem; error?: string }> {
  try {
    if (!groupId || !requesterId || !data.name.trim()) {
      return { success: false, error: 'Nama grup tidak boleh kosong.' };
    }

    // 1. Verify requester is admin or creator
    const checkAdmin = await db.query<{ role: string; creator_id: string | null }>(
      `SELECT gm.role, g.creator_id 
       FROM buddy_group_members gm
       JOIN buddy_groups g ON gm.group_id = g.id
       WHERE gm.group_id = $1 AND gm.user_id = $2`,
      [groupId, requesterId],
    );

    if (checkAdmin.rows.length === 0) {
      return { success: false, error: 'Anda bukan anggota dari grup ini.' };
    }

    const row = checkAdmin.rows[0];
    if (row.role !== 'admin' && row.creator_id !== requesterId) {
      return { success: false, error: 'Hanya admin yang dapat mengubah info grup.' };
    }

    const trimmedName = data.name.trim();
    const trimmedDesc = data.description?.trim() || null;

    // 2. Update Group
    await db.query(
      `UPDATE buddy_groups 
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [trimmedName, trimmedDesc, groupId],
    );

    // 3. Post system announcement
    const userRes = await db.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [
      requesterId,
    ]);
    const userName = userRes.rows[0]?.name || 'Admin';

    const msgId = `gmsg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    await db.query(
      `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
       VALUES ($1, $2, $3, 'system', $4)`,
      [msgId, groupId, requesterId, `✏️ ${userName} memperbarui informasi grup: "${trimmedName}"`],
    );

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in updateBuddyGroupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui grup.';
    return { success: false, error: errMsg };
  }
}

/**
 * 7c. Delete Group Permanently - Admin Only
 */
export async function deleteBuddyGroupAction(
  groupId: string,
  requesterId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!groupId || !requesterId) {
      return { success: false, error: 'Parameter tidak valid.' };
    }

    // 1. Verify requester is admin or creator
    const checkAdmin = await db.query<{ role: string; creator_id: string | null }>(
      `SELECT gm.role, g.creator_id 
       FROM buddy_group_members gm
       JOIN buddy_groups g ON gm.group_id = g.id
       WHERE gm.group_id = $1 AND gm.user_id = $2`,
      [groupId, requesterId],
    );

    if (checkAdmin.rows.length === 0) {
      return { success: false, error: 'Anda bukan anggota dari grup ini.' };
    }

    const row = checkAdmin.rows[0];
    if (row.role !== 'admin' && row.creator_id !== requesterId) {
      return { success: false, error: 'Hanya admin atau pembuat grup yang dapat menghapus grup.' };
    }

    // 2. Delete group (Cascade automatically removes members and messages)
    await db.query(`DELETE FROM buddy_groups WHERE id = $1`, [groupId]);

    return { success: true, message: 'Grup berhasil dihapus secara permanen.' };
  } catch (error: unknown) {
    console.error('Error in deleteBuddyGroupAction:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus grup.';
    return { success: false, error: errMsg };
  }
}

/**
 * 8. Get Primary Group Summary for Dashboard Widget
 */
export async function getPrimaryUserGroupSummaryAction(
  userId: string = 'usr_1',
): Promise<BuddyGroupItem | null> {
  try {
    const groups = await getUserGroupsAction(userId);
    if (groups.length > 0) {
      return groups[0];
    }
    return null;
  } catch (error) {
    console.error('Error in getPrimaryUserGroupSummaryAction:', error);
    return null;
  }
}
