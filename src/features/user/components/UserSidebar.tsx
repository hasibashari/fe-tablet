'use client'

import React from 'react'
import { ListItemButton, ListItemIcon, ListItemText, Typography, Chip, Box } from '@mui/material'
import { LayoutDashboard, Calendar, History, User, LogOut, BookOpen, Cross } from 'lucide-react'
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar'

const userNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/user/schedule', icon: Calendar },
  { name: 'History', href: '/user/history', icon: History },
  { name: 'Education', href: '/user/education', icon: BookOpen },
  { name: 'Profile', href: '/user/profile', icon: User },
]

export default function UserSidebar() {
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
    <ListItemButton
      sx={{
        borderRadius: 1,
        py: 1.25,
        px: 2,
        color: 'text.secondary',
        '&:hover': {
          bgcolor: 'error.light',
          color: 'error.dark',
          '& .MuiListItemIcon-root': {
            color: 'error.dark',
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
        <LogOut size={20} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Sign Out
          </Typography>
        }
      />
    </ListItemButton>
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
    />
  )
}
