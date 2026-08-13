'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Box, Typography, Card, Chip, CircularProgress } from '@mui/material'
import { Cross, ShieldCheck, HeartPulse, Clock, Sparkles, ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/src/features/auth'

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#f8fafc',
      }}
    >
      {/* Left Visual Banner (Desktop / Tablet Landscape) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '45%',
          bgcolor: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 6, xl: 8 },
          color: 'white',
        }}
      >
        {/* Background glow effects */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(15, 23, 42, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Brand */}
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
              icon={<ShieldCheck size={14} color="#38bdf8" />}
              label="Sistem Rekam Klinis Terakreditasi"
              size="small"
              sx={{
                bgcolor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            />
          </Box>
        </Box>

        {/* Center Content */}
        <Box sx={{ position: 'relative', zIndex: 1, my: 'auto', py: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              mb: 2.5,
              fontSize: { lg: '2.2rem', xl: '2.6rem' },
            }}
          >
            Akurasi Medis & Pemantauan Kepatuhan Terpadu
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.6,
              mb: 4,
              fontSize: '1rem',
            }}
          >
            Platform kontrol klinis untuk dokter dan portal pemantauan konsumsi obat harian bagi pasien dengan teknologi real-time.
          </Typography>

          {/* Feature Highlight Points */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                <Clock size={20} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Pengingat Jadwal Presisi</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Notifikasi konsumsi harian sesuai resep klinis dokter.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <HeartPulse size={20} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Analitik Kepatuhan Pasien</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Grafik kepatuhan minum obat dengan rasio kepatuhan 90%+.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom Testimonial Snippet */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)', mb: 1.5, fontSize: '0.88rem' }}>
            &ldquo;Integrasi data antara jadwal pasien dan monitoring dokter memastikan efektivitas terapi obat berjalan optimal.&rdquo;
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
              alt="dr. Siti Rahma"
              sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'white' }}>
                dr. Siti Rahma, Sp.PD
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.72rem' }}>
                Spesialis Penyakit Dalam • MediCore Clinical
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Form Column */}
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
        {/* Top Navigation Back */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 20, sm: 32 },
            left: { xs: 20, sm: 40 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </Box>

        {/* Mobile Header Logo (< lg) */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, mt: 4, alignItems: 'center', gap: 2 }}>
          <div className="bg-primary text-white p-2 rounded-xl shadow-md">
            <Cross size={22} />
          </div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Medi<span className="text-primary">Core</span>
          </Typography>
        </Box>

        {/* Form Container */}
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '500px',
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
            <LoginForm />
          </Suspense>
        </Card>
      </Box>
    </Box>
  )
}
