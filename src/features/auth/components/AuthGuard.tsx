'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';
import { SplashScreenView } from '@/src/features/splash';

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isAuthenticated, isInitializing, hasCompletedOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } else if (requiredRole && user?.role !== requiredRole) {
        // If role doesn't match, redirect to appropriate home
        if (user?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/user/dashboard');
        }
      }
    }
  }, [
    isAuthenticated,
    isInitializing,
    hasCompletedOnboarding,
    user,
    requiredRole,
    router,
    pathname,
  ]);

  if (isInitializing) {
    return <SplashScreenView statusText='Memverifikasi sesi...' />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
