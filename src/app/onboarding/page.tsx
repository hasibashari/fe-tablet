'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, LineChart, Flame, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/Button'

interface SlideData {
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge: string
  colorClass: string
}

const ONBOARDING_SLIDES: SlideData[] = [
  {
    title: 'Pengingat Tepat Waktu',
    subtitle: 'Jangan Lewatkan Tabletmu 💊',
    description:
      'Pengingat otomatis setiap minggu agar kamu tidak lupa minum Tablet Tambah Darah (TTD) setelah sarapan atau sebelum tidur.',
    icon: Clock,
    badge: 'Jadwal Otomatis',
    colorClass: 'from-rose-500 to-rose-600',
  },
  {
    title: 'Pantau Kepatuhanmu',
    subtitle: 'Catat & Lihat Grafik Sehatmu 📊',
    description:
      'Rekam status konsumsi mingguan dengan satu sentuhan dan pantau perkembangan grafik kepatuhan bulananmu.',
    icon: LineChart,
    badge: 'Monitoring Harian & Bulanan',
    colorClass: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Buddy Streak & Asisten AI',
    subtitle: 'Cegah Anemia Bersama Sahabat 🔥',
    description:
      'Pertahankan streak sehat bersama sahabat dan konsultasikan keluhan atau efek samping TTD langsung ke Asisten Pintar.',
    icon: Flame,
    badge: 'Dukungan Sosial & AI Pintar',
    colorClass: 'from-amber-500 to-rose-600',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fe_has_onboarded', 'true')
    }
    router.push('/auth/login')
  }

  const slide = ONBOARDING_SLIDES[currentSlide]
  const Icon = slide.icon
  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1

  return (
    <div className="min-h-screen bg-[#fff5f7] flex flex-col justify-between max-w-md mx-auto p-6 select-none">
      {/* Top Header: Skip button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-bold text-[#e11d48] bg-[#ffe4e6] px-3 py-1 rounded-full">
          Langkah {currentSlide + 1} dari {ONBOARDING_SLIDES.length}
        </span>

        {!isLast && (
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-semibold text-[#64748b] hover:text-[#e11d48] px-2 py-1 transition-colors cursor-pointer"
          >
            Lewati
          </button>
        )}
      </div>

      {/* Center Slide Content */}
      <div className="flex flex-col items-center text-center my-auto py-6">
        {/* Animated Icon Circle */}
        <div className="relative mb-8">
          <div
            className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${slide.colorClass} text-white flex items-center justify-center shadow-xl shadow-rose-500/20 transform transition-all duration-300 hover:scale-105`}
          >
            <Icon size={52} />
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white text-[11px] font-bold text-[#1e293b] px-3 py-0.5 rounded-full border border-rose-200 shadow-xs whitespace-nowrap">
            {slide.badge}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight mb-1">
          {slide.title}
        </h2>

        <h3 className="text-sm font-semibold text-[#e11d48] mb-3">
          {slide.subtitle}
        </h3>

        <p className="text-sm text-[#475569] leading-relaxed max-w-xs px-2">
          {slide.description}
        </p>
      </div>

      {/* Bottom Area: Pagination Dots & Action CTA */}
      <div className="flex flex-col gap-6 pb-4">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#e11d48]' : 'w-2 bg-[#fce7f3] hover:bg-rose-200'
              }`}
              aria-label={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          shape="pill"
          fullWidth
          icon={isLast ? <Check size={18} /> : <ArrowRight size={18} />}
          onClick={handleNext}
        >
          {isLast ? 'Mulai Sekarang' : 'Lanjutkan'}
        </Button>
      </div>
    </div>
  )
}
