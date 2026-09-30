'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Activity,
  HeartPulse,
  Mail,
  Phone,
  School,
  Check,
} from 'lucide-react';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { getUserDashboardDataAction, updateUserProfileAction } from '../api/userRepository';

interface UserProfileState {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  streakCount: number;
  hbLevel?: number | null;
  schoolOrOrg?: string | null;
  riskLevel?: string | null;
}

export default function ProfileView() {
  const router = useRouter();
  const { user: authUser, logout, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Siswi FEMORY',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: authUser?.streakCount || 0,
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editSchool, setEditSchool] = useState(userProfile.schoolOrOrg || '');
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editHb, setEditHb] = useState(userProfile.hbLevel ? String(userProfile.hbLevel) : '');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const dashboard = await getUserDashboardDataAction(authUser?.id);
        if (isMounted && dashboard.user) {
          setUserProfile({
            id: dashboard.user.id,
            name: dashboard.user.name,
            email: dashboard.user.email,
            phone: dashboard.user.phone || '',
            avatarUrl: dashboard.user.avatarUrl || '',
            streakCount: dashboard.user.streakCount || 0,
            hbLevel: dashboard.user.hbLevel,
            schoolOrOrg: dashboard.user.schoolOrOrg,
            riskLevel: dashboard.user.riskLevel,
          });
          setEditName(dashboard.user.name);
          setEditSchool(dashboard.user.schoolOrOrg || '');
          setEditPhone(dashboard.user.phone || '');
          setEditHb(dashboard.user.hbLevel ? String(dashboard.user.hbLevel) : '');
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
    setEditSchool(userProfile.schoolOrOrg || '');
    setEditPhone(userProfile.phone);
    setEditHb(userProfile.hbLevel ? String(userProfile.hbLevel) : '');
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedHb = editHb.trim() ? Number(editHb) : undefined;
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        phone: editPhone,
        schoolOrOrg: editSchool,
        hbLevel: parsedHb,
      });

      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editSchool || null,
          phone: editPhone,
          hbLevel: parsedHb || null,
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
      badgeText: userProfile.streakCount > 0 ? 'Konsisten' : 'Mulai Sekarang',
      badgeColor:
        userProfile.streakCount > 0
          ? 'bg-orange-100 text-orange-700'
          : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'hb',
      label: 'Kadar Hemoglobin (Hb)',
      value: userProfile.hbLevel ? `${userProfile.hbLevel} g/dL` : 'Belum Diisi',
      subtitle: userProfile.hbLevel
        ? 'Standar normal ≥ 12.0 g/dL'
        : 'Isi hasil tes lab di profil',
      icon: Activity,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeText: userProfile.hbLevel
        ? userProfile.hbLevel >= 12
          ? 'Normal'
          : 'Anemia'
        : 'Belum Tes',
      badgeColor: userProfile.hbLevel
        ? userProfile.hbLevel >= 12
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-rose-100 text-rose-700'
        : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'risk',
      label: 'Status Risiko Anemia',
      value: userProfile.riskLevel || 'Rendah',
      subtitle: 'Berdasarkan evaluasi UKS',
      icon: HeartPulse,
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      badgeText: userProfile.riskLevel === 'Tinggi' ? 'Perhatian' : 'Aman',
      badgeColor:
        userProfile.riskLevel === 'Tinggi'
          ? 'bg-rose-100 text-rose-700'
          : 'bg-emerald-100 text-emerald-700',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Akun',
      value: userProfile.email || '-',
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: userProfile.phone || 'Belum diisi',
    },
    {
      icon: School,
      label: 'Sekolah / Instansi',
      value: userProfile.schoolOrOrg || 'Belum diatur',
      fallbackValue: 'Belum diatur',
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
        subtitle={`${userProfile.schoolOrOrg || 'Program Pencegahan Anemia'} • FEMORY 🌸`}
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

      {/* 4. Security & Session Section */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onChangePasswordClick={() =>
          showToast('Fitur ubah kata sandi dapat dilakukan melalui admin UKS.')
        }
      />

      {/* 5. Edit Profile Dynamic Modal */}
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
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>
            Sekolah / Instansi
          </label>
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
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5'>
              Kadar Hb Terakhir (g/dL)
            </label>
            <input
              type='number'
              step='0.1'
              value={editHb}
              onChange={e => setEditHb(e.target.value)}
              placeholder='Contoh: 12.4'
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>
        </div>
      </ProfileEditModal>
    </div>
  );
}
