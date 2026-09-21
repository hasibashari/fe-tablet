'use client';

import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import { AdminSidebar, AdminMobileBottomNav } from '@/src/features/admin';
import { AuthGuard } from '@/src/features/auth';
import MobileTopBar from '@/src/shared/components/MobileTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev);
  };

  const adminBadge = (
    <Chip
      label='ADMIN'
      size='small'
      sx={{
        bgcolor: '#e11d48',
        color: '#ffffff',
        fontSize: '0.62rem',
        height: 18,
        fontWeight: 800,
        borderRadius: '9999px',
        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
      }}
    />
  );

  return (
    <AuthGuard requiredRole='admin'>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff5f7' }}
      >
        {/* Mobile Top App Bar (< md) */}
        <div className='block md:hidden'>
          <MobileTopBar
            onOpenSidebar={handleDrawerToggle}
            brandTitle='Fe-Tablet 🌸'
            brandSubtitle='Pusat Kontrol Admin'
            brandHref='/admin/dashboard'
            badge={adminBadge}
          />
        </div>

        <Box sx={{ display: 'flex', flexGrow: 1, minHeight: { md: '100vh' } }}>
          <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
          <Box
            component='main'
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'calc(100% - 260px)' },
              p: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
              pb: { xs: 12, md: 4 },
              minHeight: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ maxWidth: '1400px', width: '100%', mx: 'auto' }}>{children}</Box>
          </Box>
        </Box>

        {/* Fixed Mobile Bottom Navigation Bar (< md) */}
        <AdminMobileBottomNav />
      </Box>
    </AuthGuard>
  );
}
