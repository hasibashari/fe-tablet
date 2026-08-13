'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Box, Typography, Card, CircularProgress, Chip } from '@mui/material'
import { Cross, ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react'
import { RegisterForm } from '@/src/features/auth'

export default function RegisterPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#f8fafc',
      }}
    >
      {/* Left Visual Column */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '40%',
          bgcolor: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 6, xl: 8 },
          color: 'white',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-15%',
            right: '-15%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(15, 23, 42, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" className="inline-flex items-center gap-2.5 group text-white no-underline">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-primary-active transition-colors shadow-lg shadow-primary/30">
              <Cross size={24} />
            </div>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'white' }}>
              Medi<span style={{ color: '#38bdf8' }}>Core</span>
            </Typography>
          </Link>
          <Box sx={{ mt: 1 }}>
            <Chip
              icon={<UserCheck size={14} color="#34d399" />}
              label="Pendaftaran Pasien Mandiri"
              size="small"
              sx={{
                bgcolor: 'rgba(52, 211, 153, 0.12)',
                color: '#34d399',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: '1px solid rgba(52, 211, 153, 0.25)',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, my: 'auto', py: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.25,
              mb: 2,
              fontSize: { lg: '2rem', xl: '2.4rem' },
            }}
          >
            Mulai Perjalanan Kebugaran & Terapi Anda
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Dapatkan pengingat minum obat harian, artikel edukasi kurasi dokter, dan laporan riwayat kesehatan Anda dalam satu platform terintegrasi.
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Privasi & Keamanan Data Medis Terproteksi Enkripsi Standar Fasilitas Pelayanan Kesehatan.
          </Typography>
        </Box>
      </Box>

      {/* Right Column */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 5, md: 8 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 20, sm: 32 },
            left: { xs: 20, sm: 40 },
          }}
        >
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </Box>

        <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 3, mt: 5, alignItems: 'center', gap: 2 }}>
          <div className="bg-primary text-white p-2 rounded-xl shadow-md">
            <Cross size={22} />
          </div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Medi<span className="text-primary">Core</span>
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '520px',
            p: { xs: 3, sm: 4.5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            }
          >
            <RegisterForm />
          </Suspense>
        </Card>
      </Box>
    </Box>
  )
}
