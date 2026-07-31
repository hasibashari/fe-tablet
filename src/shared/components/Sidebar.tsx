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
import { LayoutDashboard, Calendar, History, User, LogOut, BookOpen, Cross } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/user/schedule', icon: Calendar },
  { name: 'History', href: '/user/history', icon: History },
  { name: 'Education', href: '/user/education', icon: BookOpen },
  { name: 'Profile', href: '/user/profile', icon: User },
]

const drawerWidth = 256

interface SidebarProps {
  header?: React.ReactNode
  title?: string
  subtitle?: string
}

export default function Sidebar({ header, title, subtitle }: SidebarProps = {}) {
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
          borderColor: 'var(--color-hairline, #e2e8f0)',
          backgroundColor: '#ffffff',
          px: 1.5,
          py: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        {header ? (
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>
            {header}
          </Box>
        ) : (
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>
            <Box
              component={Link}
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Cross size={20} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {title || (
                    <>
                      Medi<Box component="span" sx={{ color: 'primary.main' }}>Core</Box>
                    </>
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {subtitle || 'Patient Portal'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

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
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(2, 132, 199, 0.1)',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(2, 132, 199, 0.15)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? 'primary.main' : 'text.secondary',
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
                          color: isActive ? 'primary.main' : 'text.primary',
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

        <Divider sx={{ my: 1 }} />

        {/* Sign Out Button */}
        <Box sx={{ pt: 1 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
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
        </Box>

      </Box>
    </Drawer>
  )
}


