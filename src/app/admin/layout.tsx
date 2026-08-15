'use client'

import React, { useState } from 'react'
import { Box, Chip } from '@mui/material'
import { AdminSidebar, AdminPWABlocker } from '@/src/features/admin'
import { AuthGuard } from '@/src/features/auth'
import MobileTopBar from '@/src/shared/components/MobileTopBar'
import { usePWA } from '@/src/shared/hooks/usePWA'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isPWA } = usePWA()

  if (isPWA) {
    return <AdminPWABlocker />
  }

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev)
  }

  const adminBadge = (
    <Chip
      label="ADMIN"
      size="small"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: '0.62rem',
        height: 18,
        fontWeight: 700,
        borderRadius: '9999px',
      }}
    />
  )

  return (
    <AuthGuard requiredRole="admin">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Mobile Top App Bar (< md) */}
        <MobileTopBar
          onOpenSidebar={handleDrawerToggle}
          brandTitle={
            <>
              Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
            </>
          }
          brandSubtitle="Clinical Control Center"
          brandHref="/admin/dashboard"
          badge={adminBadge}
        />

        <Box sx={{ display: 'flex', flexGrow: 1, minHeight: { md: '100vh' } }}>
          <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'calc(100% - 260px)' },
              p: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
              minHeight: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ maxWidth: '1400px', width: '100%', mx: 'auto' }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  )
}

