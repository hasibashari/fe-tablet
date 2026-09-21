import React from 'react'
import { Clock, LineChart, Flame, BellRing, Sparkles, HeartHandshake } from 'lucide-react'

export interface OnboardingFeatureChip {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export interface OnboardingSlide {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge: string
  gradientClass: string
  shadowClass: string
  bgSoftClass: string
  textColorClass: string
  highlights: OnboardingFeatureChip[]
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'reminder',
    title: 'Pengingat Tepat Waktu',
    subtitle: 'Jangan Lewatkan Tabletmu 💊',
    description:
      'Pengingat otomatis setiap minggu agar kamu tidak lupa minum Tablet Tambah Darah (TTD) setelah sarapan atau sebelum tidur.',
    icon: Clock,
    badge: 'Jadwal Mingguan Otomatis',
    gradientClass: 'from-[#e11d48] to-[#fb7185]',
    shadowClass: 'shadow-rose-500/25',
    bgSoftClass: 'bg-rose-50 text-rose-700 border-rose-200',
    textColorClass: 'text-[#e11d48]',
    highlights: [
      { label: 'Notifikasi Alarm Rutin', icon: BellRing },
      { label: 'Kustomisasi Hari & Jam', icon: Clock },
    ],
  },
  {
    id: 'tracking',
    title: 'Pantau Kepatuhanmu',
    subtitle: 'Catat & Lihat Grafik Sehatmu 📊',
    description:
      'Rekam status konsumsi mingguan dengan satu sentuhan dan pantau perkembangan grafik kepatuhan bulananmu secara real-time.',
    icon: LineChart,
    badge: 'Monitoring & Riwayat Real-Time',
    gradientClass: 'from-[#059669] to-[#34d399]',
    shadowClass: 'shadow-emerald-500/25',
    bgSoftClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textColorClass: 'text-[#059669]',
    highlights: [
      { label: 'One-Tap Log Minum TTD', icon: Sparkles },
      { label: 'Grafik Kepatuhan Bulanan', icon: LineChart },
    ],
  },
  {
    id: 'buddy',
    title: 'Buddy Streak & Asisten AI',
    subtitle: 'Cegah Anemia Bersama Sahabat 🔥',
    description:
      'Pertahankan streak sehat bersama sahabat dan konsultasikan keluhan atau efek samping TTD langsung ke Asisten Pintar 24/7.',
    icon: Flame,
    badge: 'Dukungan Sosial & AI Kesehatan',
    gradientClass: 'from-[#d97706] to-[#f43f5e]',
    shadowClass: 'shadow-amber-500/25',
    bgSoftClass: 'bg-amber-50 text-amber-800 border-amber-200',
    textColorClass: 'text-[#d97706]',
    highlights: [
      { label: 'Streak Sehat Bareng Sahabat', icon: HeartHandshake },
      { label: 'AI Tanya Efek Samping', icon: Sparkles },
    ],
  },
]
