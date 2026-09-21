'use client'

import React, { useState } from 'react'
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  Flame,
  Activity,
} from 'lucide-react'
import { Card } from '@/src/shared/components/ui/Card'
import { Badge } from '@/src/shared/components/ui/Badge'
import { Button } from '@/src/shared/components/ui/Button'
import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart'
import {
  MOCK_WEEKLY_HISTORY,
  MOCK_MONTHLY_TREND,
  MOCK_TODAY_STATUS,
  MOCK_USER,
  ConsumptionStatus,
} from '@/src/shared/mock/feTabletData'

type MonitoringTab = 'today' | 'weekly' | 'monthly'

export default function HistoryView() {
  const [activeTab, setActiveTab] = useState<MonitoringTab>('today')
  const [todayStatus, setTodayStatus] = useState<ConsumptionStatus>(MOCK_TODAY_STATUS.status)
  const [recordedTime, setRecordedTime] = useState<string>('')

  const handleTakeToday = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    setTodayStatus('recorded')
    setRecordedTime(timeStr)
  }

  const handleMissToday = () => {
    setTodayStatus('missed')
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight">
          Monitoring Kepatuhan
        </h2>
        <p className="text-xs sm:text-sm text-[#64748b]">
          Pantau riwayat konsumsi Tablet Tambah Darah (TTD) secara berkala
        </p>
      </div>

      {/* 3-Tab Segmented Control Navigation */}
      <div className="flex items-center p-1 bg-white rounded-2xl border border-[#fce7f3] shadow-xs max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Mingguan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          Bulanan
        </button>
      </div>

      {/* TAB 1: HARI INI */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 animate-fade-in items-start">
          <div className="md:col-span-7 flex flex-col gap-4">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-[#1e293b]">Jadwal Hari Ini</span>
                <Badge variant={todayStatus} size="sm">
                  {todayStatus === 'recorded'
                    ? '✓ Sudah Tercatat'
                    : todayStatus === 'missed'
                    ? '✕ Terlewat'
                    : 'Belum Dicatat'}
                </Badge>
              </div>

              <div className="bg-[#fff5f7] border border-[#fce7f3] rounded-xl p-4 my-2">
                <h4 className="text-sm sm:text-base font-bold text-[#1e293b]">
                  {MOCK_TODAY_STATUS.tabletName}
                </h4>
                <p className="text-xs sm:text-sm text-[#e11d48] font-semibold flex items-center gap-1 mt-1">
                  <Clock size={14} />
                  <span>Pukul {MOCK_TODAY_STATUS.scheduledTime}</span>
                </p>
                <p className="text-xs text-[#64748b] mt-1.5">
                  Dosis: 1 tablet, diminum setelah makan bersama air putih atau jus buah segar.
                </p>
              </div>

              {/* Interactive Actions for Today */}
              {todayStatus === 'pending' && (
                <div className="flex items-center gap-2.5 mt-4">
                  <Button
                    variant="success"
                    size="md"
                    shape="pill"
                    fullWidth
                    icon={<CheckCircle2 size={16} />}
                    onClick={handleTakeToday}
                  >
                    Sudah Minum
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    shape="pill"
                    className="text-[#f43f5e] border-[#fecdd3]"
                    icon={<XCircle size={16} />}
                    onClick={handleMissToday}
                  >
                    Terlewat
                  </Button>
                </div>
              )}

              {todayStatus === 'recorded' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-emerald-800">
                      Tercatat diminum pada {recordedTime || '08:15 WIB'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTodayStatus('pending')}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
              )}

              {todayStatus === 'missed' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-rose-800">
                      Jadwal hari ini ditandai terlewat
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTodayStatus('pending')}
                    className="text-xs font-semibold text-rose-700 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
              )}
            </Card>
          </div>

          <div className="md:col-span-5 flex flex-col gap-4">
            <Card padding="md" className="bg-[#fdf2f4]">
              <h4 className="text-xs font-bold text-[#be123c] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Tips Kepatuhan Hari Ini</span>
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Minum TTD secara teratur membantu sel darah merah membawa oksigen ke seluruh tubuh, sehingga belajar dan beraktivitas menjadi lebih fokus dan tidak cepat mengantuk.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MINGGUAN */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 animate-fade-in items-start">
          <div className="md:col-span-5 flex flex-col gap-4">
            <Card variant="hero" padding="lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e11d48]">Minggu ke-1 (Bulan Berjalan)</span>
                <Badge variant="recorded" size="sm">✓ 75% Kepatuhan</Badge>
              </div>
              <h3 className="text-lg font-extrabold text-[#1e293b] mt-2">
                28 September – 4 Oktober 2026
              </h3>
              <p className="text-xs text-[#64748b] mt-1">
                Jadwal minggu ini: Sabtu, 3 Oktober 2026 - 08:00 WIB
              </p>
            </Card>

            <Card padding="md" className="bg-[#fff5f7]">
              <span className="text-xs font-bold text-[#1e293b] block mb-1">
                Kenapa Evaluasi Mingguan?
              </span>
              <p className="text-xs text-[#475569] leading-relaxed">
                Evaluasi per 4 minggu membantu mengukur apakah siklus menstruasimu didampingi cadangan zat besi yang stabil.
              </p>
            </Card>
          </div>

          <div className="md:col-span-7">
            <Card padding="lg">
              <h4 className="text-sm sm:text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-[#e11d48]" />
                <span>Riwayat 4 Minggu Terakhir</span>
              </h4>

              <div className="flex flex-col divide-y divide-[#fce7f3]">
                {MOCK_WEEKLY_HISTORY.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1e293b]">
                          Minggu ke-{item.weekNumber}
                        </span>
                        <span className="text-[11px] text-[#94a3b8] font-medium">
                          ({item.dateRange})
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {item.scheduledDateTime}
                      </p>
                    </div>

                    <div>
                      {item.status === 'recorded' ? (
                        <Badge variant="recorded" size="sm">
                          ✓ Tercatat
                        </Badge>
                      ) : (
                        <Badge variant="missed" size="sm">
                          ✕ Terlewat
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: BULANAN */}
      {activeTab === 'monthly' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Monthly Bar Chart Component */}
          <ConsumptionChart
            data={MOCK_MONTHLY_TREND}
            totalCount={4}
            averageCount={3.8}
            compliancePercent={92}
          />

          {/* 4-Grid Responsive Milestone Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <Card padding="md" className="text-center">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                <Flame size={18} />
              </div>
              <span className="text-[11px] text-[#64748b] block font-medium">Streak Tertinggi</span>
              <span className="text-sm sm:text-base font-extrabold text-[#e11d48]">{MOCK_USER.streakCount} Minggu</span>
            </Card>

            <Card padding="md" className="text-center">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-2">
                <CalendarCheck size={18} />
              </div>
              <span className="text-[11px] text-[#64748b] block font-medium">Total Tablet (6 Bln)</span>
              <span className="text-sm sm:text-base font-extrabold text-[#1e293b]">21 Tablet</span>
            </Card>

            <Card padding="md" className="text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Activity size={18} />
              </div>
              <span className="text-[11px] text-[#64748b] block font-medium">Kadar Hb Terakhir</span>
              <span className="text-sm sm:text-base font-extrabold text-[#10b981]">{MOCK_USER.hbLevel} g/dL</span>
            </Card>

            <Card padding="md" className="text-center">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles size={18} />
              </div>
              <span className="text-[11px] text-[#64748b] block font-medium">Status Kesehatan</span>
              <span className="text-sm sm:text-base font-extrabold text-[#9333ea]">Bebas Anemia</span>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
