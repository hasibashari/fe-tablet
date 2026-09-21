'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export interface RegisterFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function RegisterForm({ onSwitchTab, hideHeader = false }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await register({
        email: email.trim(),
        password,
      });

      if (res.success && res.redirectTo) {
        setSuccess(true);
        setTimeout(() => {
          router.push(res.redirectTo || '/user/dashboard');
        }, 500);
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan akun. Silakan coba lagi.');
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
            Daftar Akun
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontSize: '0.92rem', lineHeight: 1.5 }}
          >
            Mulai pantau jadwal obat & rekam kesehatan harian Anda.
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

      {success && (
        <Fade in>
          <Alert
            icon={<CheckCircle2 size={18} />}
            severity='success'
            sx={{ mb: 2.5, borderRadius: '16px', fontSize: '0.85rem' }}
          >
            Pendaftaran berhasil! Mengalihkan ke Dashboard...
          </Alert>
        </Fade>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* Email Field */}
          <TextField
            placeholder='Alamat Email Aktif'
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

          {/* Password Field */}
          <TextField
            placeholder='Kata Sandi (Minimal 6 karakter)'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            size='medium'
            autoComplete='new-password'
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

          {/* Confirm Password Field */}
          <TextField
            placeholder='Ketik Ulang Kata Sandi'
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            fullWidth
            size='medium'
            autoComplete='new-password'
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge='end'
                      size='small'
                      aria-label='toggle confirm password visibility'
                    >
                      {showConfirmPassword ? (
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

          {/* Action Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: 1,
            }}
          >
            <Button
              type='submit'
              variant='contained'
              disabled={loading || success}
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
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
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

export default RegisterForm;
