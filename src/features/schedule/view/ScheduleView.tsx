'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Pill,
  Bell,
  BellRing,
  Info,
  Check,
  X,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Chip } from '@/src/shared/components/ui/Chip';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getUserScheduleAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const FREQUENCIES = ['1x Seminggu', 'Setiap Hari (Terapi Khusus)'];

const defaultSchedule: UserScheduleData = {
  id: 'SCH-DEFAULT',
  patientId: 'usr_1',
  dayOfWeek: 'Sabtu',
  time: '08:00',
  tabletName: 'Tablet Tambah Darah (TTD)',
  dosage: '1 tablet, 1x seminggu',
  frequency: 'Mingguan',
  isEnabled: true,
  remind15MinBefore: true,
  nextDate: 'Sabtu, 10 Oktober 2026',
  daysRemaining: 3,
  instructions: 'Minum 1 tablet seminggu sekali setelah sarapan atau sebelum tidur.',
};

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData>(defaultSchedule);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Temp States
  const [tempDay, setTempDay] = useState(schedule.dayOfWeek);
  const [tempTime, setTempTime] = useState(schedule.time);
  const [tempFrequency, setTempFrequency] = useState(
    schedule.frequency === 'Mingguan' ? '1x Seminggu' : 'Setiap Hari (Terapi Khusus)',
  );
  const [tempRemind15, setTempRemind15] = useState(schedule.remind15MinBefore);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const data = await getUserScheduleAction(user?.id);
        if (isMounted && data) {
          setSchedule(data);
          setTempDay(data.dayOfWeek);
          setTempTime(data.time);
        }
      } catch (err) {
        console.error('Failed to load schedule:', err);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleToggleActive = async () => {
    const nextEnabled = !schedule.isEnabled;
    setSchedule(prev => ({ ...prev, isEnabled: nextEnabled }));
    showToast(nextEnabled ? 'Pengingat TTD diaktifkan' : 'Pengingat TTD dinonaktifkan');

    await updateUserScheduleSettingsAction(schedule.id, {
      isEnabled: nextEnabled,
    });
  };

  const handleOpenModal = () => {
    setTempDay(schedule.dayOfWeek);
    setTempTime(schedule.time);
    setTempFrequency(
      schedule.frequency === 'Mingguan' ? '1x Seminggu' : 'Setiap Hari (Terapi Khusus)',
    );
    setTempRemind15(schedule.remind15MinBefore);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFrequency = tempFrequency.includes('Seminggu') ? 'Mingguan' : 'Harian';

    setSchedule(prev => ({
      ...prev,
      dayOfWeek: tempDay,
      time: tempTime,
      frequency: updatedFrequency,
      remind15MinBefore: tempRemind15,
    }));
    setIsModalOpen(false);
    showToast('Jadwal pengingat berhasil diperbarui! ✨');

    await updateUserScheduleSettingsAction(schedule.id, {
      dayOfWeek: tempDay,
      time: tempTime,
      frequency: updatedFrequency,
      remind15MinBefore: tempRemind15,
    });

    const fresh = await getUserScheduleAction(user?.id);
    if (fresh) {
      setSchedule(fresh);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-amber-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
          Jadwal Pengingat TTD
        </h2>
        <p className='text-xs sm:text-sm text-[#64748b]'>
          Atur waktu rutin konsumsi Tablet Tambah Darah setiap minggu
        </p>
      </div>

      {/* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
        {/* LEFT COLUMN: Active Schedule Card (md:col-span-7) */}
        <div className='md:col-span-7 flex flex-col gap-5'>
          <Card variant='hero' padding='lg' className='relative'>
            <div className='flex items-center justify-between gap-2 mb-4'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full text-xs font-bold text-[#e11d48] border border-rose-200'>
                <Pill size={14} />
                <span>{schedule.dosage}</span>
              </span>

              {/* Toggle Switch */}
              <button
                type='button'
                onClick={handleToggleActive}
                className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  schedule.isEnabled ? 'bg-[#e11d48]' : 'bg-slate-300'
                }`}
                aria-label='Toggle Status Pengingat'
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                    schedule.isEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className='my-3'>
              <span className='text-xs text-[#64748b] font-medium block'>Hari & Waktu Rutin:</span>
              <div className='text-2xl sm:text-4xl font-extrabold text-[#1e293b] tracking-tight flex items-baseline gap-2 mt-1'>
                <span>{schedule.dayOfWeek}</span>
                <span className='text-[#e11d48] text-xl sm:text-2xl font-bold'>
                  • {schedule.time} WIB
                </span>
              </div>
              <span className='text-xs sm:text-sm font-semibold text-[#475569] mt-2 block'>
                {schedule.tabletName}
              </span>
              {schedule.instructions && (
                <p className='text-xs text-[#64748b] mt-2 italic bg-white/80 px-3 py-1.5 rounded-lg border border-rose-100'>
                  💡 {schedule.instructions}
                </p>
              )}
            </div>

            <div className='mt-5 pt-4 border-t border-rose-200 flex items-center justify-between'>
              <span className='text-xs text-[#64748b] flex items-center gap-1'>
                <BellRing size={13} className='text-[#e11d48]' />
                {schedule.remind15MinBefore ? 'Pengingat 15 menit sebelum' : 'Tepat pada jam'}
              </span>

              <Button
                variant='primary'
                size='sm'
                shape='pill'
                icon={<Edit3 size={13} />}
                onClick={handleOpenModal}
              >
                Ubah Jadwal
              </Button>
            </div>
          </Card>

          {/* Quick Frequency Info */}
          <Card padding='md' className='bg-[#fff5f7]'>
            <h4 className='text-xs font-bold text-[#1e293b] mb-1'>Kenapa Cukup 1x Seminggu? 🩸</h4>
            <p className='text-xs text-[#475569] leading-relaxed'>
              Bagi remaja putri sehat, suplementasi TTD mingguan sudah cukup efektif untuk mencukupi
              simpanan zat besi tanpa menimbulkan penumpukan berlebihan.
            </p>
          </Card>
        </div>

        {/* RIGHT COLUMN: Medical Guidelines & FAQs (md:col-span-5) */}
        <div className='md:col-span-5 flex flex-col gap-5'>
          <Card padding='lg'>
            <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-[#1e293b] mb-3'>
              <div className='w-7 h-7 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0'>
                <Info size={15} />
              </div>
              <h4>Petunjuk Konsumsi TTD</h4>
            </div>

            <ul className='space-y-3 text-xs sm:text-sm text-[#475569] leading-relaxed'>
              <li className='flex items-start gap-2'>
                <span className='text-rose-500 font-bold'>•</span>
                <span>
                  <strong>1 Tablet per Minggu:</strong> Konsumsi rutin setiap minggu pada hari yang
                  sama (misalnya setiap Sabtu pagi).
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-rose-500 font-bold'>•</span>
                <span>
                  <strong>Minum Setelah Makan:</strong> Sangat dianjurkan setelah makan untuk
                  mencegah iritasi dan rasa mual.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-rose-500 font-bold'>•</span>
                <span>
                  <strong>Hindari Teh & Kopi:</strong> Beri jeda 2 jam karena tanin mengikat zat
                  besi sebelum diserap tubuh.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-rose-500 font-bold'>•</span>
                <span>
                  <strong>Dampingi Buah Jeruk:</strong> Vitamin C meningkatkan efisiensi penyerapan
                  zat besi hingga 2 kali lipat.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Edit Schedule Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          <div className='w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#fce7f3] max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center'>
                  <CalendarIcon size={16} />
                </div>
                <h3 className='text-base font-bold text-[#1e293b]'>Ubah Jadwal Pengingat</h3>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center'
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className='flex flex-col gap-4'>
              {/* Day Selector (Only when 1x Seminggu) */}
              {tempFrequency.includes('Seminggu') && (
                <div>
                  <label className='text-xs font-bold text-[#1e293b] mb-2 block'>
                    Pilih Hari Konsumsi:
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {DAYS_OF_WEEK.map(d => (
                      <Chip key={d} size='md' active={tempDay === d} onClick={() => setTempDay(d)}>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selector */}
              <div>
                <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
                  Pukul / Jam Konsumsi:
                </label>
                <div className='relative flex items-center'>
                  <Clock
                    size={16}
                    className='absolute left-3.5 text-[#94a3b8] pointer-events-none'
                  />
                  <input
                    type='time'
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    className='w-full bg-white text-[#1e293b] font-semibold text-sm rounded-xl border border-[#fce7f3] focus:border-[#e11d48] pl-10 pr-3.5 py-3 outline-none'
                    required
                  />
                </div>
              </div>

              {/* Frequency Selector */}
              <div>
                <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>Frekuensi:</label>
                <div className='flex flex-col gap-2'>
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type='button'
                      onClick={() => setTempFrequency(f)}
                      className={`text-left text-xs font-medium p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        tempFrequency === f
                          ? 'border-[#e11d48] bg-[#fff1f2] text-[#be123c] font-bold'
                          : 'border-[#fce7f3] bg-white text-[#475569] hover:bg-[#fff5f7]'
                      }`}
                    >
                      <span>{f}</span>
                      {tempFrequency === f && <Check size={14} className='text-[#e11d48]' />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind 15 min toggle */}
              <div className='flex items-center justify-between p-3.5 bg-[#fff5f7] rounded-xl border border-[#fce7f3]'>
                <div className='flex items-center gap-2'>
                  <Bell size={16} className='text-[#e11d48]' />
                  <span className='text-xs font-semibold text-[#1e293b]'>
                    Ingatkan 15 Menit Sebelumnya
                  </span>
                </div>
                <input
                  type='checkbox'
                  checked={tempRemind15}
                  onChange={e => setTempRemind15(e.target.checked)}
                  className='w-4 h-4 text-[#e11d48] accent-[#e11d48] rounded-md cursor-pointer'
                />
              </div>

              {/* Modal Buttons */}
              <div className='flex items-center gap-2.5 pt-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='md'
                  shape='pill'
                  className='flex-1'
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type='submit' variant='primary' size='md' shape='pill' className='flex-1'>
                  Simpan Jadwal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
