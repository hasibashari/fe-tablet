'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material'
import { Search, Bell, User, LogOut, Settings } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openProfile = Boolean(anchorEl)

  const handleClickProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseProfile = () => {
    setAnchorEl(null)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2,
        mb: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Title & Hierarchy Section */}
      <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.15rem', sm: '1.25rem' },
            letterSpacing: '-0.4px',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mt: 0.25,
              fontWeight: 400,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: 260, sm: 480, md: 600 },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Aligned Right Controls (Balanced 36px Height Row) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        {/* Compact, Non-Dominant Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 1.25,
            height: 36,
            width: { xs: 130, sm: 170, md: 200 },
            transition: 'all 0.2s ease',
            '&:focus-within': {
              bgcolor: 'background.paper',
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(2, 132, 199, 0.12)',
              width: { xs: 160, sm: 200, md: 240 },
            },
          }}
        >
          <Search size={15} style={{ color: 'inherit' }} />
          <InputBase
            placeholder="Cari..."
            sx={{ ml: 0.75, flex: 1, color: 'text.primary' }}
          />
          <Chip
            label="⌘K"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              borderRadius: 0.5,
              px: 0.25,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
        </Box>

        {/* Notifications Icon Button */}
        <IconButton
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 0,
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Badge badgeContent={3} color="primary" variant="dot">
            <Bell size={18} />
          </Badge>
        </IconButton>

        {/* Profile Button */}
        <IconButton
          onClick={handleClickProfile}
          sx={{
            p: 0,
            border: '2px solid transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            AD
          </Avatar>
        </IconButton>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={openProfile}
          onClose={handleCloseProfile}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                borderRadius: 1,
                mt: 1,
                minWidth: 180,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              },
            },
          }}
        >
          <MenuItem onClick={handleCloseProfile} sx={{ color: 'text.primary' }}>
            <ListItemIcon sx={{ color: 'primary.main' }}>
              <User size={16} />
            </ListItemIcon>
            Profil Admin
          </MenuItem>
          <MenuItem onClick={handleCloseProfile} sx={{ color: 'text.primary' }}>
            <ListItemIcon sx={{ color: 'primary.main' }}>
              <Settings size={16} />
            </ListItemIcon>
            Pengaturan Sistem
          </MenuItem>
          <Divider sx={{ my: 0.5, borderColor: 'divider' }} />
          <MenuItem onClick={handleCloseProfile} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogOut size={16} />
            </ListItemIcon>
            Keluar
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}

