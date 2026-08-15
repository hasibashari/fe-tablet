'use client'

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { Box, Typography, Button, Paper, IconButton, Slide, Fade } from '@mui/material'
import { Smartphone, Download, X, Sparkles } from 'lucide-react'
import { usePWA } from '@/src/shared/hooks/usePWA'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/src/shared/utils/notifications'

const STORAGE_KEY = 'medicore_pwa_banner_dismissed'

function subscribeDismissed(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
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
  /**
   * Position placement for the floating toast. Default is 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center'
  /**
   * Delay in ms before the toast animates in after mount. Default is 1200ms
   */
  delayMs?: number
  /**
   * Variant compatibility prop (both inline and floating now render as a refined Toast)
   */
  variant?: 'inline' | 'floating'
}

function subscribeMount() {
  return () => {}
}

function getMountSnapshot() {
  return true
}

function getMountServerSnapshot() {
  return false
}

export function PWAInstallBanner({
  position = 'bottom-right',
  delayMs = 1200,
}: PWAInstallBannerProps = {}) {
  const { isPWA, isInstallable, promptInstall } = usePWA()
  const isDismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot
  )
  const mounted = useSyncExternalStore(
    subscribeMount,
    getMountSnapshot,
    getMountServerSnapshot
  )
  const [visible, setVisible] = useState(false)
  const [localDismissed, setLocalDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setLocalDismissed(true)
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true')
        window.dispatchEvent(new Event('storage'))
      } catch {
        // ignore
      }
    }, 300)
  }, [])

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      const installed = await promptInstall()
      if (installed && isNotificationSupported() && getNotificationPermission() === 'default') {
        await requestNotificationPermission()
      }
    } finally {
      setInstalling(false)
      handleDismiss()
    }
  }

  // Do not render if in standalone PWA, dismissed, or not yet mounted
  if (!mounted || isPWA || isDismissed || localDismissed) {
    return null
  }

  // Positioning style based on prop
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return {
          bottom: { xs: 20, sm: 28 },
          left: { xs: 16, sm: 28 },
          right: { xs: 16, sm: 'auto' },
        }
      case 'top-right':
        return {
          top: { xs: 20, sm: 28 },
          right: { xs: 16, sm: 28 },
          left: { xs: 16, sm: 'auto' },
        }
      case 'bottom-center':
        return {
          bottom: { xs: 20, sm: 28 },
          left: { xs: 16, sm: '50%' },
          right: { xs: 16, sm: 'auto' },
          transform: { sm: 'translateX(-50%)' },
        }
      case 'bottom-right':
      default:
        return {
          bottom: { xs: 20, sm: 28 },
          right: { xs: 16, sm: 28 },
          left: { xs: 16, sm: 'auto' },
        }
    }
  }

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit timeout={400}>
      <Box
        sx={{
          position: 'fixed',
          ...getPositionStyles(),
          zIndex: 1400,
          width: { xs: 'calc(100% - 32px)', sm: 400 },
          maxWidth: { xs: '100%', sm: 420 },
        }}
      >
        <Fade in={visible} timeout={400}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.25 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.95) 0%, rgba(14, 165, 233, 0.98) 50%, rgba(56, 189, 248, 0.95) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: 'white',
              boxShadow: '0 20px 38px -8px rgba(14, 165, 233, 0.45), 0 8px 18px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 24px 44px -6px rgba(14, 165, 233, 0.55), 0 10px 22px rgba(0, 0, 0, 0.18)',
              },
            }}
          >
            {/* Subtle background ambient shine */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1.5,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Left: Icon & Text content */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, flex: 1 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                    mt: 0.25,
                  }}
                >
                  <Smartphone size={22} className="text-white" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '0.88rem', sm: '0.94rem' },
                        letterSpacing: '-0.01em',
                        color: 'white',
                        lineHeight: 1.3,
                      }}
                    >
                      Pasang MediCore
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        px: 0.75,
                        py: 0.15,
                        borderRadius: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.22)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Sparkles size={10} /> App
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.92)',
                      fontSize: { xs: '0.74rem', sm: '0.78rem' },
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    Akses cepat jadwal & pengingat minum obat langsung dari layar utama.
                  </Typography>
                </Box>
              </Box>

              {/* Close Button Top Right */}
              <IconButton
                size="small"
                onClick={handleDismiss}
                aria-label="Tutup notifikasi instalasi"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  p: 0.5,
                  mt: -0.5,
                  mr: -0.5,
                  flexShrink: 0,
                  '&:hover': {
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <X size={17} />
              </IconButton>
            </Box>

            {/* Bottom Actions Row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                mt: 1.75,
                pt: 1.25,
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Button
                variant="text"
                size="small"
                onClick={handleDismiss}
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  px: 1.25,
                  py: 0.4,
                  minWidth: 'auto',
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    color: 'white',
                  },
                }}
              >
                Nanti Saja
              </Button>

              {isInstallable ? (
                <Button
                  variant="contained"
                  size="small"
                  disabled={installing}
                  onClick={handleInstallClick}
                  startIcon={<Download size={14} />}
                  sx={{
                    bgcolor: 'white',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    px: 1.8,
                    py: 0.6,
                    borderRadius: 1.5,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.14)',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      color: '#0369a1',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  {installing ? 'Memasang...' : 'Pasang Sekarang'}
                </Button>
              ) : null}
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Slide>
  )
}

export const PWAInstallToast = PWAInstallBanner
export default PWAInstallBanner
