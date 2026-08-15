export interface AdminStats {
  totalPatients: number
  activeSchedules: number
  adherenceRate: number
  publishedArticles: number
  activePrograms: number
  lowStockProducts: number
}

export interface PatientUser {
  id: string
  name: string
  age: number
  gender: 'Laki-laki' | 'Perempuan'
  phone: string
  email: string
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah'
  status: 'Aktif' | 'Nonaktif'
  assignedDoctor: string
  activeSchedulesCount: number
  adherenceRate: number
  lastActive: string
  joinDate: string
  medicalNotes?: string
  lastReminderSent?: string
}

export interface MedicationSchedule {
  id: string
  patientId: string
  patientName: string
  medicationName: string
  dosage: string
  frequency: string
  timeSlots: string[]
  startDate: string
  endDate: string
  status: 'Aktif' | 'Selesai' | 'Diberhentikan'
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions: string
  lastReminderSent?: string
  todayStatus?: 'COMPLETED' | 'PENDING' | 'NO_REMINDER'
}

export interface MedicalProduct {
  id: string
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: number
  unit: string
  price: number
  status: 'Tersedia' | 'Stok Menipis' | 'Habis'
  description: string
}

export interface HealthArticle {
  id: string
  title: string
  category: 'Hipertensi' | 'Diabetes' | 'Nutrisi' | 'Gaya Hidup' | 'Kardiovaskular'
  author: string
  publishDate: string
  status: 'Terbit' | 'Draf'
  views: number
  summary: string
  readTime: string
  imageUrl?: string
  content?: string
}

export interface HealthProgram {
  id: string
  name: string
  code: string
  description: string
  durationWeeks: number
  enrolledPatientsCount: number
  status: 'Aktif' | 'Draf' | 'Arsip'
  targetCategory: string
  createdBy: string
}

export interface ComplianceReport {
  date: string
  takenCount: number
  missedCount: number
  adherencePercentage: number
}
