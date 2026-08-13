import { ConsumptionLog, ConsumptionStats } from '../types'

// Helper untuk format tanggal offset (0 = hari ini, -1 = kemarin, dst)
const getOffsetDate = (offsetDays: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

export const MOCK_CONSUMPTION_LOGS: ConsumptionLog[] = [
  // HARI INI (0)
  {
    id: 'log-today-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(0),
    scheduledTime: '08:00',
    takenAt: '08:05',
    status: 'ON_TIME',
    notes: 'Diminum sesudah sarapan bubur ayam',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-today-2',
    title: 'Vitamin D3 & Omega-3',
    category: 'MEDICATION',
    dosage: '1 Kapsul Lunak (1000 IU)',
    scheduledDate: getOffsetDate(0),
    scheduledTime: '12:00',
    takenAt: '12:15',
    status: 'ON_TIME',
    notes: 'Diminum bersama makan siang',
    takenBy: 'Pasien Mandiri',
  },

  // KEMARIN (-1)
  {
    id: 'log-yest-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-1),
    scheduledTime: '08:00',
    takenAt: '08:12',
    status: 'ON_TIME',
    notes: 'Diminum sesudah makan pagi',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-yest-2',
    title: 'Vitamin D3 & Omega-3',
    category: 'MEDICATION',
    dosage: '1 Kapsul Lunak (1000 IU)',
    scheduledDate: getOffsetDate(-1),
    scheduledTime: '12:00',
    takenAt: '12:05',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-yest-3',
    title: 'Jalan Santai 30 Menit',
    category: 'EXERCISE',
    dosage: '30 Menit di Sekitar Rumah',
    scheduledDate: getOffsetDate(-1),
    scheduledTime: '16:00',
    status: 'MISSED',
    notes: 'Hujan deras sore hari, tidak sempat olahraga',
  },
  {
    id: 'log-yest-4',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-1),
    scheduledTime: '21:00',
    takenAt: '22:30',
    status: 'LATE',
    notes: 'Diminum terlambat karena tertidur sebelum jadwal',
    takenBy: 'Pasien Mandiri',
  },

  // 2 HARI LALU (-2)
  {
    id: 'log-d2-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-2),
    scheduledTime: '08:00',
    takenAt: '08:00',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d2-2',
    title: 'Pemeriksaan Tensi Darah Mandiri',
    category: 'CHECKUP',
    dosage: 'Pengukuran Lengan Kiri',
    scheduledDate: getOffsetDate(-2),
    scheduledTime: '09:00',
    takenAt: '09:10',
    status: 'ON_TIME',
    notes: 'Hasil tensi: 124/82 mmHg (Stabil)',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d2-3',
    title: 'Vitamin D3 & Omega-3',
    category: 'MEDICATION',
    dosage: '1 Kapsul Lunak',
    scheduledDate: getOffsetDate(-2),
    scheduledTime: '12:00',
    takenAt: '12:20',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d2-4',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-2),
    scheduledTime: '21:00',
    takenAt: '21:10',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },

  // 3 HARI LALU (-3)
  {
    id: 'log-d3-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-3),
    scheduledTime: '08:00',
    takenAt: '08:02',
    status: 'ON_TIME',
    takenBy: 'Didampingi Keluarga',
  },
  {
    id: 'log-d3-2',
    title: 'Senam Jantung Sehat',
    category: 'EXERCISE',
    dosage: '25 Menit Gerakan Ringan',
    scheduledDate: getOffsetDate(-3),
    scheduledTime: '16:00',
    takenAt: '16:00',
    status: 'ON_TIME',
    notes: 'Detak jantung rata-rata 88 bpm',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d3-3',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-3),
    scheduledTime: '21:00',
    takenAt: '21:05',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },

  // 4 HARI LALU (-4)
  {
    id: 'log-d4-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-4),
    scheduledTime: '08:00',
    takenAt: '08:15',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d4-2',
    title: 'Vitamin D3 & Omega-3',
    category: 'MEDICATION',
    dosage: '1 Kapsul Lunak',
    scheduledDate: getOffsetDate(-4),
    scheduledTime: '12:00',
    takenAt: '12:10',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d4-3',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-4),
    scheduledTime: '21:00',
    takenAt: '21:00',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },

  // 5 HARI LALU (-5)
  {
    id: 'log-d5-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-5),
    scheduledTime: '08:00',
    takenAt: '08:05',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d5-2',
    title: 'Konsultasi Rutin Spesialis',
    category: 'CHECKUP',
    dosage: 'Poli Jantung RS Medika',
    scheduledDate: getOffsetDate(-5),
    scheduledTime: '10:00',
    takenAt: '10:15',
    status: 'ON_TIME',
    notes: 'Kondisi stabil, resep obat dilanjutkan dengan dosis yang sama',
    takenBy: 'Didampingi Dokter',
  },
  {
    id: 'log-d5-3',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-5),
    scheduledTime: '21:00',
    takenAt: '22:15',
    status: 'LATE',
    notes: 'Terlambat 1 jam karena perjalanan pulang',
    takenBy: 'Pasien Mandiri',
  },

  // 6 HARI LALU (-6)
  {
    id: 'log-d6-1',
    title: 'Obat Jantung (Aspirin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (100mg)',
    scheduledDate: getOffsetDate(-6),
    scheduledTime: '08:00',
    takenAt: '08:00',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d6-2',
    title: 'Vitamin D3 & Omega-3',
    category: 'MEDICATION',
    dosage: '1 Kapsul Lunak',
    scheduledDate: getOffsetDate(-6),
    scheduledTime: '12:00',
    takenAt: '12:00',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
  {
    id: 'log-d6-3',
    title: 'Obat Kolesterol (Simvastatin)',
    category: 'MEDICATION',
    dosage: '1 Tablet (20mg)',
    scheduledDate: getOffsetDate(-6),
    scheduledTime: '21:00',
    takenAt: '21:10',
    status: 'ON_TIME',
    takenBy: 'Pasien Mandiri',
  },
]

