'use client'

import React from 'react'
import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { Pill, Stethoscope, Activity, Clock, CheckCircle2, AlertTriangle, XCircle, FileText, UserCheck } from 'lucide-react'
import { ConsumptionLog } from '../types'

interface HistoryTimelineItemProps {
  item: ConsumptionLog
}

export default function HistoryTimelineItem({ item }: HistoryTimelineItemProps) {
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'MEDICATION':
        return <Pill size={18} />
      case 'CHECKUP':
        return <Stethoscope size={18} />
      case 'EXERCISE':
        return <Activity size={18} />
      default:
        return <Clock size={18} />
    }
  }

  const getStatusBadge = () => {
    switch (item.status) {
      case 'ON_TIME':
        return (
          <Chip
            icon={<CheckCircle2 size={13} style={{ color: '#16a34a' }} />}
            label="Tepat Waktu"
            size="small"
            sx={{
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )
      case 'LATE':
        return (
          <Chip
            icon={<AlertTriangle size={13} style={{ color: '#d97706' }} />}
            label="Terlambat"
            size="small"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              color: '#b45309',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )
      case 'MISSED':
        return (
          <Chip
            icon={<XCircle size={13} style={{ color: '#dc2626' }} />}
            label="Terlewat"
            size="small"
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#b91c1c',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )
      default:
        return (
          <Chip
            label="Dilewati"
            size="small"
            sx={{
              bgcolor: 'action.hover',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )
    }
  }

  const isMissed = item.status === 'MISSED'

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: isMissed ? 'error.light' : 'var(--color-hairline, #e2e8f0)',
        bgcolor: isMissed ? '#fffbfb' : '#ffffff',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {/* Left info */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 260 }}>
            {/* Category Icon Badge */}
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor:
                  item.category === 'MEDICATION'
                    ? 'rgba(2, 132, 199, 0.1)'
                    : item.category === 'CHECKUP'
                    ? 'rgba(147, 51, 234, 0.1)'
                    : 'rgba(204, 120, 92, 0.12)',
                color:
                  item.category === 'MEDICATION'
                    ? 'primary.main'
                    : item.category === 'CHECKUP'
                    ? '#9333ea'
                    : '#cc785c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              {getCategoryIcon()}
            </Box>

            {/* Title & Timing */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {item.title}
              </Typography>

              {item.dosage && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontWeight: 500 }}>
                  {item.dosage}
                </Typography>
              )}

              {/* Time Details: Scheduled vs Taken */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={13} style={{ color: '#64748b' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Jadwal: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{item.scheduledTime} WIB</Box>
                  </Typography>
                </Box>

                {item.takenAt && (
                  <>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: item.status === 'LATE' ? '#b45309' : '#15803d', fontWeight: 600 }}>
                      Realisasi: {item.takenAt} WIB
                    </Typography>
                  </>
                )}

                {item.takenBy && (
                  <>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <UserCheck size={13} style={{ color: '#64748b' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {item.takenBy}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right Status Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            {getStatusBadge()}
          </Box>
        </Box>

        {/* Optional Notes / Health Observations */}
        {item.notes && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: isMissed ? 'rgba(239, 68, 68, 0.05)' : 'background.default',
              border: '1px solid',
              borderColor: isMissed ? 'rgba(239, 68, 68, 0.15)' : 'divider',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <FileText size={15} style={{ color: isMissed ? '#dc2626' : '#64748b', marginTop: 2, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: isMissed ? 'error.dark' : 'text.secondary', lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>Catatan: </Box>
              {item.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
