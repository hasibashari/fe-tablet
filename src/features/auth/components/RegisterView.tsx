'use client'

import React, { Suspense } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { UserCheck, BellRing, Activity, ShieldCheck } from 'lucide-react'
import { AuthSplitLayout } from './AuthSplitLayout'
import { RegisterForm } from './RegisterForm'

export function RegisterView() {
  const featureItems = [
    {
      icon: <BellRing size={18} />,
      iconBg: 'rgba(52, 211, 153, 0.15)',
      iconColor: '#34d399',
      title: 'Jadwal & Dosis Otomatis',
      subtitle: 'Sinkron langsung dari rekomendasi dokter penanggung jawab.',
    },
    {
      icon: <Activity size={18} />,
      iconBg: 'rgba(14, 165, 233, 0.15)',
      iconColor: '#38bdf8',
      title: 'Riwayat Kepatuhan Visual',
      subtitle: 'Capaian kepatuhan tercatat rapi untuk evaluasi berkala.',
    },
  ]

  const securityAssuranceCard = (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <ShieldCheck size={16} color="#34d399" />
        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'white' }}>
          Standar Keamanan Data Medis
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', fontSize: '0.72rem', lineHeight: 1.4 }}>
        Privasi dan rekam medis terproteksi enkripsi end-to-end standar fasilitas pelayanan kesehatan.
      </Typography>
    </Box>
  )

  return (
    <AuthSplitLayout
      badgeLabel="Pendaftaran Pasien Mandiri"
      badgeIcon={<UserCheck size={14} color="#34d399" />}
      badgeBg="rgba(52, 211, 153, 0.12)"
      badgeColor="#34d399"
      badgeBorder="rgba(52, 211, 153, 0.25)"
      glowTopColor="rgba(16, 185, 129, 0.25)"
      glowBottomColor="rgba(14, 165, 233, 0.18)"
      title="Mulai Perjalanan Kebugaran & Terapi Anda"
      subtitle="Dapatkan pengingat konsumsi harian, pantau kepatuhan resep dokter, dan riwayat kesehatan dalam satu portal mandiri terpadu."
      featureItems={featureItems}
      footerCard={securityAssuranceCard}
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
    </AuthSplitLayout>
  )
}

export default RegisterView
