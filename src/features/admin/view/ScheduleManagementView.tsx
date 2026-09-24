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
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Plus, BellRing, Edit, Trash2 } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import ScheduleFormModal from '../components/ScheduleFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getSchedulesAction,
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
  sendReminderNudgeAction,
} from '../api/scheduleRepository';
import { getPatientsAction } from '../api/patientRepository';
import { MedicationSchedule, PatientUser } from '../types/admin.types';
import {
  INITIAL_SCHEDULE_FORM_DATA,
  ScheduleFormData,
  SCHEDULE_CATEGORIES,
  SCHEDULE_CATEGORY_COLORS,
  ScheduleCategory,
} from '../constants/schedule.constants';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
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
  } = useCrudModal<ScheduleFormData>(INITIAL_SCHEDULE_FORM_DATA);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: scheduleToDelete,
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
    scheduleId?: string;
    medicationName?: string;
    dosage?: string;
    timeSlot?: string;
  }>({
    patientName: '',
  });

  const loadData = useCallback(async () => {
    const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()]);
    setSchedules(s);
    setPatients(p);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()]);
      if (isMounted) {
        setSchedules(s);
        setPatients(p);
      }
    };

    fetchData();

    // Cross-Tab Sync via BroadcastChannel
    const unsubscribe = subscribeRealtimeEvent(event => {
      if (
        event.type === 'MEDICATION_TAKEN' ||
        event.type === 'SCHEDULE_UPDATED' ||
        event.type === 'NUDGE_DISMISSED'
      ) {
        fetchData();
      }
    });

    // Multi-device polling
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData();
      }
    }, 8000);

    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.medicationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onOpenAdd = () => {
    handleOpenAdd({
      patientId: patients[0]?.id || 'usr_1',
    });
  };

  const onOpenEdit = (schedule: MedicationSchedule) => {
    handleOpenEdit(schedule.id, {
      patientId: schedule.patientId,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      frequency: schedule.frequency === 'Harian' ? 'Harian' : '1x Seminggu',
      dayOfWeek: schedule.dayOfWeek || 'Sabtu',
      timeSlot: schedule.timeSlots.join(', '),
      category: (schedule.category as ScheduleCategory) || 'TTD Rutin',
      instructions: schedule.instructions,
    });
  };

  const handleSaveSchedule = async () => {
    if (!formData.medicationName) {
      showToast('Nama obat / suplemen wajib diisi', 'error');
      return;
    }

    const rawSlots = formData.timeSlot
      .split(/[,;]+/)
      .map(s => s.trim().replace('.', ':'))
      .filter(s => s.length > 0);

    const timeSlotsArray = rawSlots.length > 0 ? rawSlots : ['08:00'];
    const today = new Date().toISOString().split('T')[0];

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateScheduleAction(editingId, {
          patientId: formData.patientId,
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          timeSlots: timeSlotsArray,
          category: formData.category,
          instructions: formData.instructions,
        });

        if (res.success) {
          await loadData();
          publishRealtimeEvent('SCHEDULE_UPDATED', {
            patientId: formData.patientId,
            scheduleId: editingId,
          });
          handleCloseModal();
          showToast('Jadwal berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui jadwal', 'error');
        }
      } else {
        const res = await createScheduleAction({
          patientId: formData.patientId || patients[0]?.id || 'usr_1',
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          timeSlots: timeSlotsArray,
          startDate: today,
          endDate: '2026-12-31',
          category: formData.category,
          instructions:
            formData.instructions ||
            'Minum 1 tablet setelah sarapan atau sebelum tidur dengan air putih.',
        });

        if (res.success) {
          await loadData();
          publishRealtimeEvent('SCHEDULE_UPDATED', { patientId: formData.patientId });
          handleCloseModal();
          showToast('Jadwal baru berhasil disimpan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal membuat jadwal', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      const res = await deleteScheduleAction(scheduleToDelete);
      if (res.success) {
        await loadData();
        publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: scheduleToDelete });
        showToast('Jadwal berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus jadwal', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (schedule: MedicationSchedule) => {
    const patientObj = patients.find(p => p.id === schedule.patientId);
    setReminderData({
      patientId: schedule.patientId,
      patientName: schedule.patientName,
      patientPhone: patientObj?.phone || '0812-3456-7890',
      scheduleId: schedule.id,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      timeSlot: schedule.timeSlots.join(', ') + ' WIB',
    });
    setReminderModalOpen(true);
  };

  const handleSendSuccess = async (channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.patientId) {
      await sendReminderNudgeAction({
        patientId: reminderData.patientId,
        senderName: 'Administrator MediCore',
        senderRole: 'Administrator',
        scheduleId: reminderData.scheduleId,
        medicationName: reminderData.medicationName,
        dosage: reminderData.dosage,
        timeSlot: reminderData.timeSlot,
        message: messageSent,
        channel,
      });
      await loadData();
      publishRealtimeEvent('NUDGE_SENT', {
        patientId: reminderData.patientId,
      });
    }
  };

  const columns: Column<MedicationSchedule>[] = [
    {
      id: 'patientName',
      label: 'Pasien (Siswi)',
      width: '18%',
      renderCell: schedule => (
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            {schedule.patientName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            ID: {schedule.patientId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'medicationName',
      label: 'Nama Obat / Suplemen',
      width: '20%',
      renderCell: schedule => (
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            {schedule.medicationName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {schedule.dosage} • {schedule.frequency}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Program',
      width: '15%',
      renderCell: schedule => {
        const style =
          SCHEDULE_CATEGORY_COLORS[schedule.category || ''] || SCHEDULE_CATEGORY_COLORS.default;
        return (
          <Chip
            label={schedule.category || 'TTD Rutin'}
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
      id: 'dayOfWeek',
      label: 'Jadwal Minum',
      width: '16%',
      renderCell: schedule => (
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {schedule.dayOfWeek || 'Sabtu'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
            {schedule.timeSlots?.length > 0 ? (
              schedule.timeSlots.map((time, idx) => (
                <Chip
                  key={idx}
                  label={`${time} WIB`}
                  size='small'
                  variant='outlined'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    height: 20,
                  }}
                />
              ))
            ) : (
              <Typography variant='caption' color='text.secondary'>
                08:00 WIB
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'todayStatus',
      label: 'Status Hari Ini',
      width: '13%',
      renderCell: schedule => {
        if (schedule.todayStatus === 'COMPLETED') {
          return (
            <Chip
              label='Sudah Diminum'
              size='small'
              sx={{
                bgcolor: 'rgba(22, 163, 74, 0.12)',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 1,
              }}
            />
          );
        }
        if (schedule.todayStatus === 'PENDING') {
          return (
            <Chip
              label='Belum Diminum'
              size='small'
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 1,
              }}
            />
          );
        }
        return (
          <Typography variant='caption' color='text.secondary'>
            -
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      width: '8%',
      renderCell: schedule => (
        <Chip
          label={schedule.status}
          size='small'
          color={schedule.status === 'Aktif' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: schedule => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title='Ingatkan Pasien'>
            <IconButton size='small' color='primary' onClick={() => handleOpenReminder(schedule)}>
              <BellRing size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit Jadwal'>
            <IconButton size='small' onClick={() => onOpenEdit(schedule)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Hapus Jadwal'>
            <IconButton size='small' color='error' onClick={() => handleDeleteRequest(schedule.id)}>
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
        title='Manajemen Jadwal Obat'
        subtitle='Tetapkan instruksi dosis, frekuensi, serta jadwal pengingat otomatis untuk setiap pasien.'
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
              placeholder='Cari nama obat atau pasien...'
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
            <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 220 } }}>
              <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <MenuItem value='Semua'>Semua Kategori Program</MenuItem>
                {SCHEDULE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant='contained'
            startIcon={<Plus size={18} />}
            onClick={onOpenAdd}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Buat Jadwal Baru
          </Button>
        </Box>
      </Card>

      {/* Schedule Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredSchedules}
        emptyMessage='Tidak ada jadwal yang ditemukan.'
        renderMobileCard={schedule => {
          const style =
            SCHEDULE_CATEGORY_COLORS[schedule.category || ''] || SCHEDULE_CATEGORY_COLORS.default;
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
              {/* Header: Medication + Category Chip */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}
                  >
                    {schedule.medicationName}
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#64748b' }}>
                    Pasien: <strong>{schedule.patientName}</strong> ({schedule.patientId})
                  </Typography>
                </Box>

                <Chip
                  label={schedule.category}
                  size='small'
                  sx={{
                    bgcolor: style.bg,
                    color: style.text,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              </Box>

              {/* Middle Details Grid */}
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: '#fff5f7',
                  border: '1px solid #fce7f3',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant='caption' sx={{ color: '#64748b' }}>
                    Dosis & Frekuensi:
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}
                  >
                    {schedule.dosage} • {schedule.frequency}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant='caption' sx={{ color: '#64748b' }}>
                    Hari & Jam Minum:
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}
                  >
                    {schedule.dayOfWeek || 'Sabtu'}, {schedule.timeSlots.join(', ')} WIB
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 0.5,
                    borderTop: '1px dashed #fce7f3',
                  }}
                >
                  <Typography variant='caption' sx={{ color: '#64748b' }}>
                    Status Hari Ini:
                  </Typography>
                  {schedule.todayStatus === 'COMPLETED' ? (
                    <Chip
                      label='Sudah Diminum'
                      size='small'
                      sx={{
                        bgcolor: 'rgba(22, 163, 74, 0.12)',
                        color: '#15803d',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 20,
                      }}
                    />
                  ) : schedule.todayStatus === 'PENDING' ? (
                    <Chip
                      label='Belum Diminum'
                      size='small'
                      sx={{
                        bgcolor: 'rgba(245, 158, 11, 0.12)',
                        color: '#b45309',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 20,
                      }}
                    />
                  ) : (
                    <Typography variant='caption' color='text.secondary'>
                      -
                    </Typography>
                  )}
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
                  onClick={() => handleOpenReminder(schedule)}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    bgcolor: '#e11d48',
                    borderRadius: '9999px',
                  }}
                >
                  Ingatkan Pasien
                </Button>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size='small'
                    onClick={() => onOpenEdit(schedule)}
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#ffe4e6', color: '#e11d48' },
                    }}
                    title='Edit Jadwal'
                  >
                    <Edit size={15} />
                  </IconButton>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => handleDeleteRequest(schedule.id)}
                    sx={{
                      bgcolor: '#fee2e2',
                      color: '#dc2626',
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#fca5a5' },
                    }}
                    title='Hapus Jadwal'
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          );
        }}
      />

      {/* Add/Edit Schedule Modal Component */}
      <ScheduleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        patients={patients}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleSaveSchedule}
        onUpdateFormData={updateFormData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus jadwal ini? Data yang dihapus tidak dapat dikembalikan.'
        confirmText='Hapus Jadwal'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        patientName={reminderData.patientName}
        patientPhone={reminderData.patientPhone}
        medicationName={reminderData.medicationName}
        dosage={reminderData.dosage}
        timeSlot={reminderData.timeSlot}
        onSendSuccess={handleSendSuccess}
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
