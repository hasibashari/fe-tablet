'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Flame,
  Activity,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Button } from '@/src/shared/components/ui/Button';
import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUserDashboardDataAction,
  recordUserConsumptionAction,
  UserDashboardData,
} from '@/src/features/user/api/userRepository';
import { getConsumptionLogsAction, getConsumptionStatsAction } from '../api/consumptionRepository';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { ConsumptionStatus } from '@/src/shared/mock/feTabletData';

type MonitoringTab = 'today' | 'weekly' | 'monthly';

export default function HistoryView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MonitoringTab>('today');
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [todayStatus, setTodayStatus] = useState<ConsumptionStatus>('pending');
  const [recordedTime, setRecordedTime] = useState<string>('');
  const [weeklyLogs, setWeeklyLogs] = useState<ConsumptionLog[]>([]);
  const [stats, setStats] = useState<ConsumptionStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [dash, logs, statsData] = await Promise.all([
          getUserDashboardDataAction(user?.id),
          getConsumptionLogsAction('30_DAYS', 'ALL', 'ALL', user?.id || 'usr_1'),
          getConsumptionStatsAction(user?.id || 'usr_1'),
        ]);

        if (isMounted) {
          if (dash) {
            setDashboardData(dash);
            setTodayStatus(dash.todayStatus);
            setRecordedTime(dash.todayRecordedTime || '');
          }
          setWeeklyLogs(logs);
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error loading history data:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleTakeToday = async () => {
    const timeStr =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setTodayStatus('recorded');
    setRecordedTime(timeStr);
    await recordUserConsumptionAction(user?.id || 'usr_1', 'recorded');
    publishRealtimeEvent('MEDICATION_TAKEN', { patientId: user?.id || 'usr_1' });
  };

  const handleMissToday = async () => {
    setTodayStatus('missed');
    await recordUserConsumptionAction(user?.id || 'usr_1', 'missed');
    publishRealtimeEvent('MEDICATION_TAKEN', { patientId: user?.id || 'usr_1' });
  };

  const handleResetToday = async () => {
    setTodayStatus('pending');
    await recordUserConsumptionAction(user?.id || 'usr_1', 'pending');
    publishRealtimeEvent('MEDICATION_TAKEN', { patientId: user?.id || 'usr_1' });
  };

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Screen Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
          Monitoring Kepatuhan
        </h2>
        <p className='text-xs sm:text-sm text-[#64748b]'>
          Pantau riwayat konsumsi Tablet Tambah Darah (TTD) secara berkala
        </p>
      </div>

      {/* 3-Tab Segmented Control Navigation */}
      <div className='flex items-center p-1 bg-white rounded-2xl border border-[#fce7f3] shadow-xs max-w-md'>
        <button
          type='button'
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Hari Ini
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Mingguan
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Bulanan
        </button>
      </div>

      {/* TAB 1: HARI INI */}
      {activeTab === 'today' && (
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 animate-fade-in items-start'>
          <div className='md:col-span-7 flex flex-col gap-4'>
            <Card padding='lg'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs sm:text-sm font-bold text-[#1e293b]'>Jadwal Hari Ini</span>
                <Badge variant={todayStatus} size='sm'>
                  {todayStatus === 'recorded'
                    ? '✓ Sudah Tercatat'
                    : todayStatus === 'missed'
                      ? '✕ Terlewat'
                      : 'Belum Dicatat'}
                </Badge>
              </div>

              <div className='bg-[#fff5f7] border border-[#fce7f3] rounded-xl p-4 my-2'>
                <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>
                  {dashboardData?.activeSchedule.tabletName || 'Tablet Tambah Darah (TTD)'}
                </h4>
                <p className='text-xs sm:text-sm text-[#e11d48] font-semibold flex items-center gap-1 mt-1'>
                  <Clock size={14} />
                  <span>Pukul {dashboardData?.activeSchedule.time || '08:00'} WIB</span>
                </p>
                <p className='text-xs text-[#64748b] mt-1.5'>
                  Dosis:{' '}
                  {dashboardData?.activeSchedule.dosage ||
                    '1 tablet, diminum setelah makan bersama air putih atau jus buah segar.'}
                </p>
              </div>

              {/* Interactive Actions for Today */}
              {todayStatus === 'pending' && (
                <div className='flex items-center gap-2.5 mt-4'>
                  <Button
                    variant='success'
                    size='md'
                    shape='pill'
                    fullWidth
                    icon={<CheckCircle2 size={16} />}
                    onClick={handleTakeToday}
                  >
                    Sudah Minum
                  </Button>
                  <Button
                    variant='outline'
                    size='md'
                    shape='pill'
                    className='text-[#f43f5e] border-[#fecdd3]'
                    icon={<XCircle size={16} />}
                    onClick={handleMissToday}
                  >
                    Terlewat
                  </Button>
                </div>
              )}

              {todayStatus === 'recorded' && (
                <div className='p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mt-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 size={18} className='text-emerald-600 shrink-0' />
                    <span className='text-xs sm:text-sm font-bold text-emerald-800'>
                      Tercatat diminum pada {recordedTime || '08:15 WIB'}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleResetToday}
                    className='text-xs font-semibold text-emerald-700 hover:underline cursor-pointer'
                  >
                    Ubah
                  </button>
                </div>
              )}

              {todayStatus === 'missed' && (
                <div className='p-3.5 bg-rose-50 border border-rose-200 rounded-xl mt-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle size={18} className='text-rose-600 shrink-0' />
                    <span className='text-xs sm:text-sm font-bold text-rose-800'>
                      Jadwal hari ini ditandai terlewat
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleResetToday}
                    className='text-xs font-semibold text-rose-700 hover:underline cursor-pointer'
                  >
                    Ubah
                  </button>
                </div>
              )}
            </Card>
          </div>

          <div className='md:col-span-5 flex flex-col gap-4'>
            <Card padding='md' className='bg-[#fdf2f4]'>
              <h4 className='text-xs font-bold text-[#be123c] mb-1.5 flex items-center gap-1.5'>
                <Sparkles size={14} />
                <span>Tips Kepatuhan Hari Ini</span>
              </h4>
              <p className='text-xs text-[#475569] leading-relaxed'>
                Minum TTD secara teratur membantu sel darah merah membawa oksigen ke seluruh tubuh,
                sehingga belajar dan beraktivitas menjadi lebih fokus dan tidak cepat mengantuk.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MINGGUAN */}
      {activeTab === 'weekly' && (
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 animate-fade-in items-start'>
          <div className='md:col-span-5 flex flex-col gap-4'>
            <Card variant='hero' padding='lg'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-[#e11d48]'>Evaluasi Kepatuhan</span>
                <Badge variant='recorded' size='sm'>
                  ✓ {stats?.adherenceRate || 92}% Kepatuhan
                </Badge>
              </div>
              <h3 className='text-lg font-extrabold text-[#1e293b] mt-2'>
                Bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h3>
              <p className='text-xs text-[#64748b] mt-1'>
                Jadwal rutin: {dashboardData?.activeSchedule.nextDate || 'Sabtu, 08:00 WIB'}
              </p>
            </Card>

            <Card padding='md' className='bg-[#fff5f7]'>
              <span className='text-xs font-bold text-[#1e293b] block mb-1'>
                Kenapa Evaluasi Mingguan?
              </span>
              <p className='text-xs text-[#475569] leading-relaxed'>
                Evaluasi per 4 minggu membantu mengukur apakah siklus menstruasimu didampingi
                cadangan zat besi yang stabil.
              </p>
            </Card>
          </div>

          <div className='md:col-span-7'>
            <Card padding='lg'>
              <h4 className='text-sm sm:text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2'>
                <Calendar size={18} className='text-[#e11d48]' />
                <span>Riwayat Log Konsumsi Terakhir</span>
              </h4>

              <div className='flex flex-col divide-y divide-[#fce7f3]'>
                {weeklyLogs.length > 0 ? (
                  weeklyLogs.slice(0, 6).map(log => (
                    <div
                      key={log.id}
                      className='py-3.5 first:pt-0 last:pb-0 flex items-center justify-between'
                    >
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs sm:text-sm font-bold text-[#1e293b]'>
                            {log.title}
                          </span>
                          <span className='text-[11px] text-[#94a3b8] font-medium'>
                            ({log.scheduledDate})
                          </span>
                        </div>
                        <p className='text-xs text-[#64748b] mt-0.5'>
                          Jadwal: {log.scheduledTime} WIB{' '}
                          {log.takenAt ? `• Diminum ${log.takenAt}` : ''}
                        </p>
                      </div>

                      <div>
                        {log.status === 'ON_TIME' || log.status === 'LATE' ? (
                          <Badge variant='recorded' size='sm'>
                            ✓ Tercatat
                          </Badge>
                        ) : (
                          <Badge variant='missed' size='sm'>
                            ✕ Terlewat
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='py-8 text-center text-xs text-[#94a3b8]'>
                    Belum ada riwayat konsumsi tercatat. Mulai catat konsumsi TTD-mu hari ini!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: BULANAN */}
      {activeTab === 'monthly' && (
        <div className='flex flex-col gap-6 animate-fade-in'>
          {/* Monthly Bar Chart Component */}
          <ConsumptionChart
            data={[
              { month: 'Mei', count: 4, target: 4 },
              { month: 'Jun', count: 4, target: 4 },
              { month: 'Jul', count: 3, target: 4 },
              { month: 'Agt', count: 4, target: 4 },
              { month: 'Sep', count: 4, target: 4 },
              { month: 'Okt', count: Math.min(4, stats?.totalCompleted || 4), target: 4 },
            ]}
            totalCount={stats?.totalCompleted || 4}
            compliancePercent={stats?.adherenceRate || 95}
          />

          {/* 4-Grid Responsive Milestone Metrics */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
            <Card padding='md' className='text-center'>
              <div className='w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2'>
                <Flame size={18} />
              </div>
              <span className='text-[11px] text-[#64748b] block font-medium'>Streak Kepatuhan</span>
              <span className='text-sm sm:text-base font-extrabold text-[#e11d48]'>
                {dashboardData?.user.streakCount || 4} Minggu
              </span>
            </Card>

            <Card padding='md' className='text-center'>
              <div className='w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-2'>
                <CalendarCheck size={18} />
              </div>
              <span className='text-[11px] text-[#64748b] block font-medium'>
                Total Tablet Diminum
              </span>
              <span className='text-sm sm:text-base font-extrabold text-[#1e293b]'>
                {stats?.totalCompleted || 21} Tablet
              </span>
            </Card>

            <Card padding='md' className='text-center'>
              <div className='w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2'>
                <Activity size={18} />
              </div>
              <span className='text-[11px] text-[#64748b] block font-medium'>Kadar Hb</span>
              <span className='text-sm sm:text-base font-extrabold text-[#10b981]'>
                {dashboardData?.user.hbLevel || 12.4} g/dL
              </span>
            </Card>

            <Card padding='md' className='text-center'>
              <div className='w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2'>
                <Sparkles size={18} />
              </div>
              <span className='text-[11px] text-[#64748b] block font-medium'>Status Kesehatan</span>
              <span className='text-sm sm:text-base font-extrabold text-[#9333ea]'>
                Bebas Anemia
              </span>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
