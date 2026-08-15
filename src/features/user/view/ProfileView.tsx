'use client'

import React, { useEffect, useState } from 'react'
import { getProfile } from '../api/getProfile'
import { updateUserProfileAction } from '../api/userRepository'
import { UserProfile } from '../types'
import { Mail, Phone, Calendar, Activity, User, Save } from 'lucide-react'
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
} from '@mui/material'

export default function ProfileView() {
  const { user } = useAuth()
  const userId = user?.id || 'usr_1'
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [openEditModal, setOpenEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
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
          phone: data.phone || '',
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
        phone: profile.phone || '',
        height: profile.height || 170,
        weight: profile.weight || 70,
        bloodType: profile.bloodType || 'O+',
      })
    }
    setOpenEditModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await updateUserProfileAction(userId, {
      phone: formData.phone,
      height: Number(formData.height),
      weight: Number(formData.weight),
      bloodType: formData.bloodType,
    })

    if (res.success && res.profile) {
      setProfile(res.profile)
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
        title="My Profile"
        subtitle="Manage your personal information and health data."
        name=""
        contactItems={[]}
        loading={true}
      />
    )
  }

  return (
    <>
      <ProfileLayout
        title="My Profile"
        subtitle="Manage your personal information and health data."
        name={profile.name}
        avatarUrl={profile.avatar}
        onEditClick={handleOpenEdit}
        contactItems={[
          { icon: Mail, value: profile.email },
          { icon: Phone, value: profile.phone },
          { icon: Calendar, value: `Born ${profile.dateOfBirth}` },
        ]}
        metricsTitle="Health Metrics"
        metrics={[
          {
            label: 'Blood Type',
            value: profile.bloodType,
            icon: Activity,
            iconBgColor: 'error.light',
            iconColor: 'error.dark',
          },
          {
            label: 'Height',
            value: `${profile.height} cm`,
            icon: User,
            iconBgColor: 'info.light',
            iconColor: 'info.dark',
          },
          {
            label: 'Weight',
            value: `${profile.weight} kg`,
            icon: Activity,
            iconBgColor: 'success.light',
            iconColor: 'success.dark',
          },
        ]}
      />

      {/* Edit Profile Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Personal & Health Data</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Blood Type"
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<Save size={16} />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
