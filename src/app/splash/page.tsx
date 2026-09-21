'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Pill } from 'lucide-react'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has seen onboarding or is logged in
      const hasOnboarded = typeof window !== 'undefined' ? localStorage.getItem('fe_has_onboarded') : null
      if (!hasOnboarded) {
        router.push('/onboarding')
      } else {
        router.push('/user/dashboard')
      }
    }, 1800)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5f7] via-[#ffe4e6] to-[#fff5f7] flex flex-col items-center justify-between p-6 select-none">
      {/* Top spacer */}
      <div className="w-full" />

      {/* Center Branding Area */}
      <div className="flex flex-col items-center text-center animate-fade-in">
        {/* Animated Blood Droplet Mascot Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#fb7185] flex items-center justify-center text-white shadow-xl shadow-rose-500/30 animate-bounce">
            <Heart size={44} className="fill-white" />
          </div>
          {/* Floating Pill Accent */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-rose-300 flex items-center justify-center text-[#e11d48] shadow-md shadow-rose-500/20">
            <Pill size={16} className="rotate-45" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-1.5">
          <span>Fe-Tablet</span>
          <span className="text-2xl">🌸</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base font-semibold text-[#e11d48] mt-2 tracking-wide">
          Small habit, big impact.
        </p>

        <p className="text-xs text-[#64748b] mt-1">
          Pengingat & Monitoring Konsumsi Tablet Tambah Darah
        </p>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="flex flex-col items-center gap-3 pb-8">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping" />
          <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping delay-150" />
          <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping delay-300" />
        </div>
        <span className="text-[11px] text-[#94a3b8] font-medium">Memuat data kesehatan...</span>
      </div>
    </div>
  )
}
