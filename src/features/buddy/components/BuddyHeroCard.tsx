'use client';

import React from 'react';
import Image from 'next/image';
import {
  Flame,
  Heart,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Crown,
  UserPlus,
  Plus,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { BuddyStreakData, BuddyItem } from '../types';

interface BuddyHeroCardProps {
  buddyData: BuddyStreakData;
  userName: string;
  userAvatar: string;
  cheeredJustNow: boolean;
  cheerCount: number;
  hasCopiedCode: boolean;
  onSendCheer: () => void;
  onOpenAddModal: () => void;
  onCopyCode: () => void;
  onSelectBuddyToDelete: (buddy: BuddyItem) => void;
}

export default function BuddyHeroCard({
  buddyData,
  userName,
  userAvatar,
  cheeredJustNow,
  cheerCount,
  hasCopiedCode,
  onSendCheer,
  onOpenAddModal,
  onCopyCode,
  onSelectBuddyToDelete,
}: BuddyHeroCardProps) {
  const hasFriends = buddyData.friendsList && buddyData.friendsList.length > 0;

  if (hasFriends && buddyData.activeBuddy) {
    return (
      <Card variant='hero' padding='lg' className='relative overflow-hidden text-center'>
        <div className='flex items-center justify-between gap-1 mb-2'>
          <span className='text-xs font-bold text-[#e11d48] bg-white/80 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1'>
            <Crown size={12} className='text-amber-500' /> Partner Utama
          </span>
          <span className='text-[11px] font-semibold text-[#059669] bg-emerald-100 px-2.5 py-0.5 rounded-full'>
            {buddyData.sharedStreakCount} Minggu Kompak
          </span>
        </div>

        {/* Avatar Duel Bridge */}
        <div className='flex items-center justify-around my-5'>
          {/* User Side */}
          <div className='flex flex-col items-center'>
            <div className='w-16 sm:w-20 h-16 sm:h-20 rounded-full ring-4 ring-rose-400 overflow-hidden relative shadow-md'>
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className='object-cover'
                sizes='80px'
              />
            </div>
            <span className='text-xs sm:text-sm font-bold text-[#1e293b] mt-2'>
              {userName.split(' ')[0]} (Kamu)
            </span>
            <span className='text-[10px] sm:text-xs text-[#059669] font-bold flex items-center gap-0.5'>
              {buddyData.userStatusThisWeek === 'recorded' ? (
                <>
                  <CheckCircle2 size={12} /> Sudah Minum
                </>
              ) : (
                <>
                  <AlertCircle size={12} className='text-amber-500' /> Belum Dicatat
                </>
              )}
            </span>
          </div>

          {/* Center Flame Pillar */}
          <div className='flex flex-col items-center px-2'>
            <div className='w-18 sm:w-20 h-18 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-white flex flex-col items-center justify-center shadow-xl shadow-orange-500/30 animate-pulse'>
              <Flame size={32} className='fill-white' />
              <span className='text-base font-black -mt-1'>{buddyData.sharedStreakCount}</span>
            </div>
            <span className='text-[11px] font-black text-[#e11d48] mt-1.5 uppercase tracking-wider'>
              Minggu
            </span>
          </div>

          {/* Buddy Side */}
          <div className='flex flex-col items-center'>
            <div className='w-16 sm:w-20 h-16 sm:h-20 rounded-full ring-4 ring-amber-400 overflow-hidden relative shadow-md'>
              <Image
                src={buddyData.buddyAvatarUrl}
                alt={buddyData.buddyName}
                fill
                className='object-cover'
                sizes='80px'
              />
            </div>
            <span className='text-xs sm:text-sm font-bold text-[#1e293b] mt-2'>
              {buddyData.buddyName}
            </span>
            <span className='text-[10px] sm:text-xs text-[#059669] font-bold flex items-center gap-0.5'>
              {buddyData.buddyStatusThisWeek === 'recorded' ? (
                <>
                  <CheckCircle2 size={12} /> Sudah Minum
                </>
              ) : (
                <>
                  <AlertCircle size={12} className='text-amber-500' /> Belum Dicatat
                </>
              )}
            </span>
          </div>
        </div>

        <p className='text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xs mx-auto mb-5'>
          Hebat! Kamu dan <strong>{buddyData.buddyName}</strong> sudah konsisten selama{' '}
          <strong>{buddyData.sharedStreakCount} minggu berturut-turut</strong> tanpa melewatkan TTD!
        </p>

        {/* Cheer Action Button */}
        <div className='flex flex-col gap-2'>
          <Button
            variant={cheeredJustNow ? 'soft' : 'primary'}
            size='md'
            shape='pill'
            fullWidth
            icon={
              <Heart size={16} className={cheeredJustNow ? 'fill-rose-600 text-rose-600' : ''} />
            }
            onClick={onSendCheer}
          >
            {cheeredJustNow
              ? `Semangat Terkirim! (${cheerCount} Total ❤️)`
              : `Kirim Semangat ke ${buddyData.buddyName}`}
          </Button>

          <button
            type='button'
            onClick={() => {
              const currentActive = buddyData.friendsList.find(f => f.isActive);
              if (currentActive) onSelectBuddyToDelete(currentActive);
            }}
            className='text-[11px] text-[#94a3b8] hover:text-[#e11d48] font-medium transition-colors py-1 flex items-center justify-center gap-1 cursor-pointer'
          >
            <Trash2 size={12} />
            <span>Hapus {buddyData.buddyName} dari Buddy</span>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding='lg'
      className='text-center flex flex-col items-center gap-4 bg-[#fff5f7] border-2 border-dashed border-rose-200'
    >
      <div className='w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-[#e11d48] shadow-inner'>
        <UserPlus size={28} />
      </div>

      <div>
        <h3 className='text-base font-bold text-[#1e293b]'>Belum Ada Buddy Aktif</h3>
        <p className='text-xs text-[#64748b] max-w-xs mt-1 leading-relaxed'>
          Minum TTD lebih menyenangkan jika saling menyemangati bersama kawan sebaya. Tambahkan
          teman sekolahmu sekarang!
        </p>
      </div>

      <div className='w-full p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between gap-2'>
        <div className='text-left'>
          <span className='text-[10px] text-[#94a3b8] block'>Kode Teman Milikmu:</span>
          <span className='text-xs font-bold text-[#e11d48]'>
            {buddyData.userFriendCode || 'FE-SARAH-9901'}
          </span>
        </div>
        <Button
          variant='soft'
          size='sm'
          shape='pill'
          icon={hasCopiedCode ? <Check size={12} /> : <Copy size={12} />}
          onClick={onCopyCode}
        >
          {hasCopiedCode ? 'Tersalin' : 'Salin'}
        </Button>
      </div>

      <Button
        variant='primary'
        size='md'
        shape='pill'
        fullWidth
        icon={<Plus size={16} />}
        onClick={onOpenAddModal}
      >
        Tambah Sahabat Sekarang
      </Button>
    </Card>
  );
}
