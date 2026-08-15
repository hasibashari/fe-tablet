'use client'

import React from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

export interface ToastFeedbackProps {
  open: boolean
  message: string
  severity?: AlertColor
  onClose: () => void
  autoHideDuration?: number
}

export function ToastFeedback({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 4000,
}: ToastFeedbackProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default ToastFeedback
