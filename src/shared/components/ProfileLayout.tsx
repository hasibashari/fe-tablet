'use client'

import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Skeleton,
} from '@mui/material'
import { Edit2 } from 'lucide-react'

export interface ProfileContactItem {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  label?: string
  value: React.ReactNode
}

export interface ProfileMetricItem {
  label: string
  value: React.ReactNode
  subtitle?: string
  icon: React.ComponentType<{ size?: number }>
  iconBgColor?: string
  iconColor?: string
}

export interface ProfileLayoutProps {
  /** Page Header */
  title: string
  subtitle?: string
  onEditClick?: () => void
  editButtonText?: string

  /** Main Profile Card */
  name: string
  avatarUrl?: string
  badges?: React.ReactNode
  secondaryText?: React.ReactNode
  contactItems: ProfileContactItem[]

  /** Metrics / Highlights Section */
  metricsTitle?: string
  metrics?: ProfileMetricItem[]

  /** State & Extra Content */
  loading?: boolean
  children?: React.ReactNode
}

export default function ProfileLayout({
  title,
  subtitle,
  onEditClick,
  editButtonText = 'Edit Profile',
  name,
  avatarUrl,
  badges,
  secondaryText,
  contactItems,
  metricsTitle,
  metrics,
  loading = false,
  children,
}: ProfileLayoutProps) {
  if (loading) {
    return (
      <Box sx={{ pb: 5, width: '100%' }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="text" width={340} height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 5, width: '100%' }}>
      {/* 1. Header Section */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {onEditClick && (
          <Button
            variant="contained"
            startIcon={<Edit2 size={16} />}
            onClick={onEditClick}
            sx={{
              bgcolor: 'primary.light',
              color: 'primary.dark',
              boxShadow: 'none',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(2, 132, 199, 0.18)',
                boxShadow: 'none',
              },
            }}
          >
            {editButtonText}
          </Button>
        )}
      </Box>

      {/* 2. Main Profile Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 4,
            }}
          >
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{
                width: 120,
                height: 120,
                fontSize: '2.5rem',
                fontWeight: 700,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                border: '4px solid #ffffff',
                flexShrink: 0,
              }}
            >
              {name ? name.substring(0, 2).toUpperCase() : 'U'}
            </Avatar>

            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  gap: 1.5,
                  flexWrap: 'wrap',
                  mb: badges || secondaryText ? 0.75 : 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {name}
                </Typography>
                {badges}
              </Box>

              {secondaryText && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {secondaryText}
                </Typography>
              )}

              <Grid container spacing={2} sx={{ mt: secondaryText ? 0 : 1 }}>
                {contactItems.map((item, index) => {
                  const IconComp = item.icon
                  return (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                        <IconComp size={18} style={{ color: 'var(--mui-palette-primary-main)' }} />
                        <Box>
                          {item.label && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                              {item.label}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ fontWeight: item.label ? 500 : 400 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Metrics / Highlights Section */}
      {metrics && metrics.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {metricsTitle && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2.5 }}>
              {metricsTitle}
            </Typography>
          )}

          <Grid container spacing={3}>
            {metrics.map((metric, index) => {
              const IconComp = metric.icon
              return (
                <Grid key={index} size={{ xs: 12, sm: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'background.paper',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: metric.iconBgColor || 'primary.light',
                        color: metric.iconColor || 'primary.dark',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={24} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                        {metric.value}
                      </Typography>
                      {metric.subtitle && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                          {metric.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* 4. Slot for dialogs, extra custom sections, or snackbars */}
      {children}
    </Box>
  )
}
