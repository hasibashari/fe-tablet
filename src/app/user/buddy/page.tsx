'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Flame,
  Heart,
  CheckCircle2,
  Users,
  Sparkles,
  Plus,
  X,
} from 'lucide-react'
import { Card } from '@/src/shared/components/ui/Card'
import { Button } from '@/src/shared/components/ui/Button'
import { MOCK_BUDDY, MOCK_USER } from '@/src/shared/mock/feTabletData'

export default function BuddyStreakPage() {
  const [buddy, setBuddy] = useState(MOCK_BUDDY)
  const [cheerCount, setCheerCount] = useState(12)
  const [cheeredJustNow, setCheeredJustNow] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [friendCode, setFriendCode] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSendCheer = () => {
    setCheerCount((prev) => prev + 1)
    setCheeredJustNow(true)
    showToast('Stiker semangat terkirim ke Alya! ❤️')

    // Add activity locally
    setBuddy((prev) => ({
      ...prev,
      activities: [
        {
          id: `act_${Date.now()}`,
          userName: 'Sarah Azzahra',
          action: 'mengirimkan stiker semangat ke Alya ❤️',
          timestamp: 'Baru saja',
          isPositive: true,
          iconType: 'heart',
        },
        ...prev.activities,
      ],
    }))
  }

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendCode.trim()) return
    setIsAddModalOpen(false)
    setFriendCode('')
    showToast(`Undangan terkirim ke kode teman: ${friendCode}! 🎉`)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight">
            Buddy Streak
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Bangun kebiasaan sehat minum TTD bersama sahabatmu
          </p>
        </div>

        <Button
          variant="soft"
          size="sm"
          shape="pill"
          icon={<Plus size={14} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Tambah Buddy
        </Button>
      </div>

      {/* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* LEFT COLUMN: Duo-Avatar Streak Hero Banner (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <Card variant="hero" padding="lg" className="relative overflow-hidden text-center">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold text-[#e11d48] bg-white/80 px-3 py-1 rounded-full border border-rose-200">
                🔥 Streak Bersama
              </span>
              <span className="text-[11px] font-semibold text-[#059669] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Kompak Minggu Ini
              </span>
            </div>

            {/* Avatar Duel Bridge */}
            <div className="flex items-center justify-around my-5">
              {/* User Side */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full ring-4 ring-rose-400 overflow-hidden relative shadow-md">
                  <Image
                    src={MOCK_USER.avatarUrl}
                    alt={MOCK_USER.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1e293b] mt-2">Sarah (Kamu)</span>
                <span className="text-[10px] sm:text-xs text-[#059669] font-bold flex items-center gap-0.5">
                  <CheckCircle2 size={12} /> Sudah Minum
                </span>
              </div>

              {/* Center Flame Pillar */}
              <div className="flex flex-col items-center px-2">
                <div className="w-18 sm:w-20 h-18 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-white flex flex-col items-center justify-center shadow-xl shadow-orange-500/30 animate-pulse">
                  <Flame size={32} className="fill-white" />
                  <span className="text-base font-black -mt-1">{buddy.streakCount}</span>
                </div>
                <span className="text-[11px] font-black text-[#e11d48] mt-1.5 uppercase tracking-wider">
                  Minggu
                </span>
              </div>

              {/* Buddy Side */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full ring-4 ring-amber-400 overflow-hidden relative shadow-md">
                  <Image
                    src={buddy.buddyAvatar}
                    alt={buddy.buddyName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1e293b] mt-2">{buddy.buddyName}</span>
                <span className="text-[10px] sm:text-xs text-[#059669] font-bold flex items-center gap-0.5">
                  <CheckCircle2 size={12} /> Sudah Minum
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xs mx-auto mb-5">
              Luar biasa! Kamu dan <strong>{buddy.buddyName}</strong> sudah konsisten selama <strong>{buddy.streakCount} minggu berturut-turut</strong> tanpa melewatkan TTD!
            </p>

            {/* Cheer Action Button */}
            <Button
              variant={cheeredJustNow ? 'soft' : 'primary'}
              size="md"
              shape="pill"
              fullWidth
              icon={<Heart size={16} className={cheeredJustNow ? 'fill-rose-600 text-rose-600' : ''} />}
              onClick={handleSendCheer}
            >
              {cheeredJustNow
                ? `Semangat Terkirim! (${cheerCount} Total ❤️)`
                : `Kirim Semangat ke ${buddy.buddyName}`}
            </Button>
          </Card>
        </div>

        {/* RIGHT COLUMN: Activity Feed & Motivational Info (md:col-span-7) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Live Activity Feed */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2">
                <Users size={18} className="text-[#e11d48]" />
                <span>Aktivitas Minggu Ini</span>
              </h4>
              <span className="text-xs text-[#94a3b8]">Pembaruan Langsung</span>
            </div>

            <div className="flex flex-col divide-y divide-[#fce7f3]">
              {buddy.activities.map((act) => (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                      act.iconType === 'heart'
                        ? 'bg-rose-100 text-rose-600'
                        : act.iconType === 'flame'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {act.iconType === 'heart' ? (
                      <Heart size={14} className="fill-rose-600" />
                    ) : act.iconType === 'flame' ? (
                      <Flame size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-[#1e293b]">
                      <strong className="font-semibold">{act.userName}</strong> {act.action}
                    </p>
                    <span className="text-[11px] text-[#94a3b8]">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Motivational Box */}
          <Card padding="md" className="bg-[#fdf2f4]">
            <h4 className="text-xs sm:text-sm font-bold text-[#be123c] mb-1">
              Tahukah Kamu? 💡
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Membangun kebiasaan suplementasi bersama teman sebaya (*peer encouragement*) melipatgandakan motivasi untuk tidak menunda minum tablet saat akhir pekan.
            </p>
          </Card>
        </div>
      </div>

      {/* Add Buddy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#fce7f3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4">
              <h3 className="text-base font-bold text-[#1e293b]">Tambah Buddy Sehat</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-[#1e293b] mb-1.5 block">
                  Masukkan ID atau Kode Teman:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: FE-ALYA-2026"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  className="w-full bg-white text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] focus:border-[#e11d48] px-4 py-3 outline-none"
                  required
                />
              </div>

              <div className="p-3.5 bg-[#fff5f7] rounded-xl border border-[#fce7f3]">
                <span className="text-xs text-[#64748b] block">Kode Buddy Milikmu:</span>
                <span className="text-base font-extrabold text-[#e11d48]">FE-SARAH-9901</span>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  shape="pill"
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  shape="pill"
                  className="flex-1"
                >
                  Kirim Undangan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
