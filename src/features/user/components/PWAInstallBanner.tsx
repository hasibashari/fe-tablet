'use client'

import React, { useState, useCallback, useSyncExternalStore } from 'react'
import { Box, Typography, Button, Paper, IconButton, Fade } from '@mui/material'
import { Smartphone, Download, X } from 'lucide-react'
import { usePWA } from '@/src/shared/hooks/usePWA'

const STORAGE_KEY = 'medicore_pwa_banner_dismissed'

function subscribeDismissed(callback: () => void) {
  if (typeof window === 'undefined') return () => { }
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getDismissedSnapshot() {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(STORAGE_KEY) === 'true'
}

function getDismissedServerSnapshot() {
  return true
}

export interface PWAInstallBannerProps {
  variant?: 'inline' | 'floating'
}

export function PWAInstallBanner({ variant = 'inline' }: PWAInstallBannerProps = {}) {
  const { isPWA, isInstallable, promptInstall } = usePWA()
  const isDismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot
  )
  const [localDismissed, setLocalDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  const handleDismiss = useCallback(() => {
    setLocalDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      window.dispatchEvent(new Event('storage'))
    } catch {
      // ignore
    }
  }, [])

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      await promptInstall()
    } finally {
      setInstalling(false)
      handleDismiss()
    }
  }

  // Don't render if running in standalone PWA or if user dismissed
  if (isPWA || isDismissed || localDismissed) {
    return null
  }

  const isFloating = variant === 'floating'

  return (
    <Fade in>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)',
          color: 'white',
          overflow: 'hidden',
          ...(isFloating
            ? {
                position: 'fixed',
                bottom: { xs: 16, sm: 24 },
                left: { xs: 16, sm: 'auto' },
                right: { xs: 16, sm: 24 },
                width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                maxWidth: { sm: 480 },
                zIndex: 1300,
                boxShadow: '0 12px 32px -4px rgba(14, 165, 233, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
              }
            : {
                position: 'relative',
                mb: 3,
                boxShadow: '0 8px 20px -4px rgba(14, 165, 233, 0.3)',
              }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Smartphone size={24} className="text-white" />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '0.92rem', sm: '1rem' },
                  letterSpacing: '-0.01em',
                  color: 'white',
                }}
              >
                Pasang Aplikasi MediCore di Layar Utama
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '0.75rem', sm: '0.82rem' },
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Akses cepat jadwal minum obat langsung dari HP tanpa buka peramban.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {isInstallable ? (
              <Button
                variant="contained"
                size="small"
                disabled={installing}
                onClick={handleInstallClick}
                startIcon={<Download size={15} />}
                sx={{
                  bgcolor: 'white',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.75,
                  borderRadius: 9999,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    color: '#0369a1',
                  },
                }}
              >
                Install
              </Button>
            ) : null}
            <IconButton
              size="small"
              onClick={handleDismiss}
              aria-label="Tutup saran instalasi"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Fade>
  )
}
export default PWAInstallBanner
