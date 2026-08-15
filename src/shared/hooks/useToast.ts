'use client'

import { useState, useCallback } from 'react'
import { AlertColor } from '@mui/material'

export function useToast() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<AlertColor>('success')

  const showToast = useCallback((msg: string, sev: AlertColor = 'success') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }, [])

  const hideToast = useCallback(() => {
    setOpen(false)
  }, [])

  return {
    open,
    message,
    severity,
    showToast,
    hideToast,
  }
}

export default useToast
