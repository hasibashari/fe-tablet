'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, UserPlus, BellRing, Edit, Trash2, Phone, User, Activity } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import UserFormModal from '../components/UserFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getPatientsAction,
  createPatientAction,
  updatePatientAction,
  deletePatientAction,
  sendPatientReminderAction,
} from '../api/patientRepository';
import { PatientUser } from '../types/admin.types';
import {
  INITIAL_PATIENT_FORM_DATA,
  PatientFormData,
  RISK_LEVEL_OPTIONS,
  RISK_LEVEL_COLORS,
  RiskLevel,
  UserGender,
} from '../constants/user.constants';

export default function UserManagementView() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('Semua');
  const [submitting, setSubmitting] = useState(false);

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<PatientFormData>(INITIAL_PATIENT_FORM_DATA);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: patientToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    patientId?: string;
    patientName: string;
    patientPhone?: string;
  }>({
    patientName: '',
  });

  const loadPatients = useCallback(async () => {
    const data = await getPatientsAction();
    setPatients(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPatients = async () => {
      const data = await getPatientsAction();
      if (isMounted) setPatients(data);
    };
    fetchPatients();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchPatients();
      }
    }, 8000);

    const handleFocus = () => {
      fetchPatients();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    const matchesRisk = riskFilter === 'Semua' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const onOpenAdd = () => {
    handleOpenAdd();
  };

  const onOpenEdit = (patient: PatientUser) => {
    handleOpenEdit(patient.id, {
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender as UserGender,
      phone: patient.phone,
      email: patient.email || '',
      riskLevel: (patient.riskLevel as RiskLevel) || 'Rendah',
      assignedDoctor: patient.schoolOrOrg || 'SMA Negeri 1 Sehat',
      medicalNotes: patient.medicalNotes || '',
    });
  };

  const handleSavePatient = async () => {
    if (!formData.name || !formData.phone) {
      showToast('Nama dan nomor telepon wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updatePatientAction(editingId, {
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.assignedDoctor,
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadPatients();
          handleCloseModal();
          showToast('Data siswi berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui data', 'error');
        }
      } else {
        const res = await createPatientAction({
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          riskLevel: formData.riskLevel,
          assignedDoctor: formData.assignedDoctor || 'SMA Negeri 1 Sehat',
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadPatients();
          handleCloseModal();
          showToast('Siswi baru berhasil ditambahkan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan siswi', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      const res = await deletePatientAction(patientToDelete);
      if (res.success) {
        await loadPatients();
        showToast('Data siswi berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus data siswi', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (patient: PatientUser) => {
    setReminderData({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
    });
    setReminderModalOpen(true);
  };

  const handleSendReminderSuccess = async (_channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.patientId) {
      await sendPatientReminderAction(reminderData.patientId, messageSent);
      await loadPatients();
    }
  };

  const columns: Column<PatientUser>[] = [
    {
      id: 'patient',
      label: 'Siswi (Pengguna)',
      width: '24%',
      renderCell: patient => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={patient.avatarUrl}
            alt={patient.name}
            sx={{ width: 38, height: 38, border: '1px solid #fce7f3' }}
          >
            {patient.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {patient.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {patient.id} • {patient.age} th ({patient.gender.charAt(0)})
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'school',
      label: 'Sekolah / Kelas',
      width: '18%',
      renderCell: patient => (
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {patient.schoolOrOrg || 'SMA Negeri 1 Sehat'}
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Phone size={12} /> {patient.phone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'riskLevel',
      label: 'Tingkat Risiko',
      width: '14%',
      renderCell: patient => {
        const style = RISK_LEVEL_COLORS[patient.riskLevel] || RISK_LEVEL_COLORS.default;
        return (
          <Chip
            label={patient.riskLevel}
            size='small'
            sx={{
              bgcolor: style.bg,
              color: style.text,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
              borderRadius: 1,
            }}
          />
        );
      },
    },
    {
      id: 'adherence',
      label: 'Kepatuhan TTD',
      width: '16%',
      renderCell: patient => {
        const rate = patient.adherenceRate ?? 100;
        const color = rate >= 90 ? '#10b981' : rate >= 80 ? '#f59e0b' : '#e11d48';
        return (
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 700, color }}>
              {rate}%
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {patient.activeSchedulesCount || 0} Jadwal Aktif
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      width: '12%',
      renderCell: patient => (
        <Chip
          label={patient.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
          size='small'
          color={patient.status === 'Aktif' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '16%',
      renderCell: patient => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title='Kirim Pengingat'>
            <IconButton size='small' color='primary' onClick={() => handleOpenReminder(patient)}>
              <BellRing size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit Siswi'>
            <IconButton size='small' onClick={() => onOpenEdit(patient)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Hapus Siswi'>
            <IconButton size='small' color='error' onClick={() => handleDeleteRequest(patient.id)}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminHeader
        title='Manajemen Siswi (Pengguna)'
        subtitle='Pantau data kesehatan siswi, riwayat kepatuhan TTD, dan kirim pengingat langsung.'
      />

      {/* Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box
            sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, flex: 1 }}
          >
            <TextField
              placeholder='Cari nama, ID siswi, atau no hp...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size='small'
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search size={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <Select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                <MenuItem value='Semua'>Semua Risiko</MenuItem>
                {RISK_LEVEL_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant='contained'
            startIcon={<UserPlus size={18} />}
            onClick={onOpenAdd}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Tambah Siswi
          </Button>
        </Box>
      </Card>

      {/* Patients Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        emptyMessage='Tidak ada siswi yang ditemukan.'
        renderMobileCard={patient => {
          const style = RISK_LEVEL_COLORS[patient.riskLevel] || RISK_LEVEL_COLORS.default;
          return (
            <Card
              sx={{
                p: 2,
                borderRadius: '16px',
                border: '1px solid #fce7f3',
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* Header: Avatar + Name + Risk */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Avatar
                    src={patient.avatarUrl}
                    alt={patient.name}
                    sx={{ width: 40, height: 40, border: '1.5px solid #fce7f3' }}
                  >
                    {patient.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}
                    >
                      {patient.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {patient.id} • {patient.age} th ({patient.gender.charAt(0)})
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={patient.riskLevel}
                  size='small'
                  sx={{
                    bgcolor: style.bg,
                    color: style.text,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                  }}
                />
              </Box>

              {/* Info Row: Phone + Schedules + Adherence */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: '#fff5f7',
                  border: '1px solid #fce7f3',
                }}
              >
                <Box>
                  <Typography
                    variant='caption'
                    sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}
                  >
                    Kontak Telepon
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.78rem' }}
                  >
                    {patient.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant='caption'
                    sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}
                  >
                    Kepatuhan Minum TTD
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color:
                        patient.adherenceRate >= 90
                          ? '#10b981'
                          : patient.adherenceRate >= 80
                            ? '#f59e0b'
                            : '#e11d48',
                    }}
                  >
                    {patient.adherenceRate}% ({patient.activeSchedulesCount} Jadwal)
                  </Typography>
                </Box>
              </Box>

              {/* Actions Row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  pt: 0.5,
                }}
              >
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<BellRing size={14} />}
                  onClick={() => handleOpenReminder(patient)}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    bgcolor: '#e11d48',
                    borderRadius: '9999px',
                  }}
                >
                  Kirim Pengingat
                </Button>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size='small'
                    onClick={() => onOpenEdit(patient)}
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#ffe4e6', color: '#e11d48' },
                    }}
                    title='Edit Data Pasien'
                  >
                    <Edit size={15} />
                  </IconButton>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => handleDeleteRequest(patient.id)}
                    sx={{
                      bgcolor: '#fee2e2',
                      color: '#dc2626',
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#fca5a5' },
                    }}
                    title='Hapus Pasien'
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          );
        }}
      />

      {/* Add/Edit Patient Modal Component */}
      <UserFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        onUpdateFormData={updateFormData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus pasien ini? Data tidak dapat dikembalikan.'
        confirmText='Hapus Pasien'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        patientName={reminderData.patientName}
        patientPhone={reminderData.patientPhone}
        onSendSuccess={handleSendReminderSuccess}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </Box>
  );
}
