'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../types/auth.types'
import { Box, CircularProgress, Typography } from '@mui/material'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (requiredRole && user?.role !== requiredRole) {
        // If role doesn't match, redirect to the user's correct home
        if (user?.role === 'admin') {
          router.replace('/admin/dashboard')
        } else {
          router.replace('/user/dashboard')
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, pathname])

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#f8fafc',
        }}
      >
        <CircularProgress size={36} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Memverifikasi sesi pengguna...
        </Typography>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
