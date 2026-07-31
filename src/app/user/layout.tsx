import React from 'react'
import Sidebar from '../../shared/components/Sidebar'
import { Box } from '@mui/material'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--color-surface-soft, #f8fafc)' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, sm: 4, md: 5 },
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}


