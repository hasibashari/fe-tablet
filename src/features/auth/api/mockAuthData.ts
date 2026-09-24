import { AuthUser } from '../types/auth.types';

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'adm_1',
  name: 'dr. Sarah Jenkins, Sp.GK',
  email: 'admin@medicore.com',
  role: 'admin',
  phone: '0811-2233-4455',
  avatarUrl:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
  gender: 'Perempuan',
  schoolOrOrg: 'Fasilitator Kesehatan UKS',
};

export const MOCK_STUDENT_USER: AuthUser = {
  id: 'usr_1',
  name: 'Sarah Azzahra',
  email: 'sarah@email.com',
  role: 'user',
  phone: '0812-3456-7890',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  gender: 'Perempuan',
  schoolOrOrg: 'SMA Negeri 1 Sehat',
  friendCode: 'FE-SARAH-9901',
  hbLevel: 12.4,
  streakCount: 6,
};

export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Fasilitator / Admin',
    description: 'Akses penuh ke Monitoring Siswi, Jadwal TTD, Inventori & Laporan Kepatuhan',
    email: 'admin@medicore.com',
    password: 'password123',
    user: MOCK_ADMIN_USER,
    targetRoute: '/admin/dashboard',
    badgeColor: '#e11d48',
  },
  {
    role: 'user' as const,
    label: 'Pengguna / Siswi',
    description: 'Akses ke Pengingat TTD, Monitoring 3-Tab, Edukasi & Buddy Streak',
    email: 'sarah@email.com',
    password: 'password123',
    user: MOCK_STUDENT_USER,
    targetRoute: '/user/dashboard',
    badgeColor: '#10b981',
  },
];
