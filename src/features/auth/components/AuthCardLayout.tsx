'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { ShieldCheck, ArrowLeft, Activity, CheckCircle2, Clock, Pill } from 'lucide-react';

export interface AuthCardLayoutProps {
  children: React.ReactNode;
}

export function AuthCardLayout({ children }: AuthCardLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        bgcolor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Left Home Navigation */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 32 },
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Link
          href='/'
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:border-slate-300'
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </Box>

      {/* SISI KIRI: Area Form Autentikasi */}
      <Box
        sx={{
          width: { xs: '100%', md: '52%', lg: '50%' },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 6, md: 7, lg: 9 },
          py: { xs: 8, sm: 10 },
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '420px', my: 'auto' }}>
          {children}

          {/* Minimalist Trust & Privacy Footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 4,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            <ShieldCheck size={15} color='#10b981' />
            <Typography
              variant='caption'
              sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}
            >
              Privasi & rekam kesehatan terproteksi enkripsi standar medis
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* SISI KANAN: Asymmetric Curved Backdrop & Isometric Visual Graphic (Hanya Desktop & Tablet >= md) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: { md: '48%', lg: '50%' },
          minHeight: '100vh',
          position: 'relative',
          bgcolor: '#f8fafc',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { md: 4, lg: 6 },
        }}
      >
        {/* Layered Organic Curved Arcs / Circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '-15%',
            transform: 'translateY(-50%)',
            width: '130%',
            height: '130%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(204, 120, 92, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, rgba(248, 250, 252, 0) 75%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            border: '2px solid rgba(204, 120, 92, 0.12)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '-20%',
            width: '750px',
            height: '750px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(14, 165, 233, 0.15)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Isometric & Medical Showcase Card */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Main Showcase Device / Card */}
          <Box
            sx={{
              p: 3.5,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                '0 25px 50px -12px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(255, 255, 255, 0.8)',
              position: 'relative',
            }}
          >
            {/* Header Device */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#cc785c',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(204, 120, 92, 0.3)',
                  }}
                >
                  <Activity size={20} />
                </Box>
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
                  >
                    MediCore Portal
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                  >
                    Sistem Pengingat Obat Digital
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid #a7f3d0',
                }}
              >
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                Aktif
              </Box>
            </Box>

            {/* Reminder Item Simulation */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(204, 120, 92, 0.12)',
                    color: '#cc785c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pill size={16} />
                </Box>
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}
                  >
                    Amoxicillin 500mg
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                    <Clock size={12} />
                    <Typography variant='caption' sx={{ fontSize: '0.72rem' }}>
                      08:00 WIB • Sesudah makan
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <CheckCircle2 size={18} color='#10b981' />
            </Box>

            {/* Adherence Stat */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Kepatuhan Pengobatan:
              </Typography>
              <Typography
                variant='caption'
                sx={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}
              >
                98.4% Tepat Waktu
              </Typography>
            </Box>
          </Box>

          {/* Inspirational Description */}
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography
              variant='h6'
              sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, fontSize: '1.05rem' }}
            >
              Kesehatan Anda, Terpantau Presisi
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: '0.82rem', lineHeight: 1.5 }}
            >
              Akses jadwal minum obat, rekam kondisi harian, dan pantau kesehatan Anda secara
              terpadu.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AuthCardLayout;
