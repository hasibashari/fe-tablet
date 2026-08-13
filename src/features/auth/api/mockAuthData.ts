import { AuthUser } from '../types/auth.types'

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'ADM-001',
  name: 'dr. Siti Rahma, Sp.PD',
  email: 'admin@medicore.com',
  role: 'admin',
  title: 'Kepala Tim Medis & Pengawas Klinis',
  phone: '0811-2233-4455',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
  gender: 'Perempuan',
}

export const MOCK_PATIENT_USER: AuthUser = {
  id: 'PAT-001',
  name: 'Budi Santoso',
  email: 'budi@medicore.com',
  role: 'patient',
  title: 'Pasien Rawat Jalan',
  phone: '0812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  gender: 'Laki-laki',
  age: 58,
  assignedDoctor: 'dr. Siti Rahma, Sp.PD',
  bloodType: 'O+',
}

export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Dokter / Admin',
    description: 'Akses penuh ke Kontrol Klinis, Pasien, Jadwal, Obat & Laporan',
    email: 'admin@medicore.com',
    password: 'password123',
    user: MOCK_ADMIN_USER,
    targetRoute: '/admin/dashboard',
    badgeColor: '#0284c7',
  },
  {
    role: 'patient' as const,
    label: 'Pasien / User',
    description: 'Akses ke Jadwal Minum Obat, Monitoring Harian & Edukasi',
    email: 'budi@medicore.com',
    password: 'password123',
    user: MOCK_PATIENT_USER,
    targetRoute: '/user/dashboard',
    badgeColor: '#10b981',
  },
]
