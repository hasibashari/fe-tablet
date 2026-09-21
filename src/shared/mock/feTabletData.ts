export type ConsumptionStatus = 'recorded' | 'missed' | 'pending'

export interface UserProfileMock {
  id: string
  name: string
  email: string
  phone: string
  schoolOrOrg: string
  streakCount: number
  levelTitle: string
  avatarUrl: string
  hbLevel?: number
  lastCheckDate?: string
}

export interface ReminderScheduleMock {
  id: string
  dayOfWeek: string // e.g. "Sabtu"
  time: string // e.g. "08:00"
  tabletName: string // "Tablet Tambah Darah (TTD)"
  dosage: string // "1 tablet, 1x seminggu"
  frequency: string // "Mingguan" | "Harian"
  isEnabled: boolean
  remind15MinBefore: boolean
  nextDate: string // e.g. "Sabtu, 10 Oktober 2026"
  daysRemaining: number
}

export interface TodayStatusMock {
  status: ConsumptionStatus
  scheduledDate: string
  scheduledTime: string
  takenAt?: string
  tabletName: string
}

export interface WeeklyHistoryItemMock {
  id: string
  weekNumber: number
  dateRange: string
  scheduledDateTime: string
  status: ConsumptionStatus
  recordedTime?: string
}

export interface MonthlyTrendMock {
  month: string
  count: number
  target: number
}

export interface EducationArticleMock {
  id: string
  title: string
  category: 'Anemia' | 'TTD' | 'Nutrisi' | 'Gaya Hidup' | 'Mitos & Fakta'
  readTime: string
  summary: string
  imageUrl: string
  isFeatured?: boolean
  publishDate: string
  author: string
}

export interface BuddyStreakMock {
  buddyId: string
  buddyName: string
  buddyAvatar: string
  streakCount: number
  thisWeekStatus: ConsumptionStatus
  lastCheerReceived?: string
  activities: {
    id: string
    userName: string
    action: string
    timestamp: string
    isPositive: boolean
    iconType: 'check' | 'flame' | 'heart' | 'alert'
  }[]
}

export interface ConsultationTopicMock {
  id: string
  icon: string
  title: string
  category: string
  prompt: string
  initialAnswer: string
}

