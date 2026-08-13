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
  brandTitle = 'MediCore',
  brandSubtitle = 'Portal',
  brandIcon: BrandIcon,
  brandHref = '/',
  badge,
  footerAction,
  activeBgColor = 'rgba(204, 120, 92, 0.12)',
  activeTextColor = '#a9583e',
  activeIconColor = '#cc785c',
  activeHoverBgColor = 'rgba(204, 120, 92, 0.18)',
  insetShadow,
  drawerWidth = 260,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eceae4', px: 1 }}>
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
          {BrandIcon && (
            <Box
              sx={{
                display: 'flex',
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                bgcolor: '#cc785c',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(204, 120, 92, 0.25)',
              }}
            >
              <BrandIcon size={22} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1c1c1c' }}>
                {brandTitle}
              </Typography>
              {badge}
            </Box>
            <Typography variant="caption" sx={{ color: '#5f5f5d', fontWeight: 500 }}>
              {brandSubtitle}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, px: 0, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          const Icon = item.icon
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onMobileClose}
                selected={isActive}
                sx={{
                  borderRadius: '6px',
                  py: 1.25,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: activeBgColor,
                    color: activeTextColor,
                    boxShadow: insetShadow,
                    '& .MuiListItemIcon-root': {
                      color: activeIconColor,
                    },
                    '&:hover': {
                      bgcolor: activeHoverBgColor,
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(28, 28, 28, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? activeIconColor : '#5f5f5d',
                  }}
                >
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? activeTextColor : '#1c1c1c',
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
          <Divider sx={{ my: 1.5, borderColor: '#eceae4' }} />
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
            borderColor: '#eceae4',
            backgroundColor: '#f7f4ed',
            px: 1.5,
            py: 2,
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
            borderColor: '#eceae4',
            backgroundColor: '#ffffff',
            px: 1.5,
            py: 2,
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  )
}
