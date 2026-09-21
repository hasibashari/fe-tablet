'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

export interface LoginFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function LoginForm({ hideHeader = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleHint] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan email Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({
        email,
        password,
        roleHint: selectedRoleHint,
      });

      if (res.success && res.redirectTo) {
        const target = redirectParam || res.redirectTo;
        setSuccessRole(res.redirectTo.includes('admin') ? 'Administrator' : 'User / Pasien');
        setTimeout(() => {
          router.push(target);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Email atau kata sandi tidak cocok.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Optional Header Form if not in tabbed container */}
      {!hideHeader && (
        <Box sx={{ mb: 3.5, textAlign: 'left' }}>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.025em',
              fontSize: { xs: '1.65rem', sm: '1.85rem' },
              mb: 1,
            }}
          >
            Masuk
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontSize: '0.92rem', lineHeight: 1.5 }}
          >
            Masukkan kredensial akun Anda untuk mengakses layanan.
          </Typography>
        </Box>
      )}

      {/* Error & Success Feedback */}
      {errorMessage && (
        <Fade in>
          <Alert
            severity='error'
            sx={{ mb: 2.5, borderRadius: '16px', fontSize: '0.85rem' }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        </Fade>
      )}

      {successRole && (
        <Fade in>
          <Alert
            icon={<CheckCircle2 size={18} />}
            severity='success'
            sx={{ mb: 2.5, borderRadius: '16px', fontSize: '0.85rem' }}
          >
            Berhasil masuk sebagai <strong>{successRole}</strong>. Mengalihkan...
          </Alert>
        </Fade>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* Email Field with Pill Styling */}
          <TextField
            placeholder='Email atau nomor telepon'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            size='medium'
            autoComplete='email'
            slotProps={{
              input: {
                sx: {
                  borderRadius: '9999px',
                  bgcolor: '#ffffff',
                  pl: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#cc785c',
                    borderWidth: '1.5px',
                  },
                },
                startAdornment: (
                  <InputAdornment position='start'>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'rgba(204, 120, 92, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 0.5,
                      }}
                    >
                      <Mail size={16} color='#cc785c' />
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Password Field with Pill Styling */}
          <TextField
            placeholder='Kata Sandi'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            size='medium'
            autoComplete='current-password'
            slotProps={{
              input: {
                sx: {
                  borderRadius: '9999px',
                  bgcolor: '#ffffff',
                  pl: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#cc785c',
                    borderWidth: '1.5px',
                  },
                },
                startAdornment: (
                  <InputAdornment position='start'>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'rgba(204, 120, 92, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 0.5,
                      }}
                    >
                      <Lock size={16} color='#cc785c' />
                    </Box>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ pr: 1 }}>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                      size='small'
                      aria-label='toggle password visibility'
                    >
                      {showPassword ? (
                        <EyeOff size={18} color='#94a3b8' />
                      ) : (
                        <Eye size={18} color='#94a3b8' />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Balanced Action Row: Forgot Password & Pill Submit Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Link
              href='#'
              onClick={e => {
                e.preventDefault();
                alert('Silakan hubungi administrator sistem untuk mereset kata sandi Anda.');
              }}
              className='text-xs text-slate-500 hover:text-[#cc785c] font-medium transition-colors'
            >
              Lupa kata sandi?
            </Link>

            <Button
              type='submit'
              variant='contained'
              disabled={loading}
              sx={{
                py: 1.25,
                px: 3.5,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '9999px',
                bgcolor: '#cc785c',
                color: '#ffffff',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 4px 14px rgba(204, 120, 92, 0.35)',
                '&:hover': {
                  bgcolor: '#a9583e',
                  boxShadow: '0 6px 20px rgba(204, 120, 92, 0.45)',
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={18} color='inherit' />
                  <span>Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}

export default LoginForm;
