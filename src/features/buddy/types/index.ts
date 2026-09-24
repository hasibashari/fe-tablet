export type ConsumptionStatus = 'recorded' | 'missed' | 'pending';
export type CheerType = 'HEART' | 'FLAME' | 'STAR' | 'CLAP';
export type IconType = 'check' | 'flame' | 'heart' | 'alert';

export interface BuddyActivity {
  id: string;
  userName: string;
  action: string;
  timestamp: string;
  isPositive: boolean;
  iconType: IconType;
}

export interface BuddyItem {
  connectionId: string;
  buddyId: string;
  name: string;
  avatarUrl: string;
  friendCode: string;
  sharedStreakCount: number;
  statusThisWeek: ConsumptionStatus;
  schoolOrOrg?: string;
  isActive: boolean;
}

export interface BuddyStreakData {
  connectionId: string;
  buddyId: string;
  buddyName: string;
  buddyAvatarUrl: string;
  sharedStreakCount: number;
  userStatusThisWeek: ConsumptionStatus;
  buddyStatusThisWeek: ConsumptionStatus;
  userFriendCode: string;
  buddyFriendCode?: string;
  activeBuddy: BuddyItem | null;
  friendsList: BuddyItem[];
  activities: BuddyActivity[];
}

export interface SendCheerResult {
  success: boolean;
  cheerId?: string;
  error?: string;
}

export interface AddBuddyResult {
  success: boolean;
  buddyName?: string;
  error?: string;
}

export interface RemoveBuddyResult {
  success: boolean;
  message?: string;
  error?: string;
}
