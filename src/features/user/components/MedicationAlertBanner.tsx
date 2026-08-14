'use client'

import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  Collapse,
} from '@mui/material'
import {
  BellRing,
  Clock,
  CheckCircle2,
  Timer,
  X,
  Pill,
  MessageSquareQuote,
} from 'lucide-react'
import { Reminder } from '@/src/features/schedule'

export interface AdminNudge {
  senderName: string
  senderRole: string
  message: string
  sentAt?: string
}

export interface MedicationAlertBannerProps {
  reminder: Reminder | null
  adminNudge?: AdminNudge | null
  onTakeMedication: (id: string) => void
  onSnooze: (minutes?: number) => void
  onDismiss: () => void
  isOpen: boolean
}

export default function MedicationAlertBanner({
  reminder,
  adminNudge,
  onTakeMedication,
  onSnooze,
  onDismiss,
  isOpen,
}: MedicationAlertBannerProps) {
  if (!reminder && !adminNudge) return null

  return (
    <Collapse in={isOpen} unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2.5, sm: 3.5, md: 4 },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, sm: 2.5 },
          border: '1.5px solid',
          borderColor: '#f59e0b',
          bgcolor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Dismiss Button */}
        <IconButton
          size="small"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            color: 'text.secondary',
            p: 0.75,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
              color: 'text.primary',
            },
          }}
        >
          <X size={18} />
        </IconButton>

        {/* Main Content Layout */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: { xs: 1.5, sm: 2 },
            pr: { xs: 4, sm: 4.5 }, // Space for dismiss button
          }}
        >
          {/* Pulsing Bell Icon Badge */}
          <Box
            sx={{
              p: { xs: 1, sm: 1.25, md: 1.5 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: '#f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.88, transform: 'scale(1.05)' },
              },
            }}
          >
            <BellRing size={20} className="sm:w-6 sm:h-6" />
          </Box>

          {/* Details Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header Badges */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
                mb: 1,
              }}
            >
              <Chip
                label="PENGINGAT AKTIF"
                size="small"
                sx={{
                  bgcolor: '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: { xs: '0.625rem', sm: '0.68rem' },
                  letterSpacing: '0.04em',
                  height: { xs: 20, sm: 22 },
                }}
              />
              {reminder && (
                <Chip
                  icon={<Clock size={12} color="#b45309" />}
                  label={`Pukul ${reminder.time} WIB`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(245, 158, 11, 0.12)',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: { xs: '0.675rem', sm: '0.72rem' },
                    height: { xs: 20, sm: 22 },
                  }}
                />
              )}
            </Box>

            {/* Medication Title */}
            {reminder && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                  wordBreak: 'break-word',
                }}
              >
                <Pill size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{reminder.title}</span>
              </Typography>
            )}

            {/* Dosage Instruction */}
            {reminder?.description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  mb: 1,
                }}
              >
                {reminder.description}
              </Typography>
            )}

            {/* Admin / Nurse Nudge Message */}
            {adminNudge && (
              <Box
                sx={{
                  mt: 1.5,
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: 1.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: 640,
                }}
              >
                <MessageSquareQuote size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', fontSize: '0.72rem' }}>
                    Pesan dari {adminNudge.senderName} ({adminNudge.senderRole}):
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.78rem', sm: '0.85rem' }, mt: 0.25 }}>
                    &ldquo;{adminNudge.message}&rdquo;
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              sx={{
                mt: 2.25,
                width: '100%',
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              {reminder && (
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<CheckCircle2 size={17} />}
                  onClick={() => onTakeMedication(reminder.id)}
                  sx={{
                    bgcolor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 1.75,
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 1.1, sm: 0.9 },
                    minHeight: { xs: 44, sm: 38 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.28)',
                    '&:hover': {
                      bgcolor: '#15803d',
                    },
                  }}
                >
                  Tandai Sudah Diminum
                </Button>
              )}

              <Button
                variant="outlined"
                size="medium"
                startIcon={<Timer size={16} />}
                onClick={() => onSnooze(10)}
                sx={{
                  borderColor: '#d97706',
                  color: '#92400e',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.75,
                  px: 2,
                  py: { xs: 1.1, sm: 0.9 },
                  minHeight: { xs: 44, sm: 38 },
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  bgcolor: '#ffffff',
                  '&:hover': {
                    borderColor: '#b45309',
                    bgcolor: 'rgba(245, 158, 11, 0.05)',
                  },
                }}
              >
                Tunda 10 Menit (Snooze)
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Collapse>
  )
}
