'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Heart,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getBuddyStreakDataAction,
  sendBuddyCheerAction,
  addBuddyByCodeAction,
  removeBuddyAction,
} from '../api/buddyRepository';
import { BuddyStreakData, BuddyItem } from '../types';
import BuddyHeroCard from '../components/BuddyHeroCard';
import BuddyFriendsList from '../components/BuddyFriendsList';
import AddBuddyModal from '../components/AddBuddyModal';

let tempActivityCounter = 0;
const generateTempActivityId = () => `act_tmp_${++tempActivityCounter}`;

export default function BuddyView() {
  const { user } = useAuth();
  const userId = user?.id || 'usr_1';
  const userName = user?.name || 'Sarah Azzahra';
  const userAvatar =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const [buddyData, setBuddyData] = useState<BuddyStreakData>({
    connectionId: '',
    buddyId: '',
    buddyName: '',
    buddyAvatarUrl: '',
    sharedStreakCount: 0,
    userStatusThisWeek: 'pending',
    buddyStatusThisWeek: 'pending',
    userFriendCode: user?.friendCode || 'FE-SARAH-9901',
    buddyFriendCode: undefined,
    activeBuddy: null,
    friendsList: [],
    activities: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [cheerCount, setCheerCount] = useState(12);
  const [cheeredJustNow, setCheeredJustNow] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Delete modal state
  const [buddyToDelete, setBuddyToDelete] = useState<BuddyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getBuddyStreakDataAction(userId);
        if (isMounted && data) {
          setBuddyData(data);
        }
      } catch (err) {
        console.error('Failed to load buddy streak data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Switch active hero partner
  const handleSwitchActiveBuddy = async (connectionId: string) => {
    try {
      const updated = await getBuddyStreakDataAction(userId, connectionId);
      if (updated) {
        setBuddyData(updated);
        setCheeredJustNow(false);
        showToast(`Partner duel diubah ke ${updated.buddyName}! 👑`);
      }
    } catch (err) {
      console.error('Error switching active buddy:', err);
    }
  };

  // Send cheer
  const handleSendCheer = async (
    targetBuddyId?: string,
    targetConnId?: string,
    targetName?: string,
  ) => {
    const connId = targetConnId || buddyData.connectionId;
    const bId = targetBuddyId || buddyData.buddyId;
    const bName = targetName || buddyData.buddyName;

    if (!connId || !bId) return;

    setCheerCount(prev => prev + 1);
    setCheeredJustNow(true);
    showToast(`Stiker semangat terkirim ke ${bName}! ❤️`);

    // Add activity locally immediately
    const tempId = generateTempActivityId();
    const newAct = {
      id: tempId,
      userName: userName,
      action: `mengirimkan stiker semangat ke ${bName} ❤️`,
      timestamp: 'Baru saja',
      isPositive: true,
      iconType: 'heart' as const,
    };

    setBuddyData(prev => ({
      ...prev,
      activities: [newAct, ...prev.activities],
    }));

    // Async server action call
    try {
      await sendBuddyCheerAction(connId, userId, bId, 'HEART', `Semangat terus ${bName}!`);
    } catch (err) {
      console.error('Error sending cheer:', err);
    }
  };

  // Add friend
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addBuddyByCodeAction(userId, friendCodeInput.trim());
      if (res.success) {
        showToast(`Berhasil terhubung dengan ${res.buddyName || friendCodeInput}! 🎉`);
        setIsAddModalOpen(false);
        setFriendCodeInput('');
        const freshData = await getBuddyStreakDataAction(userId);
        if (freshData) setBuddyData(freshData);
      } else {
        showToast(res.error || 'Gagal menambahkan teman.');
      }
    } catch (err) {
      console.error('Error adding buddy:', err);
      showToast('Terjadi kesalahan saat menambahkan kawan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove friend confirmation
  const handleConfirmDeleteBuddy = async () => {
    if (!buddyToDelete) return;
    setIsDeleting(true);

    try {
      const res = await removeBuddyAction(buddyToDelete.connectionId, userId);
      if (res.success) {
        showToast(`${buddyToDelete.name} berhasil dihapus dari daftar Buddy.`);
        setBuddyToDelete(null);

        // Refresh data
        const freshData = await getBuddyStreakDataAction(userId);
        if (freshData) {
          setBuddyData(freshData);
          setCheeredJustNow(false);
        }
      } else {
        showToast(res.error || 'Gagal menghapus teman.');
      }
    } catch (err) {
      console.error('Error removing buddy:', err);
      showToast('Terjadi kesalahan sistem saat menghapus teman.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy friend code
  const handleCopyCode = () => {
    const code = buddyData.userFriendCode || user?.friendCode || 'FE-SARAH-9901';
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    showToast('Kode teman berhasil disalin ke clipboard! 📋');
    setTimeout(() => setHasCopiedCode(false), 2500);
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

      {/* Screen Title & Add Button */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
            Buddy Streak
          </h2>
          <p className='text-xs sm:text-sm text-[#64748b]'>
            Bangun kebiasaan sehat minum TTD bersama sahabatmu
          </p>
        </div>

        <Button
          variant='soft'
          size='sm'
          shape='pill'
          icon={<Plus size={14} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Tambah Buddy
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start animate-pulse'>
          <div className='md:col-span-5 flex flex-col gap-5'>
            <div className='h-80 bg-rose-50/70 rounded-2xl border border-rose-100 p-6 flex flex-col items-center justify-center gap-4'>
              <div className='w-20 h-20 rounded-full bg-rose-200/60' />
              <div className='w-32 h-4 bg-rose-200/60 rounded-full' />
              <div className='w-48 h-3 bg-rose-200/40 rounded-full' />
            </div>
          </div>
          <div className='md:col-span-7 flex flex-col gap-5'>
            <div className='h-52 bg-slate-50 rounded-2xl border border-slate-100 p-6' />
            <div className='h-52 bg-slate-50 rounded-2xl border border-slate-100 p-6' />
          </div>
        </div>
      ) : (
        /* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Hero Active Buddy or Empty State (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-5'>
            <BuddyHeroCard
              buddyData={buddyData}
              userName={userName}
              userAvatar={userAvatar}
              cheeredJustNow={cheeredJustNow}
              cheerCount={cheerCount}
              hasCopiedCode={hasCopiedCode}
              onSendCheer={() => handleSendCheer()}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onCopyCode={handleCopyCode}
              onSelectBuddyToDelete={buddy => setBuddyToDelete(buddy)}
            />

            {/* Motivational Box */}
            <Card padding='md' className='bg-[#fdf2f4]'>
              <h4 className='text-xs sm:text-sm font-bold text-[#be123c] mb-1'>Tahukah Kamu? 💡</h4>
              <p className='text-xs text-[#475569] leading-relaxed'>
                Membangun kebiasaan suplementasi bersama teman sebaya (<em>peer encouragement</em>)
                melipatgandakan kepatuhan minum tablet zat besi tepat waktu setiap minggu.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Friends List (Ala Duolingo) & Activity Feed (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            <BuddyFriendsList
              friendsList={buddyData.friendsList}
              activeBuddyName={buddyData.buddyName}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSendCheer={(bId, cId, bName) => handleSendCheer(bId, cId, bName)}
              onSwitchActiveBuddy={handleSwitchActiveBuddy}
              onSelectBuddyToDelete={buddy => setBuddyToDelete(buddy)}
            />

            {/* Live Activity Feed */}
            <Card padding='lg'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2'>
                  <Sparkles size={18} className='text-[#e11d48]' />
                  <span>Aktivitas & Dukungan Sebaya</span>
                </h4>
                <span className='text-xs text-[#94a3b8]'>Pembaruan Langsung</span>
              </div>

              <div className='flex flex-col divide-y divide-[#fce7f3]'>
                {buddyData.activities.length > 0 ? (
                  buddyData.activities.map(act => (
                    <div key={act.id} className='py-3 first:pt-0 last:pb-0 flex items-start gap-3'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                          act.iconType === 'heart'
                            ? 'bg-rose-100 text-rose-600'
                            : act.iconType === 'flame'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {act.iconType === 'heart' ? (
                          <Heart size={14} className='fill-rose-600' />
                        ) : act.iconType === 'flame' ? (
                          <Flame size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </div>

                      <div className='flex-1'>
                        <p className='text-xs sm:text-sm text-[#1e293b]'>
                          <strong className='font-semibold'>{act.userName}</strong> {act.action}
                        </p>
                        <span className='text-[11px] text-[#94a3b8]'>{act.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='py-4 text-center text-xs text-[#94a3b8]'>
                    Belum ada aktivitas minggu ini. Kirim stiker semangat pertamamu!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add Buddy Modal Component */}
      <AddBuddyModal
        open={isAddModalOpen}
        userFriendCode={buddyData.userFriendCode || user?.friendCode || 'FE-SARAH-9901'}
        friendCodeInput={friendCodeInput}
        isSubmitting={isSubmitting}
        hasCopiedCode={hasCopiedCode}
        onClose={() => setIsAddModalOpen(false)}
        onInputChange={val => setFriendCodeInput(val)}
        onSubmit={handleAddFriend}
        onCopyCode={handleCopyCode}
      />

      {/* Delete / Remove Buddy Confirmation Modal */}
      {buddyToDelete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          <div className='w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#fce7f3] text-center flex flex-col items-center'>
            <div className='w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-inner'>
              <Trash2 size={24} />
            </div>

            <h3 className='text-base font-bold text-[#1e293b]'>
              Hapus {buddyToDelete.name}?
            </h3>

            <p className='text-xs text-[#64748b] mt-2 mb-5 leading-relaxed'>
              Apakah kamu yakin ingin menghapus <strong>{buddyToDelete.name}</strong> dari daftar Buddy Sehat?
              Riwayat streak bersama <strong>{buddyToDelete.sharedStreakCount} minggu</strong> kalian akan terhenti.
            </p>

            <div className='flex items-center gap-3 w-full'>
              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                className='flex-1'
                onClick={() => setBuddyToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>

              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                className='flex-1 bg-[#e11d48] hover:bg-[#be123c]'
                onClick={handleConfirmDeleteBuddy}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
