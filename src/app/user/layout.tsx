'use client'

import React from 'react'
import MobileTopBar from '@/src/shared/components/MobileTopBar'
import MobileBottomBar from '@/src/shared/components/MobileBottomBar'
import UserSidebar from '@/src/features/user/components/UserSidebar'
import { AuthGuard } from '@/src/features/auth'
import { MOCK_USER } from '@/src/shared/mock/feTabletData'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fff5f7] flex flex-col md:flex-row selection:bg-rose-200 selection:text-rose-900">
        {/* Mobile Top Header (< md) */}
        <div className="block md:hidden">
          <MobileTopBar
            userName={MOCK_USER.name.split(' ')[0]}
            avatarUrl={MOCK_USER.avatarUrl}
          />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className="hidden md:block shrink-0">
          <UserSidebar />
        </div>

        {/* Main Content Area: Mobile-First fluid -> Tablet/Desktop max-w-6xl */}
        <main className="flex-1 w-full max-w-full md:max-w-6xl mx-auto px-4 py-4 pb-28 md:p-8 md:pb-12 min-h-screen box-sizing">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />
      </div>
    </AuthGuard>
  )
}
