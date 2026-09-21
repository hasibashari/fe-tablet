'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '@/src/shared/components/StatCard';
import SendReminderModal from '../components/SendReminderModal';
import { getAdminStatsAction } from '../api/adminStatsRepository';
import { getPatientsAction } from '../api/patientRepository';
import { getComplianceReportsAction } from '../api/complianceRepository';
import { AdminStats, PatientUser, ComplianceReport } from '../types/admin.types';

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    activeSchedules: 0,
    adherenceRate: 0,
    publishedArticles: 0,
    activePrograms: 0,
    lowStockProducts: 0,
  });
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const [s, p, r] = await Promise.all([
        getAdminStatsAction(),
        getPatientsAction(),
        getComplianceReportsAction(),
      ]);
      if (isMounted) {
        setStats(s);
        setPatients(p);
        setReports(r);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const highRiskPatients = patients.filter(p => p.riskLevel === 'Tinggi');

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    patientName: string;
    patientPhone?: string;
    medicationName?: string;
    dosage?: string;
    timeSlot?: string;
  }>({
    patientName: '',
  });

  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenReminder = (
    name: string,
    phone?: string,
    medicationName?: string,
    dosage?: string,
    timeSlot?: string,
  ) => {
    setReminderData({
      patientName: name,
      patientPhone: phone || '0812-3456-7890',
      medicationName: medicationName || 'Amlodipine Besylate 10mg',
      dosage: dosage || '1 Tablet',
      timeSlot: timeSlot || '08:00 WIB',
    });
    setReminderModalOpen(true);
  };

  const handleSendSuccess = (channel: 'app' | 'whatsapp') => {
    const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'Notifikasi App';
    setToastMsg(
      `Pengingat obat berhasil dikirimkan ke ${reminderData.patientName} via ${channelName}!`,
    );
    setToastOpen(true);
  };

  return (
    <Box>
      <AdminHeader
        title='Dashboard Utama Admin'
        subtitle='Pantau performa klinik, kepatuhan pengobatan pasien, dan aktivitas medis secara real-time.'
      />

      {/* Entry Portal Banner */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2.5, sm: 3 },
          border: '1px solid',
          borderColor: '#fecdd3',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: '#fff1f2',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarCheck size={26} />
          </Box>
          <Box>
            <Typography variant='subtitle1' color='text.primary' sx={{ fontWeight: 700 }}>
              Pengelolaan Jadwal & Pengingat Obat Pasien
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 0.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Akses konfigurasi dosis, jam minum obat, dan pemantauan kepatuhan harian pasien.
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href='/admin/schedules'
          variant='contained'
          endIcon={<ChevronRight size={16} />}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Buka Jadwal
        </Button>
      </Card>

      {/* KPI Cards Grid (2 cols on mobile, 4 cols on desktop) */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2.5, md: 3.5 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title='Total Pasien'
            value={stats.totalPatients}
            icon={Users}
            iconBgColor='primary.light'
            iconColor='var(--mui-palette-primary-main)'
            subtitle={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <Chip
                  label='+12 bln ini'
                  size='small'
                  color='success'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              </Box>
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title='Jadwal Aktif'
            value={stats.activeSchedules}
            icon={CalendarCheck}
            iconBgColor='primary.light'
            iconColor='var(--mui-palette-primary-main)'
            subtitle={`${stats.totalPatients} pasien aktif`}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title='Kepatuhan Rata-rata'
            value={`${stats.adherenceRate}%`}
            icon={TrendingUp}
            iconBgColor='success.light'
            iconColor='var(--mui-palette-success-main)'
            subtitle={
              <LinearProgress
                variant='determinate'
                value={stats.adherenceRate}
                color='success'
                sx={{ height: 4, borderRadius: 1, mt: 0.5 }}
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title='Risiko Tinggi'
            value={highRiskPatients.length.toString()}
            icon={AlertTriangle}
            iconBgColor='warning.light'
            iconColor='var(--mui-palette-warning-main)'
            valueColor='var(--mui-palette-warning-main)'
            subtitle='Butuh pantauan'
          />
        </Grid>
      </Grid>

      {/* Main Content Grid: Compliance Chart & High Risk Patients */}
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {/* Compliance Trend Visualizer */}
        <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 2.5, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
              }}
            >
              <Box>
                <Typography variant='subtitle1' color='text.primary' sx={{ fontWeight: 700 }}>
                  Tren Kepatuhan Obat (Mingguan)
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.25, fontSize: '0.8rem' }}
                >
                  Persentase jadwal obat yang diminum tepat waktu oleh pasien
                </Typography>
              </Box>
              <Button
                component={Link}
                href='/admin/reports'
                size='small'
                endIcon={<ArrowUpRight size={15} />}
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  alignSelf: { xs: 'flex-start', sm: 'auto' },
                }}
              >
                Lihat Detail
              </Button>
            </Box>

            {/* Bar Chart Visualizer */}
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: 190,
                  minWidth: { xs: 320, sm: 'auto' },
                  pt: 3,
                  pb: 1,
                  px: { xs: 1, sm: 2 },
                }}
              >
                {reports.map(report => (
                  <Box
                    key={report.date}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
                  >
                    <Typography
                      variant='caption'
                      color='text.primary'
                      sx={{ fontWeight: 700, mb: 0.75, fontSize: '0.72rem' }}
                    >
                      {report.adherencePercentage.toFixed(0)}%
                    </Typography>
                    <Box
                      sx={{
                        width: '50%',
                        maxWidth: 28,
                        height: `${report.adherencePercentage * 1.3}px`,
                        bgcolor: report.adherencePercentage >= 90 ? 'primary.main' : 'warning.main',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.2s ease',
                        '&:hover': { opacity: 0.85, transform: 'scaleY(1.02)' },
                      }}
                    />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 1, fontWeight: 500, fontSize: '0.7rem' }}
                    >
                      {report.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                pt: 2,
                mt: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                  Kepatuhan Tinggi (≥90%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                  Perlu Perhatian (&lt;90%)
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* High Risk Patients Alert Box */}
        <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 2.5, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={18} color='var(--mui-palette-warning-main)' />
                <Typography variant='subtitle1' color='text.primary' sx={{ fontWeight: 700 }}>
                  Pasien Perlu Perhatian
                </Typography>
              </Box>
              <Button
                component={Link}
                href='/admin/users'
                size='small'
                endIcon={<ChevronRight size={15} />}
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                Semua
              </Button>
            </Box>

            <Typography variant='body2' color='text.secondary' sx={{ mb: 2, fontSize: '0.8rem' }}>
              Pasien dengan kepatuhan rendah atau membutuhkan dorongan pengingat:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {highRiskPatients.slice(0, 3).map(patient => (
                <Box
                  key={patient.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: '#fed7aa',
                    bgcolor: '#fffbeb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                        width: 34,
                        height: 34,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {patient.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant='subtitle2'
                        color='text.primary'
                        noWrap
                        sx={{ fontWeight: 700 }}
                      >
                        {patient.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {patient.age} th • {patient.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                    <Chip
                      label={`${patient.adherenceRate}%`}
                      size='small'
                      color='warning'
                      sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                    />
                    <Tooltip title='Kirim Pengingat'>
                      <IconButton
                        size='small'
                        color='warning'
                        onClick={() => handleOpenReminder(patient.name, patient.phone)}
                        sx={{ bgcolor: '#fef3c7', '&:hover': { bgcolor: '#fde68a' } }}
                      >
                        <BellRing size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

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
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity='success'
          sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
