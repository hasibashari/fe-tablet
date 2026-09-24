'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  BarChart3,
  LogOut,
  Heart,
  User,
} from 'lucide-react';
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar';
import { useAuth } from '@/src/features/auth';

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Data Siswi & User', href: '/admin/users', icon: Users },
  { name: 'Jadwal & Pengingat', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Artikel Edukasi', href: '/admin/articles', icon: FileText },
  { name: 'Laporan & Analitik', href: '/admin/reports', icon: BarChart3 },
  { name: 'Profil Admin', href: '/admin/profile', icon: User },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const adminBadge = (
    <span className='px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm shadow-rose-200 uppercase tracking-wide'>
      ADMIN
    </span>
  );

  const signOutFooter = (
    <div className='flex flex-col gap-2'>
      {user && (
        <div className='p-2.5 rounded-2xl bg-[#fff5f7] border border-pink-100 flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border-2 border-rose-400 overflow-hidden'>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className='w-full h-full object-cover' />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-bold text-xs text-slate-800 truncate leading-tight'>
              {user.name}
            </div>
            <div className='text-[11px] text-slate-500 truncate'>{user.email}</div>
          </div>
        </div>
      )}

      <button
        type='button'
        onClick={logout}
        className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 font-semibold text-xs hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer'
      >
        <LogOut size={16} />
        <span>Keluar (Sign Out)</span>
      </button>
    </div>
  );

  return (
    <AppSidebar
      navItems={adminNavItems}
      brandTitle='Fe-Tablet'
      brandSubtitle='Pusat Kontrol Admin'
      brandIcon={Heart}
      brandHref='/admin/dashboard'
      badge={adminBadge}
      footerAction={signOutFooter}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
