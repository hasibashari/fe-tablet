'use client'

import React from 'react'
import Link from 'next/link'
import { Box, Typography, IconButton } from '@mui/material'
import { Menu, Cross } from 'lucide-react'

export interface MobileTopBarProps {
  onOpenSidebar: () => void
  brandTitle?: React.ReactNode
  brandSubtitle?: string
  brandHref?: string
  badge?: React.ReactNode
}

export default function MobileTopBar({
  onOpenSidebar,
  brandTitle = 'MediCore',
  brandSubtitle = 'Portal',
  brandHref = '/',
  badge,
}: MobileTopBarProps) {
  return (
    <Box
      component="header"
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        px: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #eceae4',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Left: Brand / Logo */}
      <Box
        component={Link}
        href={brandHref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            bgcolor: '#cc785c',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(204, 120, 92, 0.25)',
          }}
        >
          <Cross size={18} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1c1c1c' }}>
              {brandTitle}
            </Typography>
            {badge}
          </Box>
          {brandSubtitle && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#6b6964', lineHeight: 1 }}>
              {brandSubtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: Hamburger Menu Button (Min 44px touch target) */}
      <IconButton
        onClick={onOpenSidebar}
        aria-label="Buka menu navigasi"
        sx={{
          width: 44,
          height: 44,
          borderRadius: '6px',
          color: '#1c1c1c',
          border: '1px solid #eceae4',
          bgcolor: '#f7f4ed',
          '&:hover': {
            bgcolor: '#eceae4',
          },
          '&:active': {
            opacity: 0.8,
          },
        }}
      >
        <Menu size={22} />
      </IconButton>
    </Box>
  )
}
