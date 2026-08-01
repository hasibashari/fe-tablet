import React from 'react'
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material'

interface DailyProgressProps {
  total: number
  completed: number
}

export default function DailyProgress({ total, completed }: DailyProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
      }}
    >
      {/* Background Glow Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Daily Progress
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 450 }}>
              You have completed {completed} out of {total} reminders today. Keep up the good work!
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexShrink: 0 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, leading: 1 }}>
                {percentage}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Completed
              </Typography>
            </Box>

            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {/* Track */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={70}
                thickness={4.5}
                sx={{ color: 'rgba(255, 255, 255, 0.2)' }}
              />
              {/* Progress */}
              <CircularProgress
                variant="determinate"
                value={percentage}
                size={70}
                thickness={4.5}
                sx={{
                  color: '#ffffff',
                  position: 'absolute',
                  left: 0,
                  strokeLinecap: 'round',
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

