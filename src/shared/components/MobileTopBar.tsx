'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Heart } from 'lucide-react'

export interface MobileTopBarProps {
  onOpenSidebar?: () => void
  brandTitle?: React.ReactNode
  brandSubtitle?: string
  brandHref?: string
  badge?: React.ReactNode
  rightAction?: React.ReactNode
  userName?: string
  avatarUrl?: string
}

export default function MobileTopBar({
  brandTitle,
  brandSubtitle,
  brandHref = '/user/dashboard',
  badge,
  rightAction,
  userName = 'Sarah',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
}: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#fce7f3] shadow-xs">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        {/* Left: Brand / Greeting */}
        <Link href={brandHref} className="flex items-center gap-2.5 text-inherit no-underline">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-sm shadow-rose-500/25">
            <Heart size={16} className="fill-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#1e293b] leading-tight">
                {brandTitle || `Hai, ${userName}! 🌸`}
              </span>
              {badge}
            </div>
            {brandSubtitle ? (
              <span className="text-[11px] text-[#64748b] leading-none">{brandSubtitle}</span>
            ) : (
              <span className="text-[11px] text-[#e11d48] font-medium leading-none">Fe-Tablet App</span>
            )}
          </div>
        </Link>

        {/* Right: Notification & Profile Avatar */}
        {rightAction ? (
          rightAction
        ) : (
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Link
              href="/user/dashboard"
              className="w-9 h-9 rounded-full bg-[#fff5f7] border border-[#fce7f3] flex items-center justify-center text-[#475569] hover:text-[#e11d48] hover:bg-[#ffe4e6] transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e11d48] ring-2 ring-white" />
            </Link>

            {/* Profile Avatar */}
            <Link
              href="/user/profile"
              className="w-9 h-9 rounded-full ring-2 ring-[#fce7f3] hover:ring-[#e11d48] overflow-hidden relative transition-all"
              aria-label="Profil Pengguna"
            >
              <Image
                src={avatarUrl}
                alt={userName}
                fill
                className="object-cover"
                sizes="36px"
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
