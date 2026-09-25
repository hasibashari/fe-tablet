'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Activity,
  HeartPulse,
  Mail,
  Phone,
  School,
  Clock,
  Bell,
  HelpCircle,
  Info,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { getUserDashboardDataAction, updateUserProfileAction } from '../api/userRepository';

export default function ProfileView() {
  const router = useRouter();
  const { user: authUser, logout, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState({
    id: 'usr_1',
    name: 'Sarah Azzahra',
    email: 'sarah@email.com',
    phone: '0812-3456-7890',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: 4,
    hbLevel: 12.4,
    schoolOrOrg: 'SMA Negeri 1 Jakarta',
    riskLevel: 'Rendah',
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editSchool, setEditSchool] = useState(userProfile.schoolOrOrg);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editHb, setEditHb] = useState(String(userProfile.hbLevel || 12.4));

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const dashboard = await getUserDashboardDataAction(authUser?.id);
        if (isMounted && dashboard.user) {
          setUserProfile(dashboard.user);
          setEditName(dashboard.user.name);
          setEditSchool(dashboard.user.schoolOrOrg);
          setEditPhone(dashboard.user.phone);
          setEditHb(String(dashboard.user.hbLevel || 12.4));
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAvatar = async (newAvatarUrl: string | null) => {
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        avatarUrl: newAvatarUrl || '',
      });
      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          avatarUrl: newAvatarUrl || '',
        }));
        updateUser({ avatarUrl: newAvatarUrl || '' });
        showToast(
          newAvatarUrl
            ? 'Foto profil berhasil diperbarui! ✨'
            : 'Foto profil dihapus, menggunakan inisial nama.',
        );
      } else {
        showToast(res.error || 'Gagal memperbarui foto profil.');
      }
    } catch (err) {
      console.error('Save avatar error:', err);
      showToast('Gagal menyimpan foto profil.');
    }
  };

  const handleOpenEdit = () => {
    setEditName(userProfile.name);
    setEditSchool(userProfile.schoolOrOrg);
    setEditPhone(userProfile.phone);
    setEditHb(String(userProfile.hbLevel || 12.4));
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        phone: editPhone,
        schoolOrOrg: editSchool,
        hbLevel: Number(editHb) || 12.4,
      });

      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editSchool,
          phone: editPhone,
          hbLevel: Number(editHb) || 12.4,
        }));
        updateUser({ name: editName, phone: editPhone, schoolOrOrg: editSchool });
        setIsEditProfileModalOpen(false);
        showToast('Profil berhasil diperbarui! ✨');
      } else {
        showToast(res.error || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      showToast('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const userMetrics = [
    {
      id: 'streak',
      label: 'Streak Konsumsi TTD',
      value: `${userProfile.streakCount} Pekan`,
      subtitle: 'Konsumsi rutin mingguan',
      icon: Flame,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeText: 'Konsisten',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'hb',
      label: 'Kadar Hemoglobin (Hb)',
      value: `${userProfile.hbLevel} g/dL`,
      subtitle: 'Standar normal $\\ge 12.0$ g/dL',
      icon: Activity,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeText: 'Normal',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'risk',
      label: 'Status Risiko Anemia',
      value: userProfile.riskLevel || 'Rendah',
      subtitle: 'Berdasarkan evaluasi klinis',
      icon: HeartPulse,
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      badgeText: 'Aman',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Akun',
      value: userProfile.email,
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: userProfile.phone,
    },
    {
      icon: School,
      label: 'Sekolah / Instansi',
      value: userProfile.schoolOrOrg,
      fallbackValue: 'SMA Negeri 1 Jakarta',
    },
  ];

  const quickMenuItems = [
    {
      id: 'reminder',
      title: 'Jadwal & Pengingat Minum',
      subtitle: 'Atur jam dan hari konsumsi rutin TTD',
      icon: Clock,
      iconBg: 'bg-amber-100 text-amber-600',
      href: '/user/schedule',
    },
    {
      id: 'notification',
      title: 'Preferensi Notifikasi',
      subtitle: 'Pengingat aktif sebelum jadwal konsumsi',
      icon: Bell,
      iconBg: 'bg-sky-100 text-sky-600',
      action: () => showToast('Pengingat otomatis aktif! 🔔'),
    },
    {
      id: 'help',
      title: 'Edukasi & FAQ Anemia',
      subtitle: 'Panduan gizi dan pencegahan anemia remaja',
      icon: HelpCircle,
      iconBg: 'bg-purple-100 text-purple-600',
      href: '/user/education',
    },
    {
      id: 'about',
      title: 'Tentang Aplikasi Fe-Tablet',
      subtitle: 'Versi 2.0.0 • Program Tablet Tambah Darah',
      icon: Info,
      iconBg: 'bg-emerald-100 text-emerald-600',
      action: () => showToast('Fe-Tablet v2.0.0 • Sehat Bebas Anemia 🌸'),
    },
  ];

  return (
    <div className='flex flex-col gap-6 w-full max-w-5xl mx-auto'>
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-emerald-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h1 className='text-xl sm:text-2xl font-black text-slate-800 tracking-tight'>
          Profil Siswi & Pengaturan
        </h1>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Kelola identitas diri, pantau metrik kesehatan TTD, dan preferensi akun.
        </p>
      </div>

      {/* 1. Profile Header Card */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='SISWI TERDAFTAR'
        roleBadgeColor='user'
        subtitle={`${userProfile.schoolOrOrg} • Program Suplementasi TTD`}
        verified={true}
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. Health & Habit Metrics Grid */}
      <ProfileMetricsGrid
        title='Metrik Kesehatan & Rutinitas TTD'
        subtitle='Catatan kepatuhan dan kondisi hemoglobin terkini'
        metrics={userMetrics}
        columns={3}
      />

      {/* 3. Contact & Institution Card */}
      <ProfileContactCard
        title='Informasi Kontak & Pendidikan'
        subtitle='Data akun yang tercatat pada sistem pembinaan UKS/Puskesmas'
        items={contactItems}
      />

      {/* 4. Quick Navigation & Preferences Menu */}
      <Card padding='sm' className='divide-y divide-rose-100/60'>
        <div className='p-4 sm:p-5 pb-2'>
          <h2 className='text-sm sm:text-base font-bold text-slate-800'>Preferensi & Navigasi Cepat</h2>
          <p className='text-xs text-slate-400 mt-0.5'>Akses cepat pengaturan dan materi kesehatan</p>
        </div>

        {quickMenuItems.map(item => {
          const Icon = item.icon;
          const content = (
            <div className='flex items-center justify-between p-3.5 sm:p-4 hover:bg-rose-50/50 rounded-2xl transition-colors cursor-pointer'>
              <div className='flex items-center gap-3.5'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className='text-xs sm:text-sm font-bold text-slate-800'>{item.title}</h3>
                  <p className='text-[11px] text-slate-400 mt-0.5'>{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight size={18} className='text-slate-400' />
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className='block'>
                {content}
              </Link>
            );
          }

          return (
            <div key={item.id} onClick={item.action}>
              {content}
            </div>
          );
        })}
      </Card>

      {/* 5. Security & Session Section */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onChangePasswordClick={() => showToast('Fitur ubah kata sandi dapat dilakukan melalui admin UKS.')}
      />

      {/* 6. Edit Profile Dynamic Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        title='Ubah Data Siswi'
        subtitle='Perbarui data profil dan catatan kesehatan Anda'
        isSaving={isSaving}
      >
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nama Lengkap</label>
          <input
            type='text'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Sekolah / Instansi</label>
          <input
            type='text'
            value={editSchool}
            onChange={e => setEditSchool(e.target.value)}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nomor Telepon</label>
            <input
              type='tel'
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              required
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5'>Kadar Hb Terakhir (g/dL)</label>
            <input
              type='number'
              step='0.1'
              value={editHb}
              onChange={e => setEditHb(e.target.value)}
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>
        </div>
      </ProfileEditModal>
    </div>
  );
}
