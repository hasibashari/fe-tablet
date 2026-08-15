'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import HealthLineChart from './HealthLineChart'
import MedicationAlertBanner, { AdminNudge } from './MedicationAlertBanner'
import { getTodayReminders, toggleReminderStatus, Reminder } from '@/src/features/schedule'
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
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [waterAmount, setWaterAmount] = useState<number>(1.5) // in Liters

  // Alert Banner State
  const [alertOpen, setAlertOpen] = useState(true)
  const [adminNudge] = useState<AdminNudge | null>({
    senderName: 'Ns. Ratna, S.Kep',
    senderRole: 'Perawat Penanggung Jawab',
    message: 'Ibu Siti, mohon obatnya diminum tepat waktu setelah makan ya agar kondisi tetap stabil.',
    sentAt: '12:45 WIB',
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTodayReminders()
      setReminders(data)
      setLoading(false)
    }
    fetchData()
  }, [])

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
    await toggleReminderStatus(id, currentStatus)
  }

  const handleTakeMedication = (id: string) => {
    handleToggleStatus(id, 'PENDING')
    setAlertOpen(false)
  }

  const handleSnooze = () => {
    setAlertOpen(false)
  }

  const handleAddWater = () => {
    setWaterAmount(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  }

  const completedCount = useMemo(
    () => reminders.filter(r => r.status === 'COMPLETED').length,
    [reminders]
  )
  const totalCount = reminders.length
  const adherenceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100

  // The single next pending reminder for alert
  const nextReminder = useMemo(() => {
    return reminders
      .filter(r => r.status === 'PENDING')
      .sort((a, b) => a.time.localeCompare(b.time))[0] || null
  }, [reminders])

  // Group today's reminders into Morning, Afternoon, Evening slots
  const timeSlots = useMemo(() => {
    const morning = reminders.filter(r => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour < 11
    })
    const afternoon = reminders.filter(r => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour >= 11 && hour < 17
    })
    const evening = reminders.filter(r => {
      const hour = parseInt(r.time.split(':')[0], 10)
      return hour >= 17
    })

    const getSlotStatus = (slotReminders: Reminder[]) => {
      if (slotReminders.length === 0) {
        return { label: 'Tidak Ada', state: 'empty' as const, countText: '0 Jadwal' }
      }
      const done = slotReminders.filter(r => r.status === 'COMPLETED').length
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
      {/* 1. TOP HIGH-PRIORITY MEDICATION & ADMIN ALERT BANNER */}
      <MedicationAlertBanner
        reminder={nextReminder}
        adminNudge={adminNudge}
        isOpen={alertOpen && (Boolean(nextReminder) || Boolean(adminNudge))}
        onTakeMedication={handleTakeMedication}
        onSnooze={handleSnooze}
        onDismiss={() => setAlertOpen(false)}
      />

      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
          }}
        >
          Dashboard Pasien
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Selamat datang kembali! Pantau kepatuhan konsumsi obat dan rencana terapi hari ini.
        </Typography>
      </Box>

      {/* Main 2-Column Grid */}
      <Grid container spacing={{ xs: 3, lg: 4 }}>
        {/* LEFT COLUMN (70%) */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Stack spacing={4}>
            {/* Medication Trend Chart */}
            <HealthLineChart />

            {/* Today's Focus Section (Clean: 3-Slot Time Strip & Navigation) */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                  <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><Skeleton variant="rounded" height={85} sx={{ borderRadius: 2 }} /></Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {timeSlots.map((slot) => {
                    const isDone = slot.status.state === 'done'
                    const isPending = slot.status.state === 'pending'

                    return (
                      <Grid key={slot.id} size={{ xs: 12, sm: 4 }}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.25,
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

        {/* RIGHT COLUMN (30%) */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
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
