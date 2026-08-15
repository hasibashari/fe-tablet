'use client'

import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Breakpoint,
} from '@mui/material'

export interface CrudModalDialogProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  onSubmit: () => void | Promise<void>
  submitText?: string
  cancelText?: string
  submitting?: boolean
  maxWidth?: Breakpoint
  children: ReactNode
}

export function CrudModalDialog({
  open,
  onClose,
  title,
  onSubmit,
  submitText = 'Simpan Perubahan',
  cancelText = 'Batal',
  submitting = false,
  maxWidth = 'sm',
  children,
}: CrudModalDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          {cancelText}
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CrudModalDialog
