'use client'

import React from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'

export interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>
  iconBgColor?: string
  iconColor?: string
  valueColor?: string
  subtitle?: React.ReactNode
  extraContent?: React.ReactNode
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'rgba(2, 132, 199, 0.08)',
  iconColor = '#0284c7',
  valueColor = '#0f172a',
  subtitle,
  extraContent,
}: StatCardProps) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
        bgcolor: '#ffffff',
        height: '110px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#cbd5e1',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              fontSize: '0.8125rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: '9999px',
              bgcolor: iconBgColor,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} />
          </Box>
        </Box>

        <Box sx={{ mt: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: valueColor,
              fontSize: '1.625rem',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            typeof subtitle === 'string' ? (
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  display: 'block',
                  fontWeight: 400,
                  mt: 0.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {subtitle}
              </Typography>
            ) : (
              <Box sx={{ mt: 0.25 }}>{subtitle}</Box>
            )
          )}
          {extraContent && <Box sx={{ mt: 0.5 }}>{extraContent}</Box>}
        </Box>
      </CardContent>
    </Card>
  )
}
