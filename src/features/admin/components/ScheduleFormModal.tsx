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
import { DAYS_OF_WEEK } from '@/src/shared/constants/domain.constants';
import {
  SCHEDULE_CATEGORIES,
  FREQUENCY_OPTIONS,
  CATEGORY_PRESETS,
  ScheduleFormData,
  ScheduleCategory,
  ScheduleFrequency,
} from '../constants/schedule.constants';
import { PatientUser } from '../types/admin.types';

interface ScheduleFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: ScheduleFormData;
  patients: PatientUser[];
  submitting: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateFormData: (updates: Partial<ScheduleFormData>) => void;
}

export default function ScheduleFormModal({
  open,
  editingId,
  formData,
  patients,
  submitting,
  onClose,
  onSave,
  onUpdateFormData,
}: ScheduleFormModalProps) {
  const handleCategoryChange = (cat: ScheduleCategory) => {
    const preset = CATEGORY_PRESETS[cat] || CATEGORY_PRESETS['TTD Rutin'];
    onUpdateFormData({
      category: cat,
      frequency: preset.frequency,
      medicationName: preset.medicationName,
      instructions: preset.instructions,
    });
  };

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Jadwal Obat & Terapi' : 'Buat Jadwal TTD Baru'}
      onSubmit={onSave}
      submitText={editingId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
      submitting={submitting}
    >
      <FormControl fullWidth size='small'>
        <InputLabel>Pasien (Siswi)</InputLabel>
        <Select
          value={formData.patientId}
          label='Pasien (Siswi)'
          onChange={e => onUpdateFormData({ patientId: e.target.value })}
        >
          {patients.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} ({p.schoolOrOrg || p.id})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size='small'>
        <InputLabel>Kategori Program</InputLabel>
        <Select
          value={formData.category}
          label='Kategori Program'
          onChange={e => handleCategoryChange(e.target.value as ScheduleCategory)}
        >
          {SCHEDULE_CATEGORIES.map(cat => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label='Nama Obat / Suplemen'
        fullWidth
        size='small'
        value={formData.medicationName}
        onChange={e => onUpdateFormData({ medicationName: e.target.value })}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Dosis'
            fullWidth
            size='small'
            value={formData.dosage}
            onChange={e => onUpdateFormData({ dosage: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>Frekuensi</InputLabel>
            <Select
              value={formData.frequency}
              label='Frekuensi'
              onChange={e =>
                onUpdateFormData({
                  frequency: e.target.value as ScheduleFrequency,
                })
              }
            >
              {FREQUENCY_OPTIONS.map(opt => (
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
          <FormControl fullWidth size='small'>
            <InputLabel>Hari Minum</InputLabel>
            <Select
              value={formData.dayOfWeek}
              label='Hari Minum'
              onChange={e => onUpdateFormData({ dayOfWeek: e.target.value })}
            >
              {DAYS_OF_WEEK.map(day => (
                <MenuItem key={day} value={day}>
                  {day === 'Sabtu' ? 'Sabtu (Standar)' : day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label='Jam Pengingat (HH:MM)'
            fullWidth
            size='small'
            placeholder='08:00'
            value={formData.timeSlot}
            onChange={e => onUpdateFormData({ timeSlot: e.target.value })}
          />
        </Grid>
      </Grid>

      <TextField
        label='Petunjuk Khusus Penggunaan'
        multiline
        rows={2}
        fullWidth
        size='small'
        value={formData.instructions}
        onChange={e => onUpdateFormData({ instructions: e.target.value })}
      />
    </CrudModalDialog>
  );
}
