'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import {
  GENDER_OPTIONS,
  RISK_LEVEL_OPTIONS,
  PatientFormData,
  UserGender,
  RiskLevel,
} from '../constants/user.constants';

interface UserFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: PatientFormData;
  submitting: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateFormData: (updates: Partial<PatientFormData>) => void;
}

export default function UserFormModal({
  open,
  editingId,
  formData,
  submitting,
  onClose,
  onSave,
  onUpdateFormData,
}: UserFormModalProps) {
  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Data Siswi / Pengguna' : 'Tambah Siswi Baru'}
      onSubmit={onSave}
      submitText={editingId ? 'Simpan Perubahan' : 'Tambah Siswi'}
      submitting={submitting}
    >
      <TextField
        label='Nama Lengkap Siswi'
        fullWidth
        size='small'
        value={formData.name}
        onChange={e => onUpdateFormData({ name: e.target.value })}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Usia (Tahun)'
            type='number'
            fullWidth
            size='small'
            value={formData.age}
            onChange={e => onUpdateFormData({ age: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>Jenis Kelamin</InputLabel>
            <Select
              value={formData.gender}
              label='Jenis Kelamin'
              onChange={e =>
                onUpdateFormData({ gender: e.target.value as UserGender })
              }
            >
              {GENDER_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Nomor WhatsApp'
            fullWidth
            size='small'
            value={formData.phone}
            onChange={e => onUpdateFormData({ phone: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Alamat Email'
            fullWidth
            size='small'
            value={formData.email}
            onChange={e => onUpdateFormData({ email: e.target.value })}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>Tingkat Risiko</InputLabel>
            <Select
              value={formData.riskLevel}
              label='Tingkat Risiko'
              onChange={e =>
                onUpdateFormData({ riskLevel: e.target.value as RiskLevel })
              }
            >
              {RISK_LEVEL_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Sekolah / Kelas / Instansi'
            fullWidth
            size='small'
            value={formData.assignedDoctor}
            onChange={e => onUpdateFormData({ assignedDoctor: e.target.value })}
          />
        </Grid>
      </Grid>

      <TextField
        label='Catatan Kesehatan (Kadar Hb / Riwayat)'
        multiline
        rows={3}
        fullWidth
        size='small'
        value={formData.medicalNotes}
        onChange={e => onUpdateFormData({ medicalNotes: e.target.value })}
      />
    </CrudModalDialog>
  );
}
