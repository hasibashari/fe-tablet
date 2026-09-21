'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { SplashScreenView } from '@/src/features/splash'

export interface GuestGuardProps {
  children: React.ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/user/dashboard')
      }
    }
  }, [isAuthenticated, isInitializing, user, router])

  if (isInitializing) {
    return <SplashScreenView statusText="Memeriksa sesi..." />
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default GuestGuard