export interface ChatMessageMock {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

// -------------------------------------------------------------
// DEFAULT MOCK STORE VALUES
// -------------------------------------------------------------

export const MOCK_USER: UserProfileMock = {
  id: 'usr_fe_1',
  name: 'Sarah Azzahra',
  email: 'sarah@email.com',
  phone: '0812-3456-7890',
  schoolOrOrg: 'SMA Negeri 1 Sehat',
  streakCount: 6,
  levelTitle: 'Super Consistent (Level 3)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  hbLevel: 12.4,
  lastCheckDate: '15 September 2026',
}

export const MOCK_REMINDER: ReminderScheduleMock = {
  id: 'sch_fe_1',
  dayOfWeek: 'Sabtu',
  time: '08:00',
  tabletName: 'Tablet Tambah Darah (Sulfas Ferosus / Ferrous Fumarate)',
  dosage: '1 tablet, 1x seminggu',
  frequency: 'Mingguan',
  isEnabled: true,
  remind15MinBefore: true,
  nextDate: 'Sabtu, 10 Oktober 2026',
  daysRemaining: 2,
}

export const MOCK_TODAY_STATUS: TodayStatusMock = {
  status: 'pending',
  scheduledDate: '21 September 2026',
  scheduledTime: '08:00 WIB',
  tabletName: 'Tablet Tambah Darah (TTD)',
}

export const MOCK_WEEKLY_HISTORY: WeeklyHistoryItemMock[] = [
  {
    id: 'wk_1',
    weekNumber: 1,
    dateRange: '28 Sep – 4 Okt 2026',
    scheduledDateTime: 'Sabtu, 3 Okt 2026 • 08:00 WIB',
    status: 'recorded',
    recordedTime: '08:15 WIB',
  },
  {
    id: 'wk_2',
    weekNumber: 2,
    dateRange: '5 Okt – 11 Okt 2026',
    scheduledDateTime: 'Sabtu, 10 Okt 2026 • 08:00 WIB',
    status: 'recorded',
    recordedTime: '08:05 WIB',
  },
  {
    id: 'wk_3',
    weekNumber: 3,
    dateRange: '12 Okt – 18 Okt 2026',
    scheduledDateTime: 'Sabtu, 17 Okt 2026 • 08:00 WIB',
    status: 'missed',
  },
  {
    id: 'wk_4',
    weekNumber: 4,
    dateRange: '19 Okt – 25 Okt 2026',
    scheduledDateTime: 'Sabtu, 24 Okt 2026 • 08:00 WIB',
    status: 'recorded',
    recordedTime: '08:20 WIB',
  },
]

export const MOCK_MONTHLY_TREND: MonthlyTrendMock[] = [
  { month: 'Mei', count: 4, target: 4 },
  { month: 'Jun', count: 3, target: 4 },
  { month: 'Jul', count: 4, target: 4 },
  { month: 'Agu', count: 2, target: 4 },
  { month: 'Sep', count: 4, target: 4 },
  { month: 'Okt', count: 4, target: 4 },
]

export const MOCK_EDUCATION_ARTICLES: EducationArticleMock[] = [
  {
    id: 'art_1',
    title: 'Kenali Anemia: Penyebab, Gejala 5L, dan Dampaknya pada Remaja Putri',
    category: 'Anemia',
    readTime: '4 Menit Baca',
    summary: 'Pahami mengapa remaja putri rentan anemia saat menstruasi dan bagaimana cara mendeteksi tanda-tanda 5L (Lesu, Lelah, Letih, Lemah, Lalai).',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    isFeatured: true,
    publishDate: '18 September 2026',
    author: 'Tim Medis Fe-Tablet',
  },
  {
    id: 'art_2',
    title: 'Cara Minum Tablet Tambah Darah yang Benar Tanpa Rasa Mual',
    category: 'TTD',
    readTime: '3 Menit Baca',
    summary: 'Tips praktis minum TTD setelah makan malam atau menjelang tidur dengan air putih atau jus jeruk kaya vitamin C.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    publishDate: '14 September 2026',
    author: 'dr. Aliyah Sp.A',
  },
  {
    id: 'art_3',
    title: 'Daftar Makanan Lezat Sumber Zat Besi Tinggi untuk Remaja',
    category: 'Nutrisi',
    readTime: '5 Menit Baca',
    summary: 'Hati ayam, bayam, telur, dan daging sapi sebagai kombinasi sempurna pendamping suplemen darah harian.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    publishDate: '10 September 2026',
    author: 'Ahli Gizi Puskesmas',
  },
  {
    id: 'art_4',
    title: 'Mitos & Fakta: Apakah TTD Membuat Tekanan Darah Tinggi?',
    category: 'Mitos & Fakta',
    readTime: '3 Menit Baca',
    summary: 'Perbedaan mendasar antara darah rendah (hipotensi) dan kurang darah (anemia defisiensi besi).',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    publishDate: '05 September 2026',
    author: 'Kemenkes RI',
  },
  {
    id: 'art_5',
    title: 'Gaya Hidup Bugar & Tidur Cukup untuk Menjaga Hemoglobin Optimal',
    category: 'Gaya Hidup',
    readTime: '4 Menit Baca',
    summary: 'Pentingnya istirahat teratur dan hidrasi cukup dalam membantu penyerapan mikronutrien tubuh.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    publishDate: '01 September 2026',
    author: 'dr. Fajar Pratama',
  },
]

export const MOCK_BUDDY: BuddyStreakMock = {
  buddyId: 'usr_fe_2',
  buddyName: 'Alya Safitri',
  buddyAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  streakCount: 6,
  thisWeekStatus: 'recorded',
  lastCheerReceived: '1 jam lalu',
  activities: [
    {
      id: 'act_1',
      userName: 'Alya Safitri',
      action: 'mencatat konsumsi TTD tepat waktu',
      timestamp: 'Sabtu, 08:30 WIB',
      isPositive: true,
      iconType: 'check',
    },
    {
      id: 'act_2',
      userName: 'Sarah Azzahra',
      action: 'mencatat konsumsi TTD tepat waktu',
      timestamp: 'Sabtu, 08:15 WIB',
      isPositive: true,
      iconType: 'check',
    },
    {
      id: 'act_3',
      userName: 'Alya Safitri',
      action: 'mengirimkan stiker semangat untukmu ❤️',
      timestamp: 'Jumat, 19:00 WIB',
      isPositive: true,
      iconType: 'heart',
    },
    {
      id: 'act_4',
      userName: 'Sarah Azzahra',
      action: 'menyelesaikan streak 6 minggu berturut-turut! 🔥',
      timestamp: 'Minggu lalu',
      isPositive: true,
      iconType: 'flame',
    },
  ],
}

export const MOCK_CONSULTATION_TOPICS: ConsultationTopicMock[] = [
  {
    id: 'top_1',
    icon: '🍋',
    title: 'Bolehkah minum TTD bersama air jeruk?',
    category: 'Cara Konsumsi',
    prompt: 'Bolehkah saya minum tablet tambah darah bersama jus jeruk atau air lemon?',
    initialAnswer: 'Sangat boleh dan dianjurkan! Vitamin C yang terkandung dalam air jeruk, lemon, atau buah segar membantu meningkatkan penyerapan zat besi non-heme di lambung hingga 2-3 kali lipat.',
  },
  {
    id: 'top_2',
    icon: '🤢',
    title: 'Tips atasi rasa mual setelah minum tablet',
    category: 'Efek Samping',
    prompt: 'Bagaimana cara mengatasi rasa mual atau begah di perut setelah minum TTD?',
    initialAnswer: 'Rasa mual ringan adalah reaksi adaptasi normal tubuh terhadap zat besi. Untuk mengatasinya: 1) Minum TTD tepat setelah makan malam atau sebelum tidur, 2) Jangan minum saat perut kosong, 3) Minum bersama segelas air putih hangat.',
  },
  {
    id: 'top_3',
    icon: '☕',
    title: 'Mengapa harus hindari teh dan kopi?',
    category: 'Pantangan',
    prompt: 'Mengapa kita tidak boleh minum TTD bersamaan dengan teh atau kopi?',
    initialAnswer: 'Teh dan kopi mengandung senyawa tanin dan polifenol yang dapat mengikat zat besi sebelum sempat diserap oleh usus, sehingga efektivitas TTD bisa turun lebih dari 50%. Beri jeda minimal 2 jam jika ingin menikmati teh/kopi.',
  },
  {
    id: 'top_4',
    icon: '🩸',
    title: 'Berapa kadar Hb normal remaja putri?',
    category: 'Kadar Hb',
    prompt: 'Berapa angka kadar hemoglobin (Hb) yang normal untuk remaja putri?',
    initialAnswer: 'Kadar hemoglobin (Hb) normal untuk remaja putri usia 12-18 tahun adalah minimal 12.0 g/dL. Jika hasil pemeriksaan menunjukkan di bawah 12.0 g/dL, seseorang dikategorikan mengalami anemia dan disarankan konsumsi TTD sesuai anjuran tenaga medis.',
  },
]

export const MOCK_INITIAL_CHAT: ChatMessageMock[] = [
  {
    id: 'msg_1',
    sender: 'assistant',
    text: 'Halo Sarah! 🌸 Saya Asisten Pintar Fe-Tablet. Ada yang ingin kamu tanyakan seputar jadwal minum TTD, tips cegah mual, atau panduan anemia?',
    timestamp: '08:00 WIB',
  },
]
