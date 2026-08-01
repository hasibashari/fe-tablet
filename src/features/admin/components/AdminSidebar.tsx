'use client'

import React from 'react'
import { ListItemButton, ListItemIcon, ListItemText, Typography, Chip, Box } from '@mui/material'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Pill,
  FileText,
  Activity,
  BarChart3,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar'

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pasien & User', href: '/admin/users', icon: Users },
  { name: 'Jadwal & Pengingat', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Katalog Obat', href: '/admin/products', icon: Pill },
  { name: 'Artikel Edukasi', href: '/admin/articles', icon: FileText },
  { name: 'Program Kesehatan', href: '/admin/programs', icon: Activity },
  { name: 'Laporan & Analitik', href: '/admin/reports', icon: BarChart3 },
]

export default function AdminSidebar() {
  const adminBadge = (
    <Chip
      label="ADMIN"
      size="small"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
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
          bgcolor: 'error.50',
          color: 'error.main',
          '& .MuiListItemIcon-root': {
            color: 'error.main',
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
      navItems={adminNavItems}
      brandTitle={
        <>
          Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
        </>
      }
      brandSubtitle="Clinical Control Center"
      brandIcon={ShieldCheck}
      brandHref="/admin/dashboard"
      badge={adminBadge}
      activeBgColor="primary.light"
      activeTextColor="primary.dark"
      activeIconColor="primary.dark"
      activeHoverBgColor="rgba(2, 132, 199, 0.15)"
      footerAction={signOutFooter}
    />
  )
}
