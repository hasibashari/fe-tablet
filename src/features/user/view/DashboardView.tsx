'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Activity, Award } from 'lucide-react';
import { ReminderCard } from '@/src/shared/components/domain/ReminderCard';
import { StatusCard } from '@/src/shared/components/domain/StatusCard';
import { QuickAction } from '@/src/shared/components/domain/QuickAction';
import { BuddyCard } from '@/src/shared/components/domain/BuddyCard';
import { Card } from '@/src/shared/components/ui/Card';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUserDashboardDataAction,
  recordUserConsumptionAction,
  UserDashboardData,
} from '../api/userRepository';

type DashboardConsumptionStatus = 'recorded' | 'missed' | 'pending';

export default function DashboardView() {
  const { user: authUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const data = await getUserDashboardDataAction(authUser?.id);
        if (isMounted) {
          setDashboardData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const handleStatusChange = async (newStatus: DashboardConsumptionStatus) => {
    if (!dashboardData) return;
    const userId = authUser?.id || dashboardData.user.id;
    const prevStatus = dashboardData.todayStatus;

    // Optimistic UI update
    setDashboardData(prev => (prev ? { ...prev, todayStatus: newStatus } : null));

    const res = await recordUserConsumptionAction(userId, newStatus);
    if (!res.success) {
      // Revert if error
      setDashboardData(prev => (prev ? { ...prev, todayStatus: prevStatus } : null));
    } else {
      publishRealtimeEvent('MEDICATION_TAKEN', { patientId: userId });
    }
  };

  const currentUser = dashboardData?.user || {
    id: authUser?.id || 'usr_1',
    name: authUser?.name || 'Pasien Fe-Tablet',
    streakCount: 4,
    hbLevel: 12.4,
    avatarUrl: authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FeTablet',
  };

  const currentSchedule = dashboardData?.activeSchedule || {
    id: 'SCH-DEFAULT',
    dayOfWeek: 'Sabtu',
    time: '08:00',
    tabletName: 'Tablet Tambah Darah (TTD)',
    dosage: '1 tablet, 1x seminggu',
    frequency: 'Mingguan',
    isEnabled: true,
    remind15MinBefore: true,
    nextDate: 'Sabtu, 10 Oktober 2026',
    daysRemaining: 3,
  };

  const featuredArticle = dashboardData?.featuredArticle;

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full'>
      {/* Mobile Health Stats Bar (< md) */}
      <div className='flex md:hidden items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-[#fce7f3] shadow-2xs'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500'>
            <Flame size={18} className='fill-amber-500' />
          </div>
          <div>
            <span className='text-[10px] text-[#64748b] block leading-tight'>Streak Minum</span>
            <span className='text-xs font-extrabold text-[#1e293b]'>
              {currentUser.streakCount} Minggu
            </span>
          </div>
        </div>

        <div className='h-7 w-[1px] bg-[#fce7f3]' />

        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500'>
            <Activity size={18} />
          </div>
          <div>
            <span className='text-[10px] text-[#64748b] block leading-tight'>Kadar Hb</span>
            <span className='text-xs font-extrabold text-[#10b981]'>
              {currentUser.hbLevel} g/dL
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Welcome Banner (Visible on md+) */}
      <div className='hidden md:flex items-center justify-between pb-2 border-b border-[#fce7f3]'>
        <div>
          <h1 className='text-2xl font-extrabold text-[#1e293b] tracking-tight'>
            Dashboard Pasien Fe-Tablet 🌸
          </h1>
          <p className='text-sm text-[#64748b] mt-0.5'>
            Selamat datang kembali, <strong>{currentUser.name}</strong>! Pantau jadwal minum TTD dan
            pertahankan streak-mu.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#fce7f3] shadow-2xs'>
            <Flame size={18} className='text-amber-500 fill-amber-500' />
            <span className='text-xs font-bold text-[#1e293b]'>
              {currentUser.streakCount} Minggu Streak
            </span>
          </div>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#fce7f3] shadow-2xs'>
            <Activity size={18} className='text-emerald-500' />
            <span className='text-xs font-bold text-[#10b981]'>Hb {currentUser.hbLevel} g/dL</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Layout: Mobile Stack -> Desktop Bento Grid */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
        {/* LEFT COLUMN: Main Health Actions & Hero (md:col-span-7 lg:col-span-8) */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col gap-5'>
          {/* 1. HERO: Next Reminder Card */}
          <section aria-label='Pengingat TTD Terdekat'>
            <ReminderCard
              schedule={currentSchedule}
              onTakeAction={() => handleStatusChange('recorded')}
            />
          </section>

          {/* 2. Status Hari Ini Card */}
          <section aria-label='Status Konsumsi Hari Ini'>
            <StatusCard
              initialStatus={dashboardData?.todayStatus || 'pending'}
              initialRecordedTime={dashboardData?.todayRecordedTime}
              onStatusChange={handleStatusChange}
            />
          </section>

          {/* 3. Edukasi Pilihan (Featured Article Banner) */}
          {featuredArticle && (
            <section aria-label='Materi Edukasi Pilihan'>
              <Card padding='none' className='overflow-hidden'>
                <div className='relative h-36 sm:h-44 w-full'>
                  <Image
                    src={
                      featuredArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={featuredArticle.title}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, 60vw'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5'>
                    <span className='text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1'>
                      <Sparkles size={11} />
                      <span>Edukasi Pilihan • {featuredArticle.readTime}</span>
                    </span>
                    <h3 className='text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mt-0.5'>
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>

                <div className='p-4 bg-white flex items-center justify-between'>
                  <p className='text-xs text-[#64748b] line-clamp-1 flex-1 pr-3'>
                    {featuredArticle.summary}
                  </p>
                  <Link
                    href={`/user/education/${featuredArticle.id}`}
                    className='inline-flex items-center gap-1 text-xs font-bold text-[#e11d48] hover:text-[#be123c] shrink-0'
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Widgets, Buddy & Stats (md:col-span-5 lg:col-span-4) */}
        <div className='md:col-span-5 lg:col-span-4 flex flex-col gap-5'>
          {/* Quick Menu */}
          <section aria-label='Menu Cepat Navigasi'>
            <Card padding='md'>
              <QuickAction />
            </Card>
          </section>

          {/* Buddy Streak Card */}
          <section aria-label='Buddy Streak & Komunitas'>
            <BuddyCard
              buddyData={{
                buddyName: 'Alya Rahma',
                buddyavatarUrl:
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                streakCount: currentUser.streakCount,
              }}
              userName={currentUser.name.split(' ')[0]}
              useravatarUrl={currentUser.avatarUrl}
            />
          </section>

          {/* Motivation & Level Milestone Widget */}
          <Card padding='md' className='bg-gradient-to-br from-[#fff5f7] to-[#ffe4e6]/50'>
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-8 h-8 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center'>
                <Award size={18} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-[#1e293b]'>Tingkat Kepatuhan</h4>
                <span className='text-[11px] font-semibold text-[#e11d48]'>
                  Pejuang Bebas Anemia (Level 3)
                </span>
              </div>
            </div>
            <p className='text-xs text-[#475569] leading-relaxed'>
              Kamu telah meminum {currentUser.streakCount} tablet berturut-turut. Pertahankan
              konsistensimu agar kadar hemoglobin tetap optimal!
            </p>
          </Card>
        </div>
      </div>

      {/* Footer Trust Badge */}
      <footer className='pt-2 pb-4 text-center'>
        <div className='inline-flex items-center gap-1.5 text-[11px] text-[#94a3b8]'>
          <ShieldCheck size={14} className='text-emerald-500' />
          <span>Program Pencegahan Anemia • Fe-Tablet v2.0</span>
        </div>
      </footer>
    </div>
  );
}
