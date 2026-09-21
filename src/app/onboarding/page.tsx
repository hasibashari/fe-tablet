'use client'

import React from 'react'
import { OnboardingView } from '@/src/features/onboarding'
import { GuestGuard } from '@/src/features/auth'

export default function OnboardingPage() {
  return (
    <GuestGuard>
      <OnboardingView />
    </GuestGuard>
  )
}
