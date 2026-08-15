'use client'

import React, { useEffect, useState } from 'react'
import { getProfile } from '../api/getProfile'
import { updateUserProfileAction } from '../api/userRepository'
import { UserProfile } from '../types'
import { Mail, Phone, Calendar, Activity, User, Save, CheckCircle2 } from 'lucide-react'
import ProfileLayout from '@/src/shared/components/ProfileLayout'
import { useAuth } from '@/src/features/auth/context/AuthContext'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material'

export default function ProfileView() {
  const { user, updateUser } = useAuth()
  const userId = user?.id || 'usr_1'
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [openEditModal, setOpenEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    height: 170,
    weight: 70,
    bloodType: 'O+',
  })

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const data = await getProfile(userId)
      if (isMounted) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          height: data.height || 170,
          weight: data.weight || 70,
          bloodType: data.bloodType || 'O+',
        })
        setLoading(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [userId])

  const handleOpenEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        height: profile.height || 170,
        weight: profile.weight || 70,
        bloodType: profile.bloodType || 'O+',
      })
    }
    setOpenEditModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setSnackbar({ open: true, message: 'Nama dan Email wajib diisi.', severity: 'error' })
      return
    }

    setSaving(true)
    const res = await updateUserProfileAction(userId, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      height: Number(formData.height),
      weight: Number(formData.weight),
      bloodType: formData.bloodType,
    })

    if (res.success && res.profile) {
      setProfile(res.profile)
      if (updateUser) {
        updateUser({
          name: res.profile.name,
          email: res.profile.email,
          phone: res.profile.phone,
          bloodType: res.profile.bloodType,
        })
      }
      setSnackbar({ open: true, message: 'Profil berhasil diperbarui di database!', severity: 'success' })
      setOpenEditModal(false)
    } else {
      setSnackbar({ open: true, message: res.error || 'Gagal memperbarui profil', severity: 'error' })
    }
    setSaving(false)
  }

  if (loading || !profile) {
    return (
      <ProfileLayout
        title="Profil Saya"
        subtitle="Kelola informasi data diri dan metrik kesehatan Anda."
        name=""
        contactItems={[]}
        loading={true}
      />
    )
  }

  return (
    <>
      <ProfileLayout
        title="Profil Saya"
        subtitle="Kelola informasi data diri dan metrik kesehatan Anda."
        name={profile.name}
        avatarUrl={profile.avatar}
        badges={
          <>
            <Chip
              label="PASIEN"
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                borderRadius: 1,
              }}
            />
            <Chip
              icon={<CheckCircle2 size={13} style={{ color: '#16a34a' }} />}
              label="Terverifikasi"
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'success.light',
                color: 'success.dark',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </>
        }
        onEditClick={handleOpenEdit}
        contactItems={[
          { icon: Mail, label: 'Email', value: profile.email },
          { icon: Phone, label: 'Nomor Telepon', value: profile.phone },
          { icon: Calendar, label: 'Tanggal Lahir', value: profile.dateOfBirth },
        ]}
        metricsTitle="Metrik Kesehatan"
        metrics={[
          {
            label: 'Golongan Darah',
            value: profile.bloodType,
            subtitle: 'Tipe Darah Terdaftar',
            icon: Activity,
            iconBgColor: 'error.light',
            iconColor: 'error.dark',
          },
          {
            label: 'Tinggi Badan',
            value: `${profile.height} cm`,
            subtitle: 'Pengukuran Terakhir',
            icon: User,
            iconBgColor: 'info.light',
            iconColor: 'info.dark',
          },
          {
            label: 'Berat Badan',
            value: `${profile.weight} kg`,
            subtitle: 'Pengukuran Terakhir',
            icon: Activity,
            iconBgColor: 'success.light',
            iconColor: 'success.dark',
          },
        ]}
      />

      {/* Edit Profile Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Data Pribadi & Kesehatan</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2.5}>
            {/* Nama Lengkap */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contoh@email.com"
                required
              />
            </Grid>

            {/* Nomor Telepon */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nomor Telepon / HP"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </Grid>

            {/* Tanggal Lahir */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tanggal Lahir"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* Golongan Darah */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Golongan Darah"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                  <MenuItem key={bt} value={bt}>
                    {bt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tinggi Badan */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tinggi (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </Grid>

            {/* Berat Badan */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Berat (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit" disabled={saving}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<Save size={16} />}
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
