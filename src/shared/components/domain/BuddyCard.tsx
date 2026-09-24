'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Heart, CheckCircle2, Clock, XCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface BuddyStreakInfo {
  connectionId?: string;
  buddyId?: string;
  buddyName: string;
  buddyavatarUrl: string;
  streakCount: number;
  userStatusThisWeek?: 'recorded' | 'missed' | 'pending';
  buddyStatusThisWeek?: 'recorded' | 'missed' | 'pending';
}

export interface BuddyCardProps {
  buddyData?: BuddyStreakInfo | null;
  useravatarUrl?: string;
  userName?: string;
  userStatusThisWeek?: 'recorded' | 'missed' | 'pending';
  onCheer?: (connectionId: string, buddyId: string) => void | Promise<void>;
}

export function BuddyCard({
  buddyData,
  useravatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  userName = 'Sarah',
  userStatusThisWeek = 'pending',
  onCheer,
}: BuddyCardProps) {
  const [cheerCount, setCheerCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [isCheering, setIsCheering] = useState(false);

  const effectiveUserStatus = buddyData?.userStatusThisWeek || userStatusThisWeek;
  const effectiveBuddyStatus = buddyData?.buddyStatusThisWeek || 'pending';

  const handleCheer = async () => {
    if (isCheering || hasCheered) return;
    setIsCheering(true);
    setCheerCount(prev => prev + 1);
    setHasCheered(true);

    if (onCheer && buddyData?.connectionId && buddyData?.buddyId) {
      try {
        await onCheer(buddyData.connectionId, buddyData.buddyId);
      } catch (err) {
        console.error('Failed to send cheer:', err);
      }
    }
    setIsCheering(false);
  };

  // Helper render status badge
  const renderStatusBadge = (status: 'recorded' | 'missed' | 'pending') => {
    if (status === 'recorded') {
      return (
        <span className='text-[10px] text-[#059669] font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200'>
          <CheckCircle2 size={10} /> Sudah
        </span>
      );
    }
    if (status === 'missed') {
      return (
        <span className='text-[10px] text-[#e11d48] font-bold flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200'>
          <XCircle size={10} /> Lewat
        </span>
      );
    }
    return (
      <span className='text-[10px] text-amber-600 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200'>
        <Clock size={10} /> Belum
      </span>
    );
  };

  // 1. EMPTY / INVITE STATE: If no active buddy is connected in database
  if (!buddyData || !buddyData.buddyName) {
    return (
      <Card padding='md' className='w-full'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-bold text-[#1e293b]'>Streak Bersama</h4>
          <span className='text-xs font-semibold text-[#be123c] bg-[#ffe4e6] px-2.5 py-0.5 rounded-full'>
            Partner Sehat
          </span>
        </div>

        <div className='bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/70 rounded-2xl p-4 flex flex-col items-center text-center my-2'>
          <div className='relative flex items-center justify-center -space-x-2 mb-2.5'>
            <div className='w-11 h-11 rounded-full ring-2 ring-rose-400 overflow-hidden relative shadow-sm'>
              <Image src={useravatarUrl} alt={userName} fill className='object-cover' sizes='44px' />
            </div>
            <div className='w-11 h-11 rounded-full bg-rose-100 border-2 border-dashed border-rose-300 flex items-center justify-center text-rose-500 shadow-sm'>
              <UserPlus size={18} />
            </div>
          </div>

          <h5 className='text-xs font-bold text-slate-800 mb-1'>Belum Ada Buddy Sehat</h5>
          <p className='text-[11.5px] text-slate-500 max-w-xs leading-relaxed mb-3'>
            Ajak sahabat atau teman sekolahmu untuk saling mengingatkan jadwal minum TTD dan bangun streak bersama!
          </p>

          <Link href='/user/buddy' className='w-full'>
            <Button
              variant='primary'
              size='sm'
              shape='pill'
              fullWidth
              icon={<ArrowRight size={14} />}
              className='text-xs font-bold py-2'
            >
              Ajak Sahabat Sekarang
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // 2. ACTIVE BUDDY STATE: Real connected buddy data from database
  return (
    <Card padding='md' className='w-full'>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='text-sm font-bold text-[#1e293b]'>Streak Bersama</h4>
        <Link
          href='/user/buddy'
          className='text-xs font-semibold text-[#be123c] hover:underline bg-[#ffe4e6] px-2.5 py-0.5 rounded-full'
        >
          Lihat Semua Partner ({buddyData.streakCount} Mgg)
        </Link>
      </div>

      {/* Duo-avatar Streak Header */}
      <div className='bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between my-2'>
        {/* Left User */}
        <div className='flex flex-col items-center'>
          <div className='w-12 h-12 rounded-full ring-3 ring-rose-400 overflow-hidden relative shadow-sm'>
            <Image src={useravatarUrl} alt={userName} fill className='object-cover' sizes='48px' />
          </div>
          <span className='text-xs font-bold text-[#1e293b] mt-1.5 truncate max-w-[70px] sm:max-w-[80px]'>
            {userName} (Kamu)
          </span>
          <div className='mt-0.5'>{renderStatusBadge(effectiveUserStatus)}</div>
        </div>

        {/* Center Flame Badge */}
        <div className='flex flex-col items-center px-2'>
          <div className='w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/25 animate-pulse'>
            <Flame size={20} className='fill-white' />
            <span className='text-xs font-extrabold -mt-0.5'>{buddyData.streakCount}</span>
          </div>
          <span className='text-[10px] font-bold text-[#e11d48] mt-1 uppercase tracking-wider'>
            Minggu Streak
          </span>
        </div>

        {/* Right Buddy */}
        <div className='flex flex-col items-center'>
          <div className='w-12 h-12 rounded-full ring-3 ring-amber-400 overflow-hidden relative shadow-sm'>
            <Image
              src={buddyData.buddyavatarUrl}
              alt={buddyData.buddyName}
              fill
              className='object-cover'
              sizes='48px'
            />
          </div>
          <span className='text-xs font-bold text-[#1e293b] mt-1.5 truncate max-w-[70px] sm:max-w-[80px]'>
            {buddyData.buddyName.split(' ')[0]}
          </span>
          <div className='mt-0.5'>{renderStatusBadge(effectiveBuddyStatus)}</div>
        </div>
      </div>

      <p className='text-xs text-center text-[#475569] my-3 leading-relaxed'>
        🎉 Hebat! Kamu dan <strong>{buddyData.buddyName}</strong> sudah konsisten minum TTD selama{' '}
        <strong>{buddyData.streakCount} minggu berturut-turut!</strong>
      </p>

      {/* Cheer Button */}
      <Button
        variant={hasCheered ? 'soft' : 'primary'}
        size='sm'
        shape='pill'
        fullWidth
        icon={
          hasCheered ? (
            <Heart size={16} className='text-rose-600 fill-rose-600' />
          ) : (
            <Heart size={16} />
          )
        }
        onClick={handleCheer}
      >
        {hasCheered
          ? `Terkirim! (${cheerCount} Semangat Dikirim ❤️)`
          : `Kirim Semangat ke ${buddyData.buddyName.split(' ')[0]}`}
      </Button>
    </Card>
  );
}

export default BuddyCard;
