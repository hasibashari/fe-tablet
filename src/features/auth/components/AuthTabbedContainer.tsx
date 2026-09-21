'use client'

import React, { useState } from 'react'
import { Box, Button, Typography, Fade } from '@mui/material'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export interface AuthTabbedContainerProps {
  initialTab?: 'login' | 'register'
}

export function AuthTabbedContainer({ initialTab = 'login' }: AuthTabbedContainerProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)

  return (
    <Box sx={{ width: '100%', maxWidth: '420px', mx: 'auto' }}>
      {/* Tab Switcher Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, position: 'relative' }}>
        <Button
          onClick={() => setActiveTab('login')}
          disableRipple
          sx={{
            p: 0,
            pb: 1,
            minWidth: 0,
            textTransform: 'none',
            fontSize: '1.45rem',
            fontWeight: activeTab === 'login' ? 800 : 600,
            color: activeTab === 'login' ? 'text.primary' : '#94a3b8',
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'transparent',
              color: activeTab === 'login' ? 'text.primary' : '#64748b',
            },
            '&::after': activeTab === 'login' ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              bgcolor: '#e11d48',
              borderRadius: '2px',
            } : undefined,
          }}
        >
          Masuk
        </Button>

        <Button
          onClick={() => setActiveTab('register')}
          disableRipple
          sx={{
            p: 0,
            pb: 1,
            minWidth: 0,
            textTransform: 'none',
            fontSize: '1.45rem',
            fontWeight: activeTab === 'register' ? 800 : 600,
            color: activeTab === 'register' ? 'text.primary' : '#94a3b8',
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'transparent',
              color: activeTab === 'register' ? 'text.primary' : '#64748b',
            },
            '&::after': activeTab === 'register' ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              bgcolor: '#e11d48',
              borderRadius: '2px',
            } : undefined,
          }}
        >
          Daftar
        </Button>
      </Box>

      {/* Subtitle / Context Hint */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '0.9rem', mb: 3.5, mt: -2, lineHeight: 1.5 }}
      >
        {activeTab === 'login'
          ? 'Selamat datang kembali! Masuk untuk memantau konsumsi TTD-mu.'
          : 'Lengkapi data dirimu untuk mulai hidup bebas anemia bersama Fe-Tablet.'}
      </Typography>

      {/* Form Content with Smooth Fade */}
      {activeTab === 'login' ? (
        <Fade in timeout={300}>
          <Box>
            <LoginForm onSwitchTab={() => setActiveTab('register')} hideHeader />
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={300}>
          <Box>
            <RegisterForm onSwitchTab={() => setActiveTab('login')} hideHeader />
          </Box>
        </Fade>
      )}
    </Box>
  )
}

export default AuthTabbedContainer
