'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Mail,
  Phone,
  Shield,
  Building,
  CheckCircle2,
  FileCheck,
  Award,
} from 'lucide-react'
import ProfileLayout from '@/src/shared/components/ProfileLayout'
import { useAuth } from '@/src/features/auth'

export default function AdminProfileView() {
  const { user } = useAuth()

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Dr. Bambang Hernawan, Sp.PD',
    email: user?.email || 'admin@medicore.id',
    phone: user?.phone || '+62 812-3456-7890',
    title: user?.title || 'Dokter Spesialis Penyakit Dalam / Kepala Medis',
    sipNumber: '446/SIP.D/DS/Dinkes/2024',
    strNumber: '31.1.1.100.2.19.123456',
    sipExpiry: '31 Desember 2028',
    department: 'Instalasi Rawat Jalan & Farmakoterapi',
    clinicName: 'Klinik Pratama MediCore Pusat',
    roleLabel: 'Super Administrator / Dokter Penanggung Jawab',
  })

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(profileData)
  const [toastOpen, setToastOpen] = useState(false)

  const handleOpenEdit = () => {
    setEditForm(profileData)
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    setProfileData(editForm)
    setEditOpen(false)
    setToastOpen(true)
  }

  return (
    <ProfileLayout
      title="Profil Admin"
      subtitle="Informasi identitas tenaga medis, kontak dinas, serta kredensial akun administrator."
      name={profileData.name}
      avatarUrl={user?.avatar}
      badges={
        <>
          <Chip
            label="ADMINISTRATOR"
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
      secondaryText={`${profileData.title} • ${profileData.clinicName}`}
      onEditClick={handleOpenEdit}
      contactItems={[
        { icon: Mail, label: 'Email Dinas', value: profileData.email },
        { icon: Phone, label: 'Nomor WhatsApp', value: profileData.phone },
        { icon: FileCheck, label: 'Nomor SIP Aktif', value: profileData.sipNumber },
      ]}
      metricsTitle="Kredensial & Hak Akses"
      metrics={[
        {
          label: 'Hak Akses',
          value: 'Full Control',
          subtitle: 'Pasien, Obat, Jadwal, Laporan',
          icon: Shield,
          iconBgColor: 'primary.light',
          iconColor: 'primary.dark',
        },
        {
          label: 'Fasilitas Kesehatan',
          value: 'MediCore Pusat',
          subtitle: 'Klinik Pratama Rawat Jalan',
          icon: Building,
          iconBgColor: 'success.light',
          iconColor: 'success.dark',
        },
        {
          label: 'Legalitas Praktik',
          value: 'STR & SIP Valid',
          subtitle: `Hingga ${profileData.sipExpiry}`,
          icon: Award,
          iconBgColor: 'warning.light',
          iconColor: 'warning.dark',
        },
      ]}
    >
      {/* Edit Profile Dialog Modal */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Profil Admin</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nama Lengkap Beserta Gelar"
              fullWidth
              size="small"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              label="Email Kedinasan"
              fullWidth
              size="small"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <TextField
              label="Nomor Telepon / WhatsApp"
              fullWidth
              size="small"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <TextField
              label="Jabatan & Spesialisasi"
              fullWidth
              size="small"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <TextField
              label="Nomor SIP (Surat Izin Praktik)"
              fullWidth
              size="small"
              value={editForm.sipNumber}
              onChange={(e) => setEditForm({ ...editForm, sipNumber: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ px: 3 }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToastOpen(false)}>
          Profil admin berhasil diperbarui!
        </Alert>
      </Snackbar>
    </ProfileLayout>
  )
}
