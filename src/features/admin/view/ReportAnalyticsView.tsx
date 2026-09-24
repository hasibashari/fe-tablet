'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Printer, TrendingUp, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { getComplianceReportsAction } from '../api/complianceRepository';
import { getPatientsAction } from '../api/patientRepository';
import { ComplianceReport, PatientUser } from '../types/admin.types';

export default function ReportAnalyticsView() {
  const [period, setPeriod] = useState('7-hari');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [patients, setPatients] = useState<PatientUser[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      const [r, p] = await Promise.all([getComplianceReportsAction(), getPatientsAction()]);
      if (isMounted) {
        setReports(r);
        setPatients(p);
      }
    };
    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalTaken = reports.reduce((acc, curr) => acc + curr.takenCount, 0);
  const totalMissed = reports.reduce((acc, curr) => acc + curr.missedCount, 0);
  const totalSum = totalTaken + totalMissed;
  const overallRate = totalSum > 0 ? ((totalTaken / totalSum) * 100).toFixed(1) : '100.0';

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Hari,Diminum,Terlewat,Persentase Kepatuhan\n' +
      reports
        .map(r => `${r.date},${r.takenCount},${r.missedCount},${r.adherencePercentage}%`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kepatuhan_MediCore_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <AdminHeader
        title='Laporan & Analitik Klinik'
        subtitle='Analisis statistik kepatuhan konsumsi obat pasien, tren aktivitas harian, serta ekspor dokumen medis.'
      />

      {/* Control Bar */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: { xs: 2.5, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Periode Laporan</InputLabel>
              <Select
                value={period}
                label='Periode Laporan'
                onChange={e => setPeriod(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value='7-hari'>7 Hari Terakhir</MenuItem>
                <MenuItem value='30-hari'>30 Hari Terakhir</MenuItem>
                <MenuItem value='3-bulan'>3 Bulan Terakhir</MenuItem>
              </Select>
            </FormControl>
            <Chip
              label='Data Real-Time'
              size='small'
              sx={{
                bgcolor: '#ecfdf5',
                color: '#059669',
                borderColor: '#a7f3d0',
                border: '1px solid',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant='outlined'
              startIcon={<FileSpreadsheet size={18} />}
              onClick={handleExportCSV}
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                borderRadius: 2,
                fontWeight: 600,
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { borderColor: 'primary.main', bgcolor: '#fff1f2' },
              }}
            >
              Ekspor CSV
            </Button>
            <Button
              variant='contained'
              startIcon={<Printer size={18} />}
              onClick={() => window.print()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: 'none',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Cetak Laporan PDF
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Summary KPI row */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2.5, md: 3.5 } }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CheckCircle2 color='var(--mui-palette-success-main)' size={18} />
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 600 }}>
                Obat Diminum Tepat Waktu
              </Typography>
            </Box>
            <Typography variant='h5' color='text.primary' sx={{ fontWeight: 800, mb: 0.5 }}>
              {totalTaken.toLocaleString('id-ID')} Dosis
            </Typography>
            <Typography variant='caption' color='success.main' sx={{ fontWeight: 700 }}>
              {overallRate}% Dari Total Dosis Terjadwal
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AlertCircle color='var(--mui-palette-warning-main)' size={18} />
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 600 }}>
                Obat Terlewat / Lupa
              </Typography>
            </Box>
            <Typography variant='h5' color='warning.main' sx={{ fontWeight: 800, mb: 0.5 }}>
              {totalMissed.toLocaleString('id-ID')} Dosis
            </Typography>
            <Typography variant='caption' color='warning.main' sx={{ fontWeight: 700 }}>
              {(100 - parseFloat(overallRate)).toFixed(1)}% Butuh Tindak Lanjut
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <TrendingUp color='var(--mui-palette-primary-main)' size={18} />
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 600 }}>
                Skor Efektivitas Klinik
              </Typography>
            </Box>
            <Typography variant='h5' color='primary.main' sx={{ fontWeight: 800, mb: 0.5 }}>
              Sangat Baik (A)
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
              Berdasarkan Indikator Standar Medis
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Breakdown Grid */}
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {/* Table breakdown */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2.5, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant='h6'
              color='text.primary'
              sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}
            >
              Rincian Kepatuhan Konsumsi Harian Pasien
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reports.map((report, idx) => {
                const dateLabel =
                  typeof report.date === 'string'
                    ? report.date
                    : report.date && typeof report.date === 'object'
                      ? new Date(String(report.date)).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : String(report.date || '');

                return (
                  <Box
                    key={`${dateLabel}-${idx}`}
                    sx={{ pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600 }}>
                        {dateLabel}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.primary'
                        sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {report.adherencePercentage}% ({report.takenCount} diminum,{' '}
                        {report.missedCount} terlewat)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={report.adherencePercentage}
                      sx={{
                        height: 8,
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            report.adherencePercentage >= 90 ? 'primary.main' : 'warning.main',
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Patient Adherence Leaderboard */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 2.5, sm: 3 },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='subtitle1' color='text.primary' sx={{ fontWeight: 700, mb: 2 }}>
              Distribusi Kepatuhan Pasien
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {patients.slice(0, 5).map(p => (
                <Box
                  key={p.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant='subtitle2'
                      color='text.primary'
                      noWrap
                      sx={{ fontWeight: 700 }}
                    >
                      {p.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {p.assignedDoctor.split(',')[0]}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${p.adherenceRate}%`}
                    size='small'
                    color={p.adherenceRate >= 90 ? 'success' : 'warning'}
                    sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem', flexShrink: 0 }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
