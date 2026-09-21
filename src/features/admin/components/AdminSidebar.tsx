'use client';

import React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Pill,
  FileText,
  BarChart3,
  LogOut,
  Heart,
  User,
} from 'lucide-react';
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar';
import { useAuth } from '@/src/features/auth';

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pasien & User', href: '/admin/users', icon: Users },
  { name: 'Jadwal & Pengingat', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Katalog Obat', href: '/admin/products', icon: Pill },
  { name: 'Artikel Edukasi', href: '/admin/articles', icon: FileText },
  { name: 'Laporan & Analitik', href: '/admin/reports', icon: BarChart3 },
  { name: 'Profil Admin', href: '/admin/profile', icon: User },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const adminBadge = (
    <Chip
      label='ADMIN'
      size='small'
      sx={{
        bgcolor: '#e11d48',
        color: '#ffffff',
        fontSize: '0.62rem',
        height: 18,
        fontWeight: 800,
        borderRadius: '9999px',
        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
      }}
    />
  );

  const signOutFooter = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {user && (
        <Box
          sx={{
            p: 1.25,
            borderRadius: '12px',
            bgcolor: '#fff5f7',
            border: '1px solid #fce7f3',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            sx={{ width: 34, height: 34, border: '2px solid #f43f5e' }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant='subtitle2'
              noWrap
              sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.2 }}
            >
              {user.name}
            </Typography>
            <Typography
              variant='caption'
              noWrap
              sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <ListItemButton
        onClick={logout}
        sx={{
          borderRadius: '12px',
          py: 1,
          px: 1.5,
          color: '#e11d48',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: '#fff1f2',
            color: '#be123c',
            '& .MuiListItemIcon-root': {
              color: '#be123c',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
          <LogOut size={18} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>Keluar (Sign Out)</Typography>
          }
        />
      </ListItemButton>
    </Box>
  );

  return (
    <AppSidebar
      navItems={adminNavItems}
      brandTitle='Fe-Tablet'
      brandSubtitle='Pusat Kontrol Admin'
      brandIcon={Heart}
      brandHref='/admin/dashboard'
      badge={adminBadge}
      activeBgColor='#ffe4e6'
      activeTextColor='#e11d48'
      activeIconColor='#e11d48'
      activeHoverBgColor='#fecdd3'
      footerAction={signOutFooter}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