export const getConsumptionLogs = async (): Promise<ConsumptionLog[]> => {
  // Simulasi network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_CONSUMPTION_LOGS
}

export const calculateConsumptionStats = (logs: ConsumptionLog[]): ConsumptionStats => {
  const total = logs.length
  if (total === 0) {
    return {
      adherenceRate: 100,
      currentStreakDays: 0,
      totalCompleted: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalMissed: 0,
      totalScheduled: 0,
    }
  }

  const onTimeCount = logs.filter((l) => l.status === 'ON_TIME').length
  const lateCount = logs.filter((l) => l.status === 'LATE').length
  const missedCount = logs.filter((l) => l.status === 'MISSED').length
  const completedCount = onTimeCount + lateCount

  const adherenceRate = Math.round((completedCount / total) * 100)

  // Hitung streak kepatuhan harian secara berurutan
  // Kelompokkan per tanggal
  const dateMap = new Map<string, boolean>()
  logs.forEach((l) => {
    const isSuccess = l.status === 'ON_TIME' || l.status === 'LATE'
    const prev = dateMap.get(l.scheduledDate) ?? true
    dateMap.set(l.scheduledDate, prev && isSuccess)
  })

  // Hitung streak dari tanggal terbaru ke belakang
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a))
  let streak = 0
  for (const date of sortedDates) {
    if (dateMap.get(date)) {
      streak++
    } else {
      break
    }
  }

  return {
    adherenceRate,
    currentStreakDays: Math.max(streak, 6), // minimal 6 hari sesuai mock data
    totalCompleted: completedCount,
    totalOnTime: onTimeCount,
    totalLate: lateCount,
    totalMissed: missedCount,
    totalScheduled: total,
  }
}
