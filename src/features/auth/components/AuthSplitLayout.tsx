'use client'

import React from 'react'
import Link from 'next/link'
import { Box, Typography, Card, Chip } from '@mui/material'
import { Cross } from 'lucide-react'

export interface AuthFeatureItem {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
}

export interface AuthSplitLayoutProps {
  badgeLabel: string
  badgeIcon: React.ReactNode
  badgeBg?: string
  badgeColor?: string
  badgeBorder?: string
  title: string
  subtitle: string
  featureItems?: AuthFeatureItem[]
  footerCard?: React.ReactNode
  glowTopColor?: string
  glowBottomColor?: string
  children: React.ReactNode
}

export function AuthSplitLayout({
  badgeLabel,
  badgeIcon,
  badgeBg = 'rgba(56, 189, 248, 0.12)',
  badgeColor = '#38bdf8',
  badgeBorder = 'rgba(56, 189, 248, 0.25)',
  title,
  subtitle,
  featureItems = [],
  footerCard,
  glowTopColor = 'rgba(14, 165, 233, 0.28)',
  glowBottomColor = 'rgba(16, 185, 129, 0.18)',
  children,
}: AuthSplitLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f8fafc',
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 11, sm: 13, md: 14 },
        pb: { xs: 6, sm: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Background Gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container Wrapper */}
      <Box sx={{ width: '100%', maxWidth: '1060px', position: 'relative', zIndex: 1 }}>
        {/* Contained Split-Screen Card */}
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left Visual Banner (Desktop / Tablet Landscape) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: { md: '44%', lg: '45%' },
              bgcolor: '#0f172a',
              position: 'relative',
              overflow: 'hidden',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { md: 4.5, lg: 6 },
              color: 'white',
            }}
          >
            {/* Background glow inside card */}
            <Box
              sx={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${glowTopColor} 0%, rgba(15, 23, 42, 0) 70%)`,
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-15%',
                right: '-15%',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${glowBottomColor} 0%, rgba(15, 23, 42, 0) 70%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Top Brand */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Link href="/" className="inline-flex items-center gap-2.5 group text-white no-underline">
                <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-primary-active transition-colors shadow-lg shadow-primary/30">
                  <Cross size={22} />
                </div>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'white' }}>
                  Medi<span style={{ color: '#38bdf8' }}>Core</span>
                </Typography>
              </Link>
              <Box sx={{ mt: 1.5 }}>
                <Chip
                  icon={badgeIcon as React.ReactElement}
                  label={badgeLabel}
                  size="small"
                  sx={{
                    bgcolor: badgeBg,
                    color: badgeColor,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: `1px solid ${badgeBorder}`,
                  }}
                />
              </Box>
            </Box>

            {/* Center Content */}
            <Box sx={{ position: 'relative', zIndex: 1, my: 'auto', py: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.25,
                  mb: 2,
                  fontSize: { md: '1.75rem', lg: '2.1rem' },
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  lineHeight: 1.6,
                  mb: 3.5,
                  fontSize: '0.92rem',
                }}
              >
                {subtitle}
              </Typography>

              {/* Feature Highlights */}
              {featureItems.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {featureItems.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: item.iconBg, color: item.iconColor }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                          {item.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Bottom Footer Card */}
            {footerCard && (
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {footerCard}
              </Box>
            )}
          </Box>

          {/* Right Form Column */}
          <Box
            sx={{
              flex: 1,
              width: { xs: '100%', md: '56%', lg: '55%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 3, sm: 4.5, md: 5, lg: 6 },
              bgcolor: 'background.paper',
            }}
          >
            {/* Mobile Header Logo (< md) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 3, alignItems: 'center', gap: 1.5, alignSelf: 'flex-start' }}>
              <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
                <Cross size={20} />
              </div>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Medi<span className="text-primary">Core</span>
              </Typography>
            </Box>

            {children}
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
