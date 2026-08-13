'use client'

import React from 'react'
import { ListItemButton, ListItemIcon, ListItemText, Typography, Chip, Box, Avatar } from '@mui/material'
import { LayoutDashboard, Calendar, History, User, LogOut, BookOpen, Cross } from 'lucide-react'
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar'
import { useAuth } from '@/src/features/auth'

const userNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/user/schedule', icon: Calendar },
  { name: 'History', href: '/user/history', icon: History },
  { name: 'Education', href: '/user/education', icon: BookOpen },
  { name: 'Profile', href: '/user/profile', icon: User },
]

interface UserSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function UserSidebar({ mobileOpen = false, onMobileClose }: UserSidebarProps) {
  const { user, logout } = useAuth()

  const patientBadge = (
    <Chip
      label="PATIENT"
      size="small"
      sx={{
        bgcolor: 'primary.light',
        color: 'primary.dark',
        fontSize: '0.62rem',
        height: 18,
        fontWeight: 700,
        borderRadius: '9999px',
      }}
    />
  )

  const signOutFooter = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {user && (
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: 'rgba(14, 165, 233, 0.06)',
            border: '1px solid rgba(14, 165, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 34, height: 34, border: '1.5px solid #0ea5e9' }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary', lineHeight: 1.2 }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <ListItemButton
        onClick={logout}
        sx={{
          borderRadius: 1,
          py: 1,
          px: 1.5,
          color: 'error.main',
          '&:hover': {
            bgcolor: 'error.50',
            '& .MuiListItemIcon-root': {
              color: 'error.main',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
          <LogOut size={18} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
              Keluar (Sign Out)
            </Typography>
          }
        />
      </ListItemButton>
    </Box>
  )

  return (
    <AppSidebar
      navItems={userNavItems}
      brandTitle={
        <>
          Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
        </>
      }
      brandSubtitle="Patient Portal"
      brandIcon={Cross}
      brandHref="/user/dashboard"
      badge={patientBadge}
      activeBgColor="primary.light"
      activeTextColor="primary.dark"
      activeIconColor="primary.dark"
      activeHoverBgColor="rgba(14, 165, 233, 0.15)"
      footerAction={signOutFooter}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  )
}
