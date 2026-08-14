'use client'

import React, { Suspense } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { ShieldCheck, Clock, HeartPulse } from 'lucide-react'
import { AuthSplitLayout } from './AuthSplitLayout'
import { LoginForm } from './LoginForm'

export function LoginView() {
  const featureItems = [
    {
      icon: <Clock size={18} />,
      iconBg: 'rgba(14, 165, 233, 0.15)',
      iconColor: '#38bdf8',
      title: 'Pengingat Jadwal Presisi',
      subtitle: 'Notifikasi konsumsi harian sesuai resep klinis.',
    },
    {
      icon: <HeartPulse size={18} />,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#34d399',
      title: 'Analitik Kepatuhan Pasien',
      subtitle: 'Grafik kepatuhan minum obat dengan rasio 90%+.',
    },
  ]

  const testimonialCard = (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)', mb: 1, fontSize: '0.82rem' }}>
        &ldquo;Integrasi data resep dan tracking mandiri pasien meningkatkan keberhasilan terapi secara signifikan.&rdquo;
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
          alt="dr. Siti Rahma"
          sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'white' }}>
            dr. Siti Rahma, Sp.PD
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.68rem' }}>
            Spesialis Penyakit Dalam • MediCore Clinical
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <AuthSplitLayout
      badgeLabel="Sistem Rekam Klinis Terakreditasi"
      badgeIcon={<ShieldCheck size={14} color="#38bdf8" />}
      title="Akurasi Medis & Pemantauan Kepatuhan Terpadu"
      subtitle="Platform kontrol klinis untuk dokter dan portal pemantauan konsumsi obat harian bagi pasien secara terstruktur."
      featureItems={featureItems}
      footerCard={testimonialCard}
    >
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  )
}

export default LoginView
