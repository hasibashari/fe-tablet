'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import HealthLineChart from '../components/HealthLineChart'
import MedicationAlertBanner from '../components/MedicationAlertBanner'
import PWAInstallBanner from '../components/PWAInstallBanner'
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt'
import { showSystemNotification } from '@/src/shared/utils/notifications'
import {
  getTodayReminders,
  toggleReminderStatus,
  getActiveNudge,
  dismissNudge,
  Reminder,
  AdminNudge,
} from '@/src/features/schedule'

import { useAuth } from '@/src/features/auth'
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync'
import {
  Box,
  Typography,
  Skeleton,
  Stack,
  Grid,
  Card,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material'
import {
  Droplets,
  PhoneCall,
  Plus,
  UserCheck,
  Sunrise,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react'

export default function DashboardView() {
  const { user } = useAuth()
  const userId = user?.id || 'usr_1'

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [adminNudge, setAdminNudge] = useState<AdminNudge | null>(null)
  const [loading, setLoading] = useState(true)
  const [waterAmount, setWaterAmount] = useState<number>(1.5) // in Liters

  // Alert Banner State
  const [alertOpen, setAlertOpen] = useState(true)
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(`medicore_snooze_until_${userId}`)
      if (stored) {
        const timestamp = Number(stored)
        if (timestamp > Date.now()) {
          return timestamp
        }
        localStorage.removeItem(`medicore_snooze_until_${userId}`)
      }
    } catch {
      // ignore storage error
    }
    return null
  })
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Real-time clock update (every 30s)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Auto un-snooze and timer listener
  useEffect(() => {
    if (!snoozedUntil) return
    const remaining = snoozedUntil - Date.now()
    const timer = setTimeout(() => {
      try {
        localStorage.removeItem(`medicore_snooze_until_${userId}`)
      } catch {
        // ignore
      }
      setSnoozedUntil(null)
      setAlertOpen(true)
    }, Math.max(0, remaining))
    return () => clearTimeout(timer)
  }, [snoozedUntil, userId])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const [remData, nudgeData] = await Promise.all([
        getTodayReminders(userId),
        getActiveNudge(userId),
      ])
      if (isMounted) {
        setReminders(remData)
        setAdminNudge(nudgeData)
        if (nudgeData) {
          setAlertOpen(true)
        }
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // 1. Instant Cross-Tab Sync via BroadcastChannel (0s latency)
    const unsubscribe = subscribeRealtimeEvent((event) => {
      if (
        event.type === 'NUDGE_SENT' ||
        event.type === 'SCHEDULE_UPDATED' ||
        event.type === 'NUDGE_DISMISSED'
      ) {
        fetchData()
      }
    })

    // 2. Smart Background Polling (every 6 seconds for multi-device tablet sync)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData()
      }
    }, 6000)

    // 3. Window focus / visibility change auto-revalidation
    const handleFocus = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      isMounted = false
      unsubscribe()
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [userId])



  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          return { ...rem, status: nextStatus }
        }
        return rem
      })
    )
    await toggleReminderStatus(id, currentStatus, userId)
    publishRealtimeEvent('MEDICATION_TAKEN', { patientId: userId, scheduleId: id })
  }

  const handleTakeMedication = async (id: string) => {
    await handleToggleStatus(id, 'PENDING')
    try {
      localStorage.removeItem(`medicore_snooze_until_${userId}`)
    } catch {
      // ignore
    }
    setSnoozedUntil(null)
    setAlertOpen(false)
  }

  const handleSnooze = (minutes: number = 10) => {
    const target = Date.now() + minutes * 60 * 1000
    try {
      localStorage.setItem(`medicore_snooze_until_${userId}`, target.toString())
    } catch {
      // ignore
    }
    setSnoozedUntil(target)
    setAlertOpen(false)
  }

  const handleDismissAlert = async () => {
    if (adminNudge) {
      await dismissNudge(adminNudge.id)
      publishRealtimeEvent('NUDGE_DISMISSED', { patientId: userId, nudgeId: adminNudge.id })
      setAdminNudge(null)
    } else {
      // If closing routine medication reminder, snooze for 15 mins so reload doesn't spam
      handleSnooze(15)
    }
    setAlertOpen(false)
  }

  const handleAddWater = () => {
    setWaterAmount((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  }

  const completedCount = useMemo(
    () => reminders.filter((r) => r.status === 'COMPLETED').length,
    [reminders]
  )
  const totalCount = reminders.length
  const adherenceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100

  // Real-Time Time Window Detection for Alert Banner
  const nextReminder = useMemo(() => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

    const pendingReminders = reminders
      .filter((r) => r.status === 'PENDING')
      .sort((a, b) => a.time.localeCompare(b.time))

    if (pendingReminders.length === 0) return null

    // Hanya cari jadwal yang SUDAH masuk waktunya (atau dalam jendela toleransi 30 menit sebelum jadwal)
    const dueReminder = pendingReminders.find((r) => {
      const [h, m] = r.time.split(':').map(Number)
      const scheduledMinutes = h * 60 + m
      return nowMinutes >= scheduledMinutes - 30
    })

    // Hanya return jika benar-benar sudah due, jangan fallback ke pendingReminders[0]
    return dueReminder || null
  }, [reminders, currentTime])

  // Track fired notifications to prevent duplicate alerts in same session
  const notifiedKeysRef = useRef<Set<string>>(new Set())

  // Trigger system notification on mobile/browser when a medication is due
  useEffect(() => {
    if (nextReminder && alertOpen && !snoozedUntil) {
      const key = `due-${nextReminder.id}-${nextReminder.date}`
      if (!notifiedKeysRef.current.has(key)) {
        notifiedKeysRef.current.add(key)
        showSystemNotification('Waktunya Minum Obat! 💊', {
          body: `${nextReminder.title} (${nextReminder.time} WIB)${nextReminder.description ? ` - ${nextReminder.description}` : ''}`,
          tag: nextReminder.id,
          url: '/user/dashboard',
        })
      }
    }
  }, [nextReminder, alertOpen, snoozedUntil])

  // Trigger system notification on mobile/browser when an admin nudge arrives
  useEffect(() => {
    if (adminNudge && alertOpen) {
      const key = `nudge-${adminNudge.senderName}-${adminNudge.message}`
      if (!notifiedKeysRef.current.has(key)) {
        notifiedKeysRef.current.add(key)
        showSystemNotification(`Pesan dari ${adminNudge.senderName} (${adminNudge.senderRole}) 🩺`, {
          body: adminNudge.message,
          tag: `nudge-${Date.now()}`,
          url: '/user/dashboard',
        })
      }
    }
  }, [adminNudge, alertOpen])

  // Group today's reminders into Morning, Afternoon, Evening slots
  const timeSlots = useMemo(() => {
    const morning = reminders.filter((r) => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour < 11
    })
    const afternoon = reminders.filter((r) => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour >= 11 && hour < 17
    })
    const evening = reminders.filter((r) => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour >= 17
    })

    const getSlotStatus = (slotReminders: Reminder[]) => {
      if (slotReminders.length === 0) {
        return { label: 'Tidak Ada', state: 'empty' as const, countText: '0 Jadwal' }
      }
      const done = slotReminders.filter((r) => r.status === 'COMPLETED').length
      if (done === slotReminders.length) {
        return { label: 'Selesai', state: 'done' as const, countText: `${done}/${slotReminders.length} Diminum` }
      }
      return { label: 'Menunggu', state: 'pending' as const, countText: `${done}/${slotReminders.length} Diminum` }
    }

    return [
      {
        id: 'morning',
        title: 'Pagi',
        timeRange: '06:00 – 11:00',
        icon: <Sunrise size={20} />,
        status: getSlotStatus(morning),
      },
      {
        id: 'afternoon',
        title: 'Siang',
        timeRange: '11:00 – 17:00',
        icon: <Sun size={20} />,
        status: getSlotStatus(afternoon),
      },
      {
        id: 'evening',
        title: 'Malam',
        timeRange: '17:00 – 23:00',
        icon: <Moon size={20} />,
        status: getSlotStatus(evening),
      },
    ]
  }, [reminders])

  return (
    <Box sx={{ pb: 5, width: '100%' }}>
      {/* Mobile / PWA Notification Permission Activation Card */}
      <NotificationPermissionPrompt />

      {/* PWA Promotion Banner */}
      <PWAInstallBanner />

      {/* 1. TOP HIGH-PRIORITY MEDICATION & ADMIN ALERT BANNER */}
      <MedicationAlertBanner

        reminder={nextReminder}
        adminNudge={adminNudge}
        isOpen={alertOpen && (Boolean(adminNudge) || (!snoozedUntil && Boolean(nextReminder)))}
        onTakeMedication={handleTakeMedication}
        onSnooze={handleSnooze}
        onDismiss={handleDismissAlert}
      />

      {/* Welcome Header */}
      <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.8rem', lg: '2.125rem' },
          }}
        >
          Dashboard Pasien
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Selamat datang kembali! Pantau kepatuhan konsumsi obat dan rencana terapi hari ini.
        </Typography>
      </Box>

      {/* Main 2-Column Grid */}
      <Grid container spacing={{ xs: 2.5, md: 3, lg: 3.5, xl: 4 }}>
        {/* LEFT COLUMN (Full width on laptop, 60-66% on wide desktop) */}
        <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
          <Stack spacing={{ xs: 3, md: 3.5, lg: 4 }}>
            {/* Medication Trend Chart */}
            <HealthLineChart patientId={userId} />

            {/* Today's Focus Section (Clean: 3-Slot Time Strip & Navigation) */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' } }}>
                    Fokus Pengobatan Hari Ini
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Ringkasan fase konsumsi harian berdasarkan jadwal dokter.
                  </Typography>
                </Box>

                <Button
                  component={Link}
                  href="/user/schedule"
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: 'rgba(14, 165, 233, 0.04)',
                    },
                  }}
                >
                  Buka Kalender & Jadwal Lengkap
                </Button>
              </Box>

              {loading ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {timeSlots.map((slot) => {
                    const isDone = slot.status.state === 'done'
                    const isPending = slot.status.state === 'pending'

                    return (
                      <Grid key={slot.id} size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                        <Card
                          elevation={0}
                          sx={{
                            p: { xs: 1.75, sm: 2, lg: 2.25 },
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: isPending ? 'primary.main' : isDone ? 'success.light' : 'divider',
                            bgcolor: '#ffffff',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: isPending ? 'primary.main' : isDone ? 'success.main' : 'text.secondary',
                              }}
                            >
                              {slot.icon}
                              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                                {slot.title}
                              </Typography>
                            </Box>
                            <Chip
                              label={slot.status.label}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: isDone ? 'success.light' : isPending ? 'primary.light' : 'action.hover',
                                color: isDone ? 'success.dark' : isPending ? 'primary.dark' : 'text.secondary',
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.76rem' }}>
                            {slot.timeRange} • {slot.status.countText}
                          </Typography>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN (Full width on laptop, 34-40% on wide desktop) */}
        <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
          <Stack spacing={3}>
            {/* Widget 1: Daily Adherence Summary Widget */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Kepatuhan Hari Ini
                </Typography>
                <Chip
                  label={`${completedCount}/${totalCount} Selesai`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: adherenceRate === 100 ? 'success.light' : 'primary.light',
                    color: adherenceRate === 100 ? 'success.dark' : 'primary.dark',
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {adherenceRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  rasio konsumsi harian
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={adherenceRate}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  bgcolor: 'divider',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: adherenceRate === 100 ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Card>

            {/* Widget 2: Daily Hydration Tracker */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'info.light',
                      color: 'info.dark',
                      display: 'flex',
                    }}
                  >
                    <Droplets size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                    Target Minum Air
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {waterAmount} / 2.0 L
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, (waterAmount / 2.0) * 100)}
                color="info"
                sx={{
                  height: 8,
                  borderRadius: 2,
                  mb: 2,
                }}
              />

              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="info"
                startIcon={<Plus size={16} />}
                onClick={handleAddWater}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                }}
              >
                Catat +250ml Air
              </Button>
            </Card>

            {/* Widget 3: Caregiver & Doctor Quick Contact */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    display: 'flex',
                  }}
                >
                  <UserCheck size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                  Dokter Penanggung Jawab
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                dr. Siti Rahma, Sp.PD
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Dokter Spesialis Penyakit Dalam • MediCore Clinical
              </Typography>

              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="success"
                startIcon={<PhoneCall size={15} />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                }}
                onClick={() => alert('Menghubungi layanan klinik dr. Siti Rahma...')}
              >
                Hubungi Dokter
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
