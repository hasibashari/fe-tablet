'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        pb: 2,
        mb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Title & Subtitle Section */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.625rem' },
            letterSpacing: '-0.4px',
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              fontWeight: 400,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Optional Action Controls Slot */}
      {action && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  )
}
