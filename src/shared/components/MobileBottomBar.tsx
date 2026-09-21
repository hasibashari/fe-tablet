'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import { LayoutDashboard, Calendar, History, BookOpen, User } from 'lucide-react'

export interface BottomNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
}

export const USER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Jadwal', href: '/user/schedule', icon: Calendar },
  { name: 'Riwayat', href: '/user/history', icon: History },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Profil', href: '/user/profile', icon: User },
]

export interface MobileBottomBarProps {
  items?: BottomNavItem[]
}

export default function MobileBottomBar({ items = USER_BOTTOM_NAV_ITEMS }: MobileBottomBarProps) {
  const pathname = usePathname()

  return (
    <Box
      component="nav"
      aria-label="Navigasi Bawah Mobile"
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        height: 64,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        px: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        boxSizing: 'border-box',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/user/dashboard' && pathname?.startsWith(item.href))
        const Icon = item.icon

        return (
          <Box
            key={item.name}
            component={Link}
            href={item.href}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              minWidth: 56,
              height: '100%',
              py: 0.5,
              px: 1,
              borderRadius: 2,
              color: isActive ? '#cc785c' : '#64748b',
              transition: 'all 0.15s ease-in-out',
              position: 'relative',
              '&:hover': {
                color: '#cc785c',
                bgcolor: 'rgba(204, 120, 92, 0.04)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {/* Active Top Bar Indicator */}
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  bgcolor: '#cc785c',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 28,
                borderRadius: '12px',
                bgcolor: isActive ? 'rgba(204, 120, 92, 0.12)' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? '#cc785c' : '#64748b'} />
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#cc785c' : '#64748b',
                lineHeight: 1.1,
                mt: 0.25,
              }}
            >
              {item.name}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
