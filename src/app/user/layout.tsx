'use client'

import React, { useState } from 'react'
import UserSidebar from '../../features/user/components/UserSidebar'
import MobileTopBar from '@/src/shared/components/MobileTopBar'
import { AuthGuard } from '@/src/features/auth'
import { Box, Chip } from '@mui/material'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev)
  }

  const patientBadge = (
    <Chip
      label="PATIENT"
      size="small"
      sx={{
        bgcolor: 'primary.light',
        color: 'primary.dark',
        fontSize: '0.62rem',
        height: 18,
        fontWeight: 700,
        borderRadius: '9999px',
      }}
    />
  )

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Mobile Top App Bar (< md) */}
        <MobileTopBar
          onOpenSidebar={handleDrawerToggle}
          brandTitle={
            <>
              Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
            </>
          }
          brandSubtitle="Patient Portal"
          brandHref="/user/dashboard"
          badge={patientBadge}
        />

        <Box sx={{ display: 'flex', flexGrow: 1, minHeight: { md: '100vh' } }}>
          <UserSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
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
            <Box sx={{ maxWidth: '1200px', width: '100%', mx: 'auto' }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  )
}
