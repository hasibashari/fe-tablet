import { Reminder } from '../../features/schedule/types'

// Helper function to get date string in YYYY-MM-DD format with day offset
const getOffsetDateString = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

const today = getOffsetDateString(0)
const yesterday = getOffsetDateString(-1)
const tomorrow = getOffsetDateString(1)
const inTwoDays = getOffsetDateString(2)

export const MOCK_REMINDERS: Reminder[] = [
  // Today's Reminders
  {
    id: '1',
    title: 'Obat Jantung (Aspirin)',
    description: 'Diminum sesudah makan pagi',
    time: '08:00',
    date: today,
    status: 'COMPLETED',
    type: 'MEDICATION'
  },
  {
    id: '2',
    title: 'Vitamin D3 & Omega-3',
    description: 'Suplemen harian',
    time: '12:00',
    date: today,
    status: 'PENDING',
    type: 'MEDICATION'
  },
  {
    id: '3',
    title: 'Cek Tensi Darah',
    description: 'Gunakan tensimeter di lengan kiri',
    time: '15:00',
    date: today,
    status: 'PENDING',
    type: 'CHECKUP'
  },
  {
    id: '4',
    title: 'Obat Kolesterol (Simvastatin)',
    description: 'Diminum sebelum tidur',
    time: '21:00',
    date: today,
    status: 'PENDING',
    type: 'MEDICATION'
  },
  // Yesterday's Reminders
  {
    id: '5',
    title: 'Obat Jantung (Aspirin)',
    time: '08:00',
    date: yesterday,
    status: 'COMPLETED',
    type: 'MEDICATION'
  },
  {
    id: '6',
    title: 'Jalan Santai 30 Menit',
    time: '16:00',
    date: yesterday,
    status: 'MISSED',
    type: 'EXERCISE'
  },
  // Tomorrow's Reminders
  {
    id: '7',
    title: 'Obat Jantung (Aspirin)',
    description: 'Diminum sesudah makan pagi',
    time: '08:00',
    date: tomorrow,
    status: 'PENDING',
    type: 'MEDICATION'
  },
  {
    id: '8',
    title: 'Konsultasi Dokter Spesialis',
    description: 'Klinik Medika Utama - Lantai 2',
    time: '10:30',
    date: tomorrow,
    status: 'PENDING',
    type: 'CHECKUP'
  },
  {
    id: '9',
    title: 'Fisioterapi Bahu',
    description: 'Latihan rutin 45 menit',
    time: '16:00',
    date: inTwoDays,
    status: 'PENDING',
    type: 'EXERCISE'
  }
]

export const MOCK_PROFILE = {
  id: 'usr_1',
  name: 'Budi Santoso',
  email: 'budi.santoso@example.com',
  phone: '+62 812-3456-7890',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
  dateOfBirth: '1985-05-15',
  bloodType: 'O+',
  height: 170, // cm
  weight: 70, // kg
}
