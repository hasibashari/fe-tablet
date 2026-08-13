'use client'

import React, { useEffect, useState, useMemo } from 'react'
import HealthLineChart from './HealthLineChart'
import { ReminderCard, getTodayReminders, Reminder } from '@/src/features/schedule'
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack,
  Grid,
  Card,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material'
import {
  Clock,
  BellRing,
  Droplets,
  PhoneCall,
  Plus,
  UserCheck,
} from 'lucide-react'

export default function DashboardView() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [waterAmount, setWaterAmount] = useState<number>(1.5) // in Liters

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTodayReminders()
      setReminders(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setReminders(prev => prev.map(rem => {
      if (rem.id === id) {
        return { ...rem, status: currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
      }
      return rem
    }))
  }

  const handleAddWater = () => {
    setWaterAmount(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  }

  const completedCount = useMemo(
    () => reminders.filter(r => r.status === 'COMPLETED').length,
    [reminders]
  )
  const totalCount = reminders.length

  const nextReminder = useMemo(() => {
    return reminders
      .filter(r => r.status === 'PENDING')
      .sort((a, b) => a.time.localeCompare(b.time))[0]
  }, [reminders])

  return (
    <Box sx={{ pb: 5, width: '100%' }}>
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
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Welcome back! Here is your health overview today.
        </Typography>
      </Box>

      {/* Main 2-Column Grid */}
      <Grid container spacing={{ xs: 3, lg: 4 }}>
        {/* LEFT COLUMN (70%) */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Stack spacing={4}>
            {/* Medication Trend (Line Chart) */}
            <HealthLineChart />

            {/* Today's Schedule */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Today&apos;s Schedule
                </Typography>
                {reminders.length > 0 && (
                  <Chip
                    label={`${completedCount}/${totalCount} Completed`}
                    size="small"
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                </Stack>
              ) : reminders.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body1">No reminders scheduled for today!</Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {reminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN (30%) */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Stack spacing={3}>
            {/* Widget 1: Upcoming Reminder Card - HIGHEST HIERARCHY (Rendered only when active) */}
            {Boolean(nextReminder) && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(204, 120, 92, 0.08)',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: 'primary.dark' }}>
                  <BellRing size={20} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                    Upcoming Reminder
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
                  {nextReminder.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                  {nextReminder.description || 'Scheduled reminder'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    icon={<Clock size={16} />}
                    label={nextReminder.time}
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleToggleStatus(nextReminder.id, nextReminder.status)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Mark Done
                  </Button>
                </Box>
              </Card>
            )}

            {/* Widget 2: Daily Hydration Tracker (Secondary Hierarchy) */}
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
                    Hydration Goal
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
                  minHeight: 42,
                }}
              >
                Log +250ml Water
              </Button>
            </Card>

            {/* Widget 3: Caregiver & Doctor Quick Contact (Secondary Hierarchy) */}
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
                  Caregiver Contact
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Dr. Sarah Wijaya
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Primary Physician • Sp.PD
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
                  minHeight: 42,
                }}
              >
                Call Physician
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
