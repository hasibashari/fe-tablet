'use client';

import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Breakpoint,
  IconButton,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';

export interface CrudModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSubmit: () => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  submitting?: boolean;
  maxWidth?: Breakpoint;
  children: ReactNode;
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            m: { xs: 1.5, sm: 3 },
            maxHeight: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 64px)' },
            borderRadius: { xs: 3, sm: 3 },
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {title}
        </Typography>
        <IconButton
          size='small'
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: 'text.secondary',
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>{children}</Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={onClose}
          color='inherit'
          disabled={submitting}
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
          onClick={onSubmit}
          variant='contained'
          disabled={submitting}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {submitting ? 'Menyimpan...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CrudModalDialog;
