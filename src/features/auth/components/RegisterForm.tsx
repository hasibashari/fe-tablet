'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  MenuItem,
  Fade,
} from '@mui/material'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki')
  const [age, setAge] = useState<number | string>('30')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Mohon lengkapi Nama dan Email Anda.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await register({
        name,
        email,
        phone,
        gender,
        age: Number(age) || 30,
        password,
      })

      if (res.success && res.redirectTo) {
        setSuccess(true)
        setTimeout(() => {
          router.push(res.redirectTo || '/user/dashboard')
        }, 500)
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan akun.')
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '440px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
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
          Registrasi Pasien
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          Daftarkan diri Anda untuk memantau jadwal obat & rekam kepatuhan harian.
        </Typography>
      </Box>

      {errorMessage && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in>
          <Alert
            icon={<CheckCircle2 size={18} />}
            severity="success"
            sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}
          >
            Registrasi berhasil! Mengalihkan ke Dashboard Pasien...
          </Alert>
        </Fade>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nama Lengkap"
            placeholder="misal: Budi Santoso"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={18} className="text-muted" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Email"
            placeholder="email@example.com"
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Nomor WhatsApp"
              placeholder="0812xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              size="medium"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} className="text-muted" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Umur (Tahun)"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              fullWidth
              size="medium"
            />

            <TextField
              select
              label="Jenis Kelamin"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
              fullWidth
              size="medium"
            >
              <MenuItem value="Laki-laki">Laki-laki</MenuItem>
              <MenuItem value="Perempuan">Perempuan</MenuItem>
            </TextField>
          </Box>

          <TextField
            label="Kata Sandi"
            placeholder="Minimal 6 karakter"
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
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || success}
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
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </Box>
      </form>

      {/* Login Footer */}
      <Box sx={{ mt: 3.5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sudah memiliki akun?{' '}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Masuk ke Portal
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
