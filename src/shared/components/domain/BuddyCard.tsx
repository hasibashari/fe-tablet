'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Flame, Heart, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
export interface BuddyStreakInfo {
  buddyName: string;
  buddyavatarUrl: string;
  streakCount: number;
}

export interface BuddyCardProps {
  buddyData: BuddyStreakInfo;
  useravatarUrl?: string;
  userName?: string;
}

export function BuddyCard({
  buddyData,
  useravatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  userName = 'Sarah',
}: BuddyCardProps) {
  const [cheerCount, setCheerCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);

  const handleCheer = () => {
    setCheerCount(prev => prev + 1);
    setHasCheered(true);
  };

  return (
    <Card padding='md' className='w-full'>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='text-sm font-bold text-[#1e293b]'>Streak Bersama</h4>
        <span className='text-xs font-semibold text-[#be123c] bg-[#ffe4e6] px-2.5 py-0.5 rounded-full'>
          Partner Sehat
        </span>
      </div>

      {/* Duo-avatarUrl Streak Header */}
      <div className='bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between my-2'>
        {/* Left User */}
        <div className='flex flex-col items-center'>
          <div className='w-12 h-12 rounded-full ring-3 ring-rose-400 overflow-hidden relative shadow-sm'>
            <Image src={useravatarUrl} alt={userName} fill className='object-cover' sizes='48px' />
          </div>
          <span className='text-xs font-bold text-[#1e293b] mt-1.5'>{userName} (Kamu)</span>
          <span className='text-[10px] text-[#059669] font-semibold flex items-center gap-0.5'>
            <CheckCircle2 size={10} /> Sudah
          </span>
        </div>

        {/* Center Flame Badge */}
        <div className='flex flex-col items-center px-2'>
          <div className='w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/25 animate-pulse'>
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
          <span className='text-xs font-bold text-[#1e293b] mt-1.5'>{buddyData.buddyName}</span>
          <span className='text-[10px] text-[#059669] font-semibold flex items-center gap-0.5'>
            <CheckCircle2 size={10} /> Sudah
          </span>
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
          : `Kirim Semangat ke ${buddyData.buddyName}`}
      </Button>
    </Card>
  );
}
