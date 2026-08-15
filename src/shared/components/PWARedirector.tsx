'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isStandalonePWA } from '../utils/pwa'

export default function PWARedirector() {
  const router = useRouter()

  useEffect(() => {
    if (isStandalonePWA()) {
      router.replace('/user/dashboard')
    }
  }, [router])

  return null
}
