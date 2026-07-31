'use client'

import React, { useEffect, useState } from 'react'
import { getProfile } from '../api/getProfile'
import { UserProfile } from '../types'
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
import { User, Mail, Phone, Calendar, Activity, Edit2 } from 'lucide-react'

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProfile()
      setProfile(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ pb: 5, width: '100%' }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 6, my: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (!profile) return null

  return (
    <Box sx={{ pb: 5, width: '100%' }}>
      {/* Header */}
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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            My Profile
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage your personal information and health data.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Edit2 size={16} />}
          sx={{
            bgcolor: 'rgba(2, 132, 199, 0.1)',
            color: 'primary.main',
            boxShadow: 'none',
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            '&:hover': {
              bgcolor: 'rgba(2, 132, 199, 0.2)',
              boxShadow: 'none',
            },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Main Profile Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'var(--color-hairline, #e2e8f0)',
          mb: 4,
          bgcolor: '#ffffff',
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
              src={profile.avatar}
              alt={profile.name}
              sx={{
                width: 120,
                height: 120,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                border: '4px solid #ffffff',
                flexShrink: 0,
              }}
            />

            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                {profile.name}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                    <Mail size={18} style={{ color: '#0284c7' }} />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                    <Phone size={18} style={{ color: '#0284c7' }} />
                    <Typography variant="body2">{profile.phone}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                    <Calendar size={18} style={{ color: '#0284c7' }} />
                    <Typography variant="body2">Born {profile.dateOfBirth}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Health Metrics Section */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2.5 }}>
        Health Metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'var(--color-hairline, #e2e8f0)',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={24} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Blood Type
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', leading: 1.2 }}>
                {profile.bloodType}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'var(--color-hairline, #e2e8f0)',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={24} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Height
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', leading: 1.2 }}>
                {profile.height} cm
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'var(--color-hairline, #e2e8f0)',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: '#f0fdf4',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={24} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Weight
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', leading: 1.2 }}>
                {profile.weight} kg
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )

}

