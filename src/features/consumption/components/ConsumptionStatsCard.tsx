'use client'

import React from 'react'
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Chip } from '@mui/material'
import { Flame, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { ConsumptionStats } from '../types'

interface ConsumptionStatsCardProps {
  stats: ConsumptionStats
}

export default function ConsumptionStatsCard({ stats }: ConsumptionStatsCardProps) {
  const isHighAdherence = stats.adherenceRate >= 85

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {/* 1. Adherence Rate Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'var(--color-hairline, #e2e8f0)',
            bgcolor: '#ffffff',
            p: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: isHighAdherence ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                    color: isHighAdherence ? 'success.main' : 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={18} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Tingkat Kepatuhan
                </Typography>
              </Box>
              <Chip
                label={isHighAdherence ? 'Sangat Baik' : 'Cukup'}
                size="small"
                sx={{
                  bgcolor: isHighAdherence ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  color: isHighAdherence ? 'success.dark' : 'warning.dark',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                {stats.adherenceRate}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                dari {stats.totalScheduled} total jadwal
              </Typography>
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={stats.adherenceRate}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.06)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: isHighAdherence ? 'success.main' : 'warning.main',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Streak Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'var(--color-hairline, #e2e8f0)',
            bgcolor: '#ffffff',
            p: 1,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(234, 88, 12, 0.12)',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flame size={18} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Konsistensi (Streak)
                </Typography>
              </Box>
              <Chip
                label="Aktif"
                size="small"
                sx={{
                  bgcolor: 'rgba(234, 88, 12, 0.1)',
                  color: '#ea580c',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                {stats.currentStreakDays} Hari
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                beruntun
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              Hebat! Pertahankan rutinitas konsumsi obat tepat waktu Anda.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 3. Status Breakdown Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'var(--color-hairline, #e2e8f0)',
            bgcolor: '#ffffff',
            p: 1,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>
              Rincian Aktivitas
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* On Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Tepat Waktu
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a' }}>
                  {stats.totalOnTime}
                </Typography>
              </Box>

              {/* Late */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle size={15} style={{ color: '#d97706' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Terlambat
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>
                  {stats.totalLate}
                </Typography>
              </Box>

              {/* Missed */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <XCircle size={15} style={{ color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Terlewat
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#dc2626' }}>
                  {stats.totalMissed}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
