import { AuthUser } from '../types/auth.types';

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'ADM-001',
  name: 'Administrator MediCore',
  email: 'admin@medicore.com',
  role: 'admin',
  title: 'Administrator Sistem',
  phone: '0811-2233-4455',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  gender: 'Laki-laki',
};

export const MOCK_PATIENT_USER: AuthUser = {
  id: 'PAT-001',
  name: 'Budi Santoso',
  email: 'budi@medicore.com',
  role: 'user',
  title: 'Pengguna Portal Mandiri',
  phone: '0812-3456-7890',
  avatarUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  gender: 'Laki-laki',
  age: 58,
  bloodType: 'O+',
};

export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Administrator',
    description: 'Akses penuh ke Kontrol Sistem, Pengguna, Jadwal, Obat & Laporan',
    email: 'admin@medicore.com',
    password: 'password123',
    user: MOCK_ADMIN_USER,
    targetRoute: '/admin/dashboard',
    badgeColor: '#0284c7',
  },
  {
    role: 'user' as const,
    label: 'User / Pasien',
    description: 'Akses ke Jadwal Minum Obat, Monitoring Harian & Edukasi',
    email: 'budi@medicore.com',
    password: 'password123',
    user: MOCK_PATIENT_USER,
    targetRoute: '/user/dashboard',
    badgeColor: '#10b981',
  },
];
