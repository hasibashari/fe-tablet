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
}

export default function AppSidebar({
  navItems,
  brandTitle = 'MediCore',
  brandSubtitle = 'Portal',
  brandIcon: BrandIcon,
  brandHref = '/',
  badge,
  footerAction,
  activeBgColor = 'rgba(2, 132, 199, 0.1)',
  activeTextColor = '#0284c7',
  activeIconColor = '#0284c7',
  activeHoverBgColor = 'rgba(2, 132, 199, 0.15)',
  insetShadow,
  drawerWidth = 260,
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          px: 1.5,
          py: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0', px: 1 }}>
          <Box
            component={Link}
            href={brandHref}
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
                  borderRadius: '10px',
                  bgcolor: '#0284c7',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                <BrandIcon size={22} />
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
                  {brandTitle}
                </Typography>
                {badge}
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
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
                  selected={isActive}
                  sx={{
                    borderRadius: '8px',
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
                      bgcolor: '#f1f5f9',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? activeIconColor : '#64748b',
                    }}
                  >
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? activeTextColor : '#0f172a',
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
            <Divider sx={{ my: 1.5, borderColor: '#e2e8f0' }} />
            <Box sx={{ pt: 0.5 }}>{footerAction}</Box>
          </>
        )}
      </Box>
    </Drawer>
  )
}
