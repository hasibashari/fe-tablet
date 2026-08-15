'use client'

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material'

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
  confirmText = 'Hapus',
  cancelText = 'Batal',
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
