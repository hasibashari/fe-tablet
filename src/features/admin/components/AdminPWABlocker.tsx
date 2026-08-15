'use client'

import React from 'react'
import { Box, Typography, Button, Paper, Stack, Chip, Divider } from '@mui/material'
import { Monitor, LogOut, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react'
import { useAuth } from '@/src/features/auth'
import { useRouter } from 'next/navigation'

export function AdminPWABlocker() {
  const { logout, quickLogin } = useAuth()
  const router = useRouter()

  const handleOpenInBrowser = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.origin + '/admin/dashboard', '_system')
    }
  }

  const handleSwitchToPatient = async () => {
    const res = await quickLogin('patient')
    if (res.success) {
      router.replace('/user/dashboard')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2.5,
        bgcolor: '#f8fafc',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 460,
          width: '100%',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Badge Header */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<ShieldAlert size={14} className="text-amber-600" />}
            label="Akses Dibatasi di Aplikasi Mobile"
            size="small"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              color: '#b45309',
              fontWeight: 700,
              fontSize: '0.72rem',
              px: 1,
            }}
          />
        </Box>

        {/* Icon Illustration */}
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            borderRadius: 3,
            bgcolor: 'rgba(14, 165, 233, 0.1)',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Monitor size={36} />
        </Box>

        {/* Title & Description */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            mb: 1.25,
            fontSize: { xs: '1.25rem', sm: '1.4rem' },
          }}
        >
          Portal Admin Khusus Desktop
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            mb: 3,
            fontSize: '0.88rem',
          }}
        >
          Untuk memastikan ketelitian input rekam medis, verifikasi jadwal obat, dan visualisasi laporan klinis, Portal Administrator hanya dapat diakses melalui peramban komputer atau laptop.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleOpenInBrowser}
            startIcon={<ExternalLink size={18} />}
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Buka di Browser Web
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="medium"
            onClick={handleSwitchToPatient}
            endIcon={<ArrowRight size={16} />}
            sx={{
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#cbd5e1',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(14, 165, 233, 0.05)',
                borderColor: 'primary.main',
              },
            }}
          >
            Beralih ke Portal Pasien
          </Button>

          <Button
            variant="text"
            color="error"
            size="small"
            onClick={logout}
            startIcon={<LogOut size={16} />}
            sx={{
              mt: 1,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Keluar dari Akun Admin
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
export default AdminPWABlocker
