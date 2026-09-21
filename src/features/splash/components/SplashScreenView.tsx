'use client';

import React from 'react';
import { Heart, Pill, ShieldCheck, Sparkles } from 'lucide-react';

export interface SplashScreenViewProps {
  statusText?: string;
  fullScreen?: boolean;
}

export function SplashScreenView({
  statusText = 'Memuat data kesehatan...',
  fullScreen = true,
}: SplashScreenViewProps) {
  return (
    <div
      className={`relative w-full ${
        fullScreen ? 'h-[100dvh] max-h-[100dvh]' : 'h-full min-h-[420px]'
      } bg-gradient-to-b from-[#fff5f7] via-[#ffe4e6] to-[#fff5f7] flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 select-none overflow-hidden box-border`}
    >
      {/* Ambient background glow orbs */}
      <div className='absolute top-1/4 -left-20 w-64 h-64 bg-rose-400/15 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-1/4 -right-20 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none' />

      {/* Top Header: Badge Pill (Shrink-0) */}
      <div className='shrink-0 w-full pt-safe flex items-center justify-center'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs border border-rose-200/60 text-[10.5px] sm:text-[11px] font-semibold text-rose-700 shadow-2xs'>
          <ShieldCheck size={13} className='text-[#e11d48]' />
          <span>Kementerian Kesehatan RI • PWA Standar</span>
        </div>
      </div>

      {/* Center Branding & Mascot Area (Flex-1 Min-h-0 Justify-Center) */}
      <div className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto px-4 max-w-sm sm:max-w-md w-full animate-fade-in'>
        {/* Animated Mascot with Layered Pulse Aura */}
        <div className='relative mb-4 sm:mb-6 flex items-center justify-center'>
          {/* Outer Pulsing Glow Wave */}
          <div className='absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-rose-400/20 animate-ping opacity-75 pointer-events-none' />

          {/* Middle Soft Ring */}
          <div className='absolute w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-rose-500/15 animate-pulse pointer-events-none' />

          {/* Core Mascot Icon Box */}
          <div className='relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-[#e11d48] to-[#fb7185] flex items-center justify-center text-white shadow-xl shadow-rose-500/35 transform hover:scale-105 transition-transform duration-300'>
            <Heart size={38} className='sm:w-11 sm:h-11 fill-white drop-shadow-sm animate-pulse' />
          </div>

          {/* Floating Pill Accent Icon */}
          <div className='absolute -bottom-1.5 -right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-rose-300 flex items-center justify-center text-[#e11d48] shadow-md shadow-rose-500/20'>
            <Pill size={16} className='rotate-45' />
          </div>
        </div>

        {/* Brand Name Title */}
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight flex items-center justify-center gap-1.5 mb-1'>
          <span>Fe-Tablet</span>
          <span className='text-xl sm:text-2xl'>🌸</span>
        </h1>

        {/* Brand Tagline */}
        <p className='text-xs sm:text-sm font-bold text-[#e11d48] tracking-wide flex items-center gap-1 mb-1.5'>
          <Sparkles size={13} className='text-rose-500 shrink-0' />
          <span>Small habit, big impact.</span>
        </p>

        {/* Educational Purpose Pill */}
        <p className='text-[11px] sm:text-xs text-[#64748b] leading-relaxed max-w-xs font-medium'>
          Pengingat & Monitoring Konsumsi Tablet Tambah Darah Remaja Putri & WUS
        </p>
      </div>

      {/* Bottom Loading Bar Indicator (Shrink-0) */}
      <div className='shrink-0 w-full max-w-xs flex flex-col items-center gap-2 pb-safe pb-4 sm:pb-6'>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#e11d48] animate-bounce delay-0' />
          <span className='w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#fb7185] animate-bounce delay-150' />
          <span className='w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#f43f5e] animate-bounce delay-300' />
        </div>
        <span className='text-[11px] sm:text-xs text-[#94a3b8] font-semibold tracking-wide'>
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default SplashScreenView;
