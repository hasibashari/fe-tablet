'use client';

import React from 'react';
import Image from 'next/image';
import { Users, Plus, Flame, Heart, Crown, Trash2 } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { BuddyItem } from '../types';

interface BuddyFriendsListProps {
  friendsList: BuddyItem[];
  onOpenAddModal: () => void;
  onSendCheer: (buddyId: string, connectionId: string, name: string) => void;
  onSwitchActiveBuddy: (connectionId: string) => void;
  onSelectBuddyToDelete: (buddy: BuddyItem) => void;
}

export default function BuddyFriendsList({
  friendsList,
  onOpenAddModal,
  onSendCheer,
  onSwitchActiveBuddy,
  onSelectBuddyToDelete,
}: BuddyFriendsListProps) {
  const hasFriends = friendsList && friendsList.length > 0;

  return (
    <Card padding='lg'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2'>
          <Users size={18} className='text-[#e11d48]' />
          <span>Daftar Sahabat Sehat ({friendsList.length})</span>
        </h4>
        <button
          type='button'
          onClick={onOpenAddModal}
          className='text-xs font-bold text-[#e11d48] hover:underline flex items-center gap-1 cursor-pointer'
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      {hasFriends ? (
        <div className='flex flex-col divide-y divide-[#fce7f3]'>
          {friendsList.map(friend => (
            <div
              key={friend.connectionId}
              className={`py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 transition-colors rounded-xl px-2 ${
                friend.isActive ? 'bg-[#fff5f7]/70' : 'hover:bg-slate-50'
              }`}
            >
              {/* Friend Avatar & Info */}
              <div className='flex items-center gap-3 min-w-0'>
                <div className='relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-rose-300'>
                  <Image
                    src={friend.avatarUrl}
                    alt={friend.name}
                    fill
                    className='object-cover'
                    sizes='44px'
                  />
                </div>

                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs sm:text-sm font-bold text-[#1e293b] truncate'>
                      {friend.name}
                    </span>
                    {friend.isActive && (
                      <span className='text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded-full shrink-0'>
                        Utama
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <span className='text-[11px] font-bold text-[#e11d48] flex items-center gap-0.5'>
                      <Flame size={12} className='fill-orange-500 text-orange-500' />{' '}
                      {friend.sharedStreakCount} Minggu
                    </span>
                    <span className='text-[10px] text-[#94a3b8]'>•</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                        friend.statusThisWeek === 'recorded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {friend.statusThisWeek === 'recorded' ? '✓ Sudah Minum' : '⚪ Belum'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Friend Actions (Cheer, Make Active, Remove) */}
              <div className='flex items-center gap-1.5 shrink-0'>
                <button
                  type='button'
                  title={`Kirim semangat ke ${friend.name}`}
                  onClick={() =>
                    onSendCheer(friend.buddyId, friend.connectionId, friend.name)
                  }
                  className='w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-transform active:scale-90 cursor-pointer'
                >
                  <Heart size={15} className='fill-rose-500' />
                </button>

                {!friend.isActive && (
                  <button
                    type='button'
                    title='Jadikan partner duel utama di hero'
                    onClick={() => onSwitchActiveBuddy(friend.connectionId)}
                    className='w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer'
                  >
                    <Crown size={15} />
                  </button>
                )}

                <button
                  type='button'
                  title={`Hapus ${friend.name} dari teman`}
                  onClick={() => onSelectBuddyToDelete(friend)}
                  className='w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-transform active:scale-90 cursor-pointer'
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-6 text-center text-xs text-[#94a3b8]'>
          Belum ada teman terhubung. Bagikan kode temanmu untuk mulai berduet!
        </div>
      )}
    </Card>
  );
}
