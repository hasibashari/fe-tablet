'use client'

import React, { Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { AuthTabbedContainer } from '../components/AuthTabbedContainer'

export function LoginView() {
  return (
    <AuthCardLayout>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        }
      >
        <AuthTabbedContainer initialTab="login" />
      </Suspense>
    </AuthCardLayout>
  )
}

export default LoginView
