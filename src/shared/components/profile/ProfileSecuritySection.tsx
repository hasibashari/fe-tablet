'use client';

import React from 'react';
import { LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface ProfileSecuritySectionProps {
  onLogoutClick: () => void;
  onChangePasswordClick?: () => void;
  lastLoginText?: string;
  twoFactorEnabled?: boolean;
}

export function ProfileSecuritySection({
  onLogoutClick,
  onChangePasswordClick,
  lastLoginText = 'Hari ini via Web Browser',
}: ProfileSecuritySectionProps) {
  return (
    <div className='rounded-3xl bg-white border border-rose-100/80 shadow-sm p-5 sm:p-6'>
      <div className='mb-4 pb-3 border-b border-slate-100'>
        <h2 className='text-sm sm:text-base font-bold text-slate-800'>Keamanan & Sesi Akun</h2>
        <p className='text-xs text-slate-400 mt-0.5'>Kelola autentikasi dan status sesi perangkat aktif</p>
      </div>

      <div className='space-y-3.5'>
        {/* Password Management Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0'>
              <KeyRound size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-800'>Kata Sandi Akun</p>
              <p className='text-[11px] text-slate-500'>Diperbarui secara berkala untuk proteksi optimal</p>
            </div>
          </div>
          {onChangePasswordClick && (
            <Button
              variant='outline'
              size='sm'
              shape='rounded'
              onClick={onChangePasswordClick}
              className='text-xs font-bold py-2 px-3.5 self-end sm:self-auto border-slate-200 hover:bg-slate-100 cursor-pointer'
            >
              Ubah Password
            </Button>
          )}
        </div>

        {/* Session & Logout Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/40 border border-rose-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-rose-200/60 text-rose-700 flex items-center justify-center shrink-0'>
              <LogOut size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-800'>Keluar dari Sesi</p>
              <p className='text-[11px] text-slate-500'>Sesi aktif: {lastLoginText}</p>
            </div>
          </div>
          <Button
            variant='danger'
            size='sm'
            shape='rounded'
            icon={<LogOut size={14} />}
            onClick={onLogoutClick}
            className='text-xs font-bold py-2 px-4 self-end sm:self-auto shadow-sm shadow-rose-200 cursor-pointer'
          >
            Keluar Akun
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSecuritySection;
