'use client';

import React from 'react';
import Image from 'next/image';
import { Users, Plus, Flame, Heart, Crown, Trash2, UserPlus } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { BuddyItem } from '../types';

interface BuddyFriendsListProps {
  friendsList: BuddyItem[];
  activeBuddyName?: string;
  onOpenAddModal: () => void;
  onSendCheer: (buddyId: string, connectionId: string, name: string) => void;
  onSwitchActiveBuddy: (connectionId: string) => void;
  onSelectBuddyToDelete: (buddy: BuddyItem) => void;
}

export default function BuddyFriendsList({
  friendsList,
  activeBuddyName,
  onOpenAddModal,
  onSendCheer,
  onSwitchActiveBuddy,
  onSelectBuddyToDelete,
}: BuddyFriendsListProps) {
  // Filter out the active hero buddy so it doesn't duplicate
  const otherFriends = friendsList ? friendsList.filter(f => !f.isActive) : [];
  const hasActiveBuddy = friendsList ? friendsList.some(f => f.isActive) : false;

  return (
    <Card padding='lg'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2'>
          <Users size={18} className='text-[#e11d48]' />
          <span>Sahabat Lainnya ({otherFriends.length})</span>
        </h4>
        <button
          type='button'
          onClick={onOpenAddModal}
          className='text-xs font-bold text-[#e11d48] hover:underline flex items-center gap-1 cursor-pointer'
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      {otherFriends.length > 0 ? (
        <div className='flex flex-col divide-y divide-[#fce7f3]'>
          {otherFriends.map(friend => (
            <div
              key={friend.connectionId}
              className='py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors rounded-xl px-2'
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

                <button
                  type='button'
                  title='Jadikan partner duel utama di hero'
                  onClick={() => onSwitchActiveBuddy(friend.connectionId)}
                  className='w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer'
                >
                  <Crown size={15} />
                </button>

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
      ) : hasActiveBuddy ? (
        <div className='bg-[#fff5f7]/60 border border-dashed border-rose-200 rounded-2xl p-5 text-center flex flex-col items-center gap-2.5 my-1'>
          <div className='w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-2xs'>
            <UserPlus size={18} />
          </div>
          <div>
            <h5 className='text-xs sm:text-sm font-bold text-[#1e293b]'>
              Tambah Sahabat Lainnya
            </h5>
            <p className='text-xs text-[#64748b] max-w-xs mt-0.5 leading-relaxed'>
              {activeBuddyName ? (
                <>
                  <strong>{activeBuddyName}</strong> aktif sebagai partner utamamu. Tambah teman
                  sekolah lainnya untuk memperluas jejaring dukungan sehatmu!
                </>
              ) : (
                'Tambah teman sekolah lainnya untuk saling mengingatkan minum TTD setiap minggu!'
              )}
            </p>
          </div>
          <Button
            variant='soft'
            size='sm'
            shape='pill'
            icon={<Plus size={14} />}
            onClick={onOpenAddModal}
            className='text-xs mt-1'
          >
            Tambah Buddy Baru
          </Button>
        </div>
      ) : (
        <div className='py-6 text-center text-xs text-[#94a3b8]'>
          Belum ada teman terhubung. Bagikan kode temanmu untuk mulai berduet!
        </div>
      )}
    </Card>
  );
}
