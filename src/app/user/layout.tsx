'use client';

import React from 'react';
import MobileTopBar from '@/src/shared/components/MobileTopBar';
import MobileBottomBar from '@/src/shared/components/MobileBottomBar';
import UserSidebar from '@/src/features/user/components/UserSidebar';
import { AuthGuard, useAuth } from '@/src/features/auth';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Sarah';
  const avatarUrl = user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FeTablet';

  return (
    <AuthGuard>
      <div className='min-h-screen bg-[#fff5f7] flex flex-col md:flex-row selection:bg-rose-200 selection:text-rose-900'>
        {/* Mobile Top Header (< md) */}
        <div className='block md:hidden'>
          <MobileTopBar userName={displayName} avatarUrl={avatarUrl} />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className='hidden md:block shrink-0'>
          <UserSidebar />
        </div>

        {/* Main Content Area: Mobile-First fluid -> Tablet/Desktop max-w-6xl */}
        <main className='flex-1 w-full max-w-full md:max-w-6xl mx-auto px-4 py-4 pb-28 md:p-8 md:pb-12 min-h-screen box-sizing'>
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />
      </div>
    </AuthGuard>
  );
}
