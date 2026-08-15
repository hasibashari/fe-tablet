'use client'

import React, { useState } from 'react'
import { Box, Typography, Button, Paper, IconButton, Fade, Chip } from '@mui/material'
import { BellRing, Bell, CheckCircle2, X } from 'lucide-react'
import { useNotificationPermission } from '@/src/shared/hooks/useNotificationPermission'

const STORAGE_KEY = 'medicore_notif_prompt_dismissed'

export function NotificationPermissionPrompt() {
  const { isSupported, isDefault, requesting, request } = useNotificationPermission()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [justEnabled, setJustEnabled] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
  }

  const handleEnable = async () => {
    const success = await request(true)
    if (success) {
      setJustEnabled(true)
      setTimeout(() => {
        setDismissed(true)
      }, 4000)
    }
  }

  // Only show if notifications are supported, not yet decided or just enabled, and not dismissed
  if (!isSupported || dismissed) return null
  if (!isDefault && !justEnabled) return null

  return (
    <Fade in={!dismissed}>
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2.5, sm: 3 },
          p: { xs: 2, sm: 2.25 },
          borderRadius: 3,
          bgcolor: justEnabled ? '#f0fdf4' : '#fffbeb',
          border: '1.5px solid',
          borderColor: justEnabled ? '#86efac' : '#fde68a',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: justEnabled ? '#22c55e' : '#f59e0b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: justEnabled
                  ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                  : '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              {justEnabled ? <CheckCircle2 size={22} /> : <BellRing size={22} />}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: justEnabled ? '#15803d' : '#92400e',
                    fontSize: { xs: '0.88rem', sm: '0.94rem' },
                  }}
                >
                  {justEnabled
                    ? 'Notifikasi HP Berhasil Diaktifkan!'
                    : 'Aktifkan Pengingat Notifikasi di HP'}
                </Typography>
                <Chip
                  label={justEnabled ? 'AKTIF' : 'PENTING'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: justEnabled ? '#bbf7d0' : '#fef08a',
                    color: justEnabled ? '#166534' : '#854d0e',
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: justEnabled ? '#166534' : '#78350f',
                  fontSize: { xs: '0.76rem', sm: '0.82rem' },
                  lineHeight: 1.35,
                }}
              >
                {justEnabled
                  ? 'Anda akan menerima alarm pengingat suara & getar saat jam minum obat tiba.'
                  : 'Dapatkan pemberitahuan suara & getar tepat waktu saat jadwal minum obat tiba.'}
              </Typography>
            </Box>
          </Box>

          {!justEnabled && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Button
                variant="contained"
                size="small"
                disabled={requesting}
                onClick={handleEnable}
                startIcon={<Bell size={14} />}
                sx={{
                  bgcolor: '#f59e0b',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.65,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                  '&:hover': {
                    bgcolor: '#d97706',
                  },
                }}
              >
                {requesting ? 'Meminta...' : 'Izinkan Notifikasi'}
              </Button>

              <IconButton
                size="small"
                onClick={handleDismiss}
                aria-label="Tutup saran notifikasi"
                sx={{
                  color: '#92400e',
                  p: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                  },
                }}
              >
                <X size={17} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
    </Fade>
  )
}

export default NotificationPermissionPrompt
