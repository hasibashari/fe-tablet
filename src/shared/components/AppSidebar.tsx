'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>
}

export interface AppSidebarProps {
  navItems: NavItem[]
  brandTitle?: React.ReactNode
  brandSubtitle?: string
  brandIcon?: React.ComponentType<{ size?: number; color?: string }>
  brandHref?: string
  badge?: React.ReactNode
  footerAction?: React.ReactNode
  activeBgColor?: string
  activeTextColor?: string
  activeIconColor?: string
  activeHoverBgColor?: string
  insetShadow?: string
  drawerWidth?: number
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function AppSidebar({
  navItems,
  brandTitle = 'Fe-Tablet',
  brandSubtitle = 'Admin Panel',
  brandIcon: BrandIcon,
  brandHref = '/admin/dashboard',
  badge,
  footerAction,
  activeBgColor = '#ffe4e6',
  activeTextColor = '#e11d48',
  activeIconColor = '#e11d48',
  activeHoverBgColor = '#fecdd3',
  insetShadow,
  drawerWidth = 260,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* Header Section */}
      <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #fce7f3', px: 1 }}>
        <Box
          component={Link}
          href={brandHref}
          onClick={onMobileClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {BrandIcon ? (
            <Box
              sx={{
                display: 'flex',
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                flexShrink: 0,
              }}
            >
              <BrandIcon size={20} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                flexShrink: 0,
              }}
            >
              🌸
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, color: '#1e293b' }}>
                {brandTitle}
              </Typography>
              {badge}
            </Box>
            <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 600, fontSize: '0.72rem' }}>
              {brandSubtitle}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, px: 0, gap: 0.75, display: 'flex', flexDirection: 'column' }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href))
          const Icon = item.icon
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onMobileClose}
                selected={isActive}
                sx={{
                  borderRadius: '12px',
                  py: 1.1,
                  px: 1.75,
                  transition: 'all 0.15s ease',
                  '&.Mui-selected': {
                    bgcolor: activeBgColor,
                    color: activeTextColor,
                    boxShadow: insetShadow || '0 1px 4px rgba(225, 29, 72, 0.08)',
                    '& .MuiListItemIcon-root': {
                      color: activeIconColor,
                    },
                    '&:hover': {
                      bgcolor: activeHoverBgColor,
                    },
                  },
                  '&:hover': {
                    bgcolor: '#fff5f7',
                    color: '#e11d48',
                    '& .MuiListItemIcon-root': {
                      color: '#e11d48',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isActive ? activeIconColor : '#64748b',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Icon size={19} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? activeTextColor : '#475569',
                      }}
                    >
                      {item.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {footerAction && (
        <>
          <Divider sx={{ my: 1.5, borderColor: '#fce7f3' }} />
          <Box sx={{ pt: 0.5 }}>{footerAction}</Box>
        </>
      )}
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Temporary Drawer (< md) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderColor: '#fce7f3',
            backgroundColor: '#ffffff',
            px: 2,
            py: 2.5,
            boxShadow: '4px 0 24px rgba(225, 29, 72, 0.08)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Permanent Drawer (>= md) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderColor: '#fce7f3',
            backgroundColor: '#ffffff',
            px: 2,
            py: 2.5,
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.02)',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  )
}
