import React from 'react'
import { Box } from '@mui/material'
import { AdminSidebar } from '@/src/features/admin'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%', md: 'calc(100% - 260px)' },
          p: { xs: 3, sm: 4, md: 5 },
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ maxWidth: '1400px', width: '100%', mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
