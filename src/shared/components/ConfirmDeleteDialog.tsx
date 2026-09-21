'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmDeleteDialogProps {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.',
  confirmText = 'Hapus Permanen',
  cancelText = 'Batal',
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            m: { xs: 2, sm: 3 },
            borderRadius: 3,
            p: { xs: 1, sm: 1.5 },
          },
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 3, pb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#fff1f2',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <AlertTriangle size={28} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          pt: 0,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: '#e11d48',
            '&:hover': { bgcolor: '#be123c' },
          }}
        >
          {loading ? 'Menghapus...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialog

