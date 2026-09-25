export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth: string;
  bloodType: string;
  height: number;
  weight: number;
}

export interface StreakResult {
  streakCount: number;
  consecutiveDates: string[];
  streakUnit: 'Hari' | 'Minggu';
  isActive: boolean;
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

export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    streakCount: number;
    streakUnit?: 'Hari' | 'Minggu';
    consecutiveDates?: string[];
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
  activeBuddy: {
    connectionId: string;
    buddyId: string;
    buddyName: string;
    buddyAvatarUrl: string;
    sharedStreakCount: number;
    userStatusThisWeek: 'recorded' | 'missed' | 'pending';
    buddyStatusThisWeek: 'recorded' | 'missed' | 'pending';
  } | null;
}
