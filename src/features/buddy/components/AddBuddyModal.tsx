'use client';

import React from 'react';
import { UserPlus, X, Copy, Check } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

interface AddBuddyModalProps {
  open: boolean;
  userFriendCode: string;
  friendCodeInput: string;
  isSubmitting: boolean;
  hasCopiedCode: boolean;
  onClose: () => void;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCopyCode: () => void;
}

export default function AddBuddyModal({
  open,
  userFriendCode,
  friendCodeInput,
  isSubmitting,
  hasCopiedCode,
  onClose,
  onInputChange,
  onSubmit,
  onCopyCode,
}: AddBuddyModalProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      {/* Backdrop Click Dismiss */}
      <div className='absolute inset-0' onClick={onClose} />
      <div className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#fce7f3]'>
        <div className='flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4'>
          <h3 className='text-base font-bold text-[#1e293b] flex items-center gap-2'>
            <UserPlus size={18} className='text-[#e11d48]' />
            <span>Tambah Sahabat Sehat</span>
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
              Masukkan Kode Teman Sahabatmu:
            </label>
            <input
              type='text'
              placeholder='Contoh: FE-ALYA-2026 atau FE-NADIA-7712'
              value={friendCodeInput}
              onChange={e => onInputChange(e.target.value)}
              className='w-full bg-white text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] focus:border-[#e11d48] px-4 py-3 outline-none uppercase font-mono'
              required
            />
            <span className='text-[11px] text-[#94a3b8] mt-1 block'>
              Mintalah kode teman dari sahabat sekolahmu untuk terhubung.
            </span>
          </div>

          {/* User's Own Friend Code Box */}
          <div className='p-3.5 bg-[#fff5f7] rounded-xl border border-[#fce7f3] flex items-center justify-between'>
            <div>
              <span className='text-[11px] text-[#64748b] block'>Kode Buddy Milikmu:</span>
              <span className='text-base font-extrabold text-[#e11d48] font-mono'>
                {userFriendCode || 'FE-SARAH-9901'}
              </span>
            </div>
            <Button
              type='button'
              variant='soft'
              size='sm'
              shape='pill'
              icon={
                hasCopiedCode ? (
                  <Check size={14} className='text-emerald-600' />
                ) : (
                  <Copy size={14} />
                )
              }
              onClick={onCopyCode}
            >
              {hasCopiedCode ? 'Tersalin' : 'Salin Kode'}
            </Button>
          </div>

          <div className='flex items-center gap-2.5 pt-2'>
            <Button
              type='button'
              variant='outline'
              size='md'
              shape='pill'
              className='flex-1'
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='md'
              shape='pill'
              className='flex-1'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menghubungkan...' : 'Kirim Undangan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
