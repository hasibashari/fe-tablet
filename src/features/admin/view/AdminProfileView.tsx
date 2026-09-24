'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { Mail, Phone, Shield, Building, CheckCircle2, Award } from 'lucide-react';
import ProfileLayout from '@/src/shared/components/ProfileLayout';
import { useAuth } from '@/src/features/auth';

export default function AdminProfileView() {
  const { user } = useAuth();

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'dr. Sarah Jenkins, Sp.GK',
    email: user?.email || 'admin@medicore.com',
    phone: user?.phone || '+62 811-2233-4455',
    title: user?.schoolOrOrg || 'Fasilitator Kesehatan UKS',
    department: 'Manajemen Program TTD & Anemia Remaja',
    clinicName: 'Fe-Tablet Puskesmas / UKS Sekolah',
    roleLabel: 'Administrator',
  });

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [toastOpen, setToastOpen] = useState(false);

  const handleOpenEdit = () => {
    setEditForm(profileData);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    setProfileData(editForm);
    setEditOpen(false);
    setToastOpen(true);
  };

  return (
    <ProfileLayout
      title='Profil Admin'
      subtitle='Informasi identitas, kontak dinas, serta kredensial akun administrator sistem.'
      name={profileData.name}
      avatarUrl={user?.avatarUrl}
      badges={
        <>
          <Chip
            label='ADMINISTRATOR'
            size='small'
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
            label='Terverifikasi'
            size='small'
            variant='outlined'
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
        { icon: Phone, label: 'Nomor Telepon', value: profileData.phone },
        { icon: Building, label: 'Unit Kerja', value: profileData.department },
      ]}
      metricsTitle='Kredensial & Hak Akses'
      metrics={[
        {
          label: 'Hak Akses',
          value: 'Full Control',
          subtitle: 'Pengguna, Obat, Jadwal, Laporan',
          icon: Shield,
          iconBgColor: 'primary.light',
          iconColor: 'primary.dark',
        },
        {
          label: 'Sistem Pengelola',
          value: 'MediCore Central',
          subtitle: 'Portal Manajemen Terpadu',
          icon: Building,
          iconBgColor: 'success.light',
          iconColor: 'success.dark',
        },
        {
          label: 'Status Akun',
          value: 'Aktif & Valid',
          subtitle: 'Role Administrator Tunggal',
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
        maxWidth='sm'
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
              label='Nama Lengkap Administrator'
              fullWidth
              size='small'
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              label='Email Kedinasan'
              fullWidth
              size='small'
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            />
            <TextField
              label='Nomor Telepon / WhatsApp'
              fullWidth
              size='small'
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <TextField
              label='Jabatan & Peran'
              fullWidth
              size='small'
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            />
            <TextField
              label='Unit / Divisi Kerja'
              fullWidth
              size='small'
              value={editForm.department}
              onChange={e => setEditForm({ ...editForm, department: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} color='inherit'>
            Batal
          </Button>
          <Button onClick={handleSaveEdit} variant='contained' sx={{ px: 3 }}>
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
        <Alert severity='success' variant='filled' onClose={() => setToastOpen(false)}>
          Profil admin berhasil diperbarui!
        </Alert>
      </Snackbar>
    </ProfileLayout>
  );
}
