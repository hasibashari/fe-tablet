'use client'

import React from 'react'
import { ListItemButton, ListItemIcon, ListItemText, Typography, Chip, Box, Avatar } from '@mui/material'
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
import { useAuth } from '@/src/features/auth'

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pasien & User', href: '/admin/users', icon: Users },
  { name: 'Jadwal & Pengingat', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Katalog Obat', href: '/admin/products', icon: Pill },
  { name: 'Artikel Edukasi', href: '/admin/articles', icon: FileText },
  { name: 'Program Kesehatan', href: '/admin/programs', icon: Activity },
  { name: 'Laporan & Analitik', href: '/admin/reports', icon: BarChart3 },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth()

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
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  )
}
