'use client'

import React from 'react'
import UserSidebar from '../../features/user/components/UserSidebar'
import MobileTopBar from '@/src/shared/components/MobileTopBar'
import MobileBottomBar from '@/src/shared/components/MobileBottomBar'
import { AuthGuard } from '@/src/features/auth'
import { Box, Chip } from '@mui/material'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userBadge = (
    <Chip
      label="USER"
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
          brandTitle={
            <>
              Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
            </>
          }
          brandSubtitle="User Portal"
          brandHref="/user/dashboard"
          badge={userBadge}
        />

        <Box sx={{ display: 'flex', flexGrow: 1, minHeight: { md: '100vh' } }}>
          {/* Desktop Left Sidebar (>= md) */}
          <UserSidebar />

          {/* Main Page Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'calc(100% - 260px)' },
              p: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
              pb: { xs: 10, md: 4 }, // Safe bottom padding so bottom bar never obscures content
              minHeight: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ maxWidth: '1200px', width: '100%', mx: 'auto' }}>
              {children}
            </Box>
          </Box>
        </Box>

        {/* Mobile Bottom Navigation Bar (< md) */}
        <MobileBottomBar />
      </Box>
    </AuthGuard>
  )
}
