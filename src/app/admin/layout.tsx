'use client';

import React, { useState } from 'react';
import { AdminSidebar, AdminMobileBottomNav } from '@/src/features/admin';
import { AuthGuard } from '@/src/features/auth';
import MobileTopBar from '@/src/shared/components/MobileTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev);
  };

  const adminBadge = (
    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm shadow-rose-200 uppercase tracking-wide">
      ADMIN
    </span>
  );

  return (
    <AuthGuard requiredRole='admin'>
      <div className="flex flex-col min-h-screen bg-[#fff5f7]">
        {/* Mobile Top App Bar (< md) */}
        <div className="block md:hidden">
          <MobileTopBar
            onOpenSidebar={handleDrawerToggle}
            brandTitle="Fe-Tablet 🌸"
            brandSubtitle="Pusat Kontrol Admin"
            brandHref="/admin/dashboard"
            badge={adminBadge}
          />
        </div>

        {/* Main Workspace Layout (Sidebar + Content) */}
        <div className="flex flex-col md:flex-row flex-1 min-h-screen">
          <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
          <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8 pb-28 md:pb-12 min-h-screen box-border">
            <div className="max-w-7xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Fixed Mobile Bottom Navigation Bar (< md) */}
        <AdminMobileBottomNav />
      </div>
    </AuthGuard>
  );
}
