'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Clock,
  CalendarCheck,
  BookOpen,
  Flame,
  Bot,
  User,
  LogOut,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth';
import { MOCK_USER } from '@/src/shared/mock/feTabletData';

export const USER_NAV_ITEMS = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Pengingat', href: '/user/schedule', icon: Clock },
  { name: 'Monitoring', href: '/user/history', icon: CalendarCheck },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Buddy Streak', href: '/user/buddy', icon: Flame },
  { name: 'Konsultasi AI', href: '/user/consultation', icon: Bot },
  { name: 'Profil & Akun', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#fce7f3] flex flex-col justify-between p-4 z-40 select-none shadow-xs'>
      {/* Brand & Logo Header */}
      <div>
        <Link
          href='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#fff5f7] transition-colors mb-4'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#fb7185] text-white flex items-center justify-center shadow-md shadow-rose-500/25'>
            <Heart size={20} className='fill-white' />
          </div>
          <div>
            <div className='flex items-center gap-1'>
              <span className='text-base font-extrabold text-[#1e293b] tracking-tight'>
                Fe-Tablet
              </span>
              <span className='text-sm'>🌸</span>
            </div>
            <span className='text-[11px] font-semibold text-[#e11d48]'>Portal Pasien</span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className='flex flex-col gap-1'>
          {USER_NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/user/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#ffe4e6] text-[#e11d48] shadow-xs'
                    : 'text-[#475569] hover:bg-[#fff5f7] hover:text-[#e11d48]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#e11d48]' : 'text-[#64748b]'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Card & Sign Out */}
      <div className='pt-4 border-t border-[#fce7f3] flex flex-col gap-2.5'>
        {/* User Badge */}
        <Link
          href='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#fff5f7] border border-[#fce7f3] hover:border-rose-300 transition-colors'
        >
          <div className='w-9 h-9 rounded-full ring-2 ring-rose-200 overflow-hidden relative shrink-0'>
            <Image
              src={MOCK_USER.avatarUrl}
              alt={MOCK_USER.name}
              fill
              className='object-cover'
              sizes='36px'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#1e293b] truncate block'>
              {MOCK_USER.name}
            </span>
            <span className='text-[10px] text-[#059669] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>{MOCK_USER.streakCount} Minggu Streak</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#e11d48] hover:bg-[#fff1f2] rounded-xl transition-colors cursor-pointer'
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
