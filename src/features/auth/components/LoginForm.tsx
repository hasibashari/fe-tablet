'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Chip,
  Fade,
} from '@mui/material'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEMO_ACCOUNTS } from '../api/mockAuthData'
import { UserRole } from '../types/auth.types'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  const { login, quickLogin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRoleHint, setSelectedRoleHint] = useState<UserRole>('admin')
  const [loading, setLoading] = useState(false)
  const [quickLoadingRole, setQuickLoadingRole] = useState<UserRole | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successRole, setSuccessRole] = useState<string | null>(null)

  const handleSelectDemo = (demoEmail: string, demoPass: string, role: UserRole) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setSelectedRoleHint(role)
    setErrorMessage(null)
  }

  const handleQuickLogin = async (role: UserRole) => {
    setQuickLoadingRole(role)
    setErrorMessage(null)
    try {
      const res = await quickLogin(role)
      if (res.success) {
        setSuccessRole(role === 'admin' ? 'Admin / Dokter' : 'Pasien')
        const target = redirectParam || res.redirectTo
        setTimeout(() => {
          router.push(target)
        }, 400)
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat masuk. Silakan coba lagi.')
    } finally {
      setQuickLoadingRole(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan email Anda.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await login({
        email,
        password,
        roleHint: selectedRoleHint,
      })

      if (res.success && res.redirectTo) {
        const target = redirectParam || res.redirectTo
        setSuccessRole(res.redirectTo.includes('admin') ? 'Admin / Dokter' : 'Pasien')
        setTimeout(() => {
          router.push(target)
        }, 400)
      } else {
        setErrorMessage(res.error || 'Email atau kata sandi tidak cocok.')
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '440px', mx: 'auto' }}>
      {/* Header Form */}
      <Box sx={{ mb: 3.5, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.03em',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            mb: 1,
          }}
        >
          Masuk ke Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          Pilih akun demo atau masukkan kredensial akun Anda.
        </Typography>
      </Box>

      {/* Quick Demo Switcher Cards */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sparkles size={16} className="text-primary" />
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'primary.dark', letterSpacing: '0.05em' }}>
              Akses Cepat Demo (1-Klik)
            </Typography>
          </Box>
          <Chip label="Mock Data" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'primary.light', color: 'primary.dark' }} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {DEMO_ACCOUNTS.map((demo) => {
            const isSelected = email === demo.email
            const isDemoLoading = quickLoadingRole === demo.role
            const Icon = demo.role === 'admin' ? ShieldCheck : User

            return (
              <Paper
                key={demo.role}
                elevation={0}
                onClick={() => handleSelectDemo(demo.email, demo.password, demo.role)}
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'rgba(14, 165, 233, 0.04)' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      bgcolor: demo.role === 'admin' ? 'primary.light' : 'success.50',
                      color: demo.role === 'admin' ? 'primary.dark' : 'success.main',
                      display: 'flex',
                    }}
                  >
                    <Icon size={16} />
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    disabled={isDemoLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickLogin(demo.role)
                    }}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      p: '2px 8px',
                      minWidth: 0,
                      borderRadius: 9999,
                      color: demo.role === 'admin' ? 'primary.main' : 'success.main',
                      bgcolor: demo.role === 'admin' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      '&:hover': {
                        bgcolor: demo.role === 'admin' ? 'primary.main' : 'success.main',
                        color: 'white',
                      },
                    }}
                  >
                    {isDemoLoading ? <CircularProgress size={12} color="inherit" /> : 'Masuk ➔'}
                  </Button>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>
                  {demo.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontSize: '0.72rem', lineHeight: 1.2 }}>
                  {demo.role === 'admin' ? 'Ke /admin/dashboard' : 'Ke /user/dashboard'}
                </Typography>
              </Paper>
            )
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 500 }}>
          atau isi manual
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      {/* Error & Success Feedback */}
      {errorMessage && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Fade>
      )}

      {successRole && (
        <Fade in>
          <Alert
            icon={<CheckCircle2 size={18} />}
            severity="success"
            sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}
          >
            Berhasil masuk sebagai <strong>{successRole}</strong>. Mengalihkan ke dashboard...
          </Alert>
        </Fade>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email Akun"
            placeholder="admin@medicore.com atau budi@medicore.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} className="text-muted" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Kata Sandi"
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} className="text-muted" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Password demo: <code>password123</code>
            </Typography>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                alert('Silakan gunakan kredensial demo yang disediakan di tombol atas.')
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              Lupa sandi?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || Boolean(quickLoadingRole)}
            sx={{
              py: 1.5,
              mt: 1.5,
              fontSize: '0.98rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </Box>
      </form>

      {/* Register Footer */}
      <Box sx={{ mt: 3.5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Belum memiliki akun pasien?{' '}
          <Link
            href="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            Daftar Pasien Baru
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
