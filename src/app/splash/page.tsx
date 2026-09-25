'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreenView } from '@/src/features/splash';
import { useAuth } from '@/src/features/auth';

export default function SplashScreenPage() {
  const router = useRouter();
  const { isInitializing, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isInitializing) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          if (user?.role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/user/dashboard');
          }
        } else {
          router.replace('/onboarding');
        }
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [isInitializing, isAuthenticated, user, router]);

  return <SplashScreenView />;
}
