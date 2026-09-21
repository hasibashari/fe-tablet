'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Clock,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Flame,
  Activity,
  Edit2,
  X,
  Check,
  Save,
} from 'lucide-react'
import { Card } from '@/src/shared/components/ui/Card'
import { Button } from '@/src/shared/components/ui/Button'
import { useAuth } from '@/src/features/auth/context/AuthContext'
import { MOCK_USER } from '@/src/shared/mock/feTabletData'

export default function ProfileView() {
  const router = useRouter()
  const { logout } = useAuth()
  const [userProfile, setUserProfile] = useState(MOCK_USER)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name)
  const [editSchool, setEditSchool] = useState(userProfile.schoolOrOrg)
  const [editPhone, setEditPhone] = useState(userProfile.phone)
  const [editHb, setEditHb] = useState(String(userProfile.hbLevel || 12.4))

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setUserProfile((prev) => ({
      ...prev,
      name: editName,
      schoolOrOrg: editSchool,
      phone: editPhone,
      hbLevel: Number(editHb) || 12.4,
    }))
    setIsEditProfileModalOpen(false)
    showToast('Profil berhasil diperbarui! ✨')
  }

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false)
    await logout()
    router.push('/auth/login')
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const menuItems = [
    {
      id: 'account',
      title: 'Akun Saya',
      subtitle: 'Data diri, sekolah & data hemoglobin',
      icon: User,
      iconBg: 'bg-rose-100 text-rose-600',
      action: () => setIsEditProfileModalOpen(true),
    },
    {
      id: 'reminder',
      title: 'Pengaturan Pengingat',
      subtitle: 'Hari dan jam konsumsi rutin TTD',
      icon: Clock,
      iconBg: 'bg-amber-100 text-amber-600',
      href: '/user/schedule',
    },
    {
      id: 'notification',
      title: 'Pengaturan Notifikasi',
      subtitle: 'Push alert 15 menit sebelum minum',
      icon: Bell,
      iconBg: 'bg-sky-100 text-sky-600',
      action: () => showToast('Notifikasi pengingat sudah aktif! 🔔'),
    },
    {
      id: 'help',
      title: 'Pusat Bantuan & FAQ',
      subtitle: 'Pertanyaan seputar aplikasi Fe-Tablet',
      icon: HelpCircle,
      iconBg: 'bg-purple-100 text-purple-600',
      href: '/user/education',
    },
    {
      id: 'about',
      title: 'Tentang Fe-Tablet',
      subtitle: 'Versi 2.0.0 • Pencegahan Anemia',
      icon: Info,
      iconBg: 'bg-emerald-100 text-emerald-600',
      action: () => showToast('Fe-Tablet v2.0.0 (Small habit, big impact) 🌸'),
    },
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight">
          Profil & Pengaturan
        </h2>
        <p className="text-xs sm:text-sm text-[#64748b]">
          Kelola profil kesehatan dan preferensi pengingat TTD
        </p>
      </div>

      {/* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* LEFT COLUMN: User Card & Metrics & Logout (md:col-span-5 lg:col-span-4) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-5">
          <Card variant="hero" padding="lg" className="relative">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-rose-300 overflow-hidden relative shrink-0 shadow-md">
                <Image
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-[#1e293b] truncate">
                  {userProfile.name}
                </h3>
                <p className="text-xs text-[#64748b] truncate">{userProfile.email}</p>
                <p className="text-[11px] font-semibold text-[#e11d48] mt-0.5 truncate">
                  {userProfile.schoolOrOrg}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="w-9 h-9 rounded-full bg-white/90 text-[#e11d48] hover:bg-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                title="Edit Profil"
              >
                <Edit2 size={16} />
              </button>
            </div>

            {/* Health Metrics Strip */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-rose-200">
              <div className="bg-white/80 rounded-xl p-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Flame size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] block font-medium">Streak Rutin</span>
                  <span className="text-xs font-bold text-[#1e293b]">{userProfile.streakCount} Minggu</span>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Activity size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] block font-medium">Kadar Hb</span>
                  <span className="text-xs font-bold text-[#10b981]">{userProfile.hbLevel} g/dL</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Logout Button */}
          <Card padding="sm" className="bg-[#fff1f2] border-[#fecdd3]">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#e11d48] hover:text-[#be123c] transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Keluar dari Akun</span>
            </button>
          </Card>
        </div>

        {/* RIGHT COLUMN: Settings Navigation List & Inline Quick Edit Form (md:col-span-7 lg:col-span-8) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-5">
          {/* Settings Menu List */}
          <Card padding="none" className="overflow-hidden divide-y divide-[#fce7f3]">
            {menuItems.map((item) => {
              const Icon = item.icon
              const content = (
                <div className="p-4 flex items-center justify-between hover:bg-[#fff5f7] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e293b] group-hover:text-[#e11d48] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#64748b]">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-[#94a3b8] group-hover:text-[#e11d48] transition-transform group-hover:translate-x-0.5" />
                </div>
              )

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} className="block no-underline text-inherit">
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="w-full text-left bg-transparent border-0 p-0"
                >
                  {content}
                </button>
              )
            })}
          </Card>

          {/* Medical Privacy & Security Badge */}
          <Card padding="md" className="bg-[#fff5f7]">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h4 className="text-xs font-bold text-[#1e293b]">Privasi & Keamanan Terjaga</h4>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Seluruh catatan jadwal dan status kepatuhan konsumsi TTD tersimpan secara aman dan terenkripsi untuk mendukung pencegahan anemia yang akurat.
            </p>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#fce7f3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4">
              <h3 className="text-base font-bold text-[#1e293b]">Edit Data Diri</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#1e293b] mb-1 block">Nama Lengkap:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#fff5f7] text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] px-4 py-2.5 outline-none focus:border-[#e11d48]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1e293b] mb-1 block">Sekolah / Institusi:</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full bg-[#fff5f7] text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] px-4 py-2.5 outline-none focus:border-[#e11d48]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1e293b] mb-1 block">Nomor WhatsApp / HP:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#fff5f7] text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] px-4 py-2.5 outline-none focus:border-[#e11d48]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1e293b] mb-1 block">Kadar Hemoglobin Terakhir (g/dL):</label>
                <input
                  type="number"
                  step="0.1"
                  value={editHb}
                  onChange={(e) => setEditHb(e.target.value)}
                  className="w-full bg-[#fff5f7] text-[#1e293b] text-sm rounded-xl border border-[#fce7f3] px-4 py-2.5 outline-none focus:border-[#e11d48]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  shape="pill"
                  className="flex-1"
                  onClick={() => setIsEditProfileModalOpen(false)}
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
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#fce7f3] text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-3">
              <LogOut size={26} />
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-[#1e293b]">Yakin Ingin Keluar?</h3>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
              Kamu harus masuk kembali untuk memantau pengingat TTD dan mempertahankan streak bersama sahabatmu.
            </p>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                shape="pill"
                className="flex-1"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                shape="pill"
                className="flex-1"
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
