'use client'

import React, { useState } from 'react'
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
} from '@mui/material'
import { Printer, TrendingUp, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import AdminHeader from './AdminHeader'
import { mockComplianceReports, initialPatients } from '../api/mockAdminData'

export default function ReportAnalyticsView() {
  const [period, setPeriod] = useState('7-hari')

  const totalTaken = mockComplianceReports.reduce((acc, curr) => acc + curr.takenCount, 0)
  const totalMissed = mockComplianceReports.reduce((acc, curr) => acc + curr.missedCount, 0)
  const overallRate = ((totalTaken / (totalTaken + totalMissed)) * 100).toFixed(1)

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Hari,Diminum,Terlewat,Persentase Kepatuhan\n' +
      mockComplianceReports
        .map((r) => `${r.date},${r.takenCount},${r.missedCount},${r.adherencePercentage}%`)
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Laporan_Kepatuhan_MediCore_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box>
      <AdminHeader
        title="Laporan & Analitik Klinik"
        subtitle="Analisis statistik kepatuhan konsumsi obat pasien, tren aktivitas harian, serta ekspor dokumen medis."
      />

      {/* Control Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Periode Laporan</InputLabel>
              <Select value={period} label="Periode Laporan" onChange={(e) => setPeriod(e.target.value)}>
                <MenuItem value="7-hari">7 Hari Terakhir</MenuItem>
                <MenuItem value="30-hari">30 Hari Terakhir</MenuItem>
                <MenuItem value="3-bulan">3 Bulan Terakhir</MenuItem>
              </Select>
            </FormControl>
            <Chip label="Data Terverifikasi" size="small" color="success" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<FileSpreadsheet size={18} />}
              onClick={handleExportCSV}
              sx={{ color: 'text.primary', borderColor: 'divider' }}
            >
              Ekspor CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<Printer size={18} />}
              onClick={() => window.print()}
            >
              Cetak Laporan PDF
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Summary KPI row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CheckCircle2 color="var(--mui-palette-success-main)" size={18} />
              <Typography variant="subtitle2" color="text.secondary">
                Obat Diminum Tepat Waktu
              </Typography>
            </Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, mb: 0.5 }}>
              {totalTaken.toLocaleString('id-ID')} Dosis
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
              {overallRate}% Dari Total Dosis Terjadwal
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AlertCircle color="var(--mui-palette-warning-main)" size={18} />
              <Typography variant="subtitle2" color="text.secondary">
                Obat Terlewat / Lupa
              </Typography>
            </Box>
            <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700, mb: 0.5 }}>
              {totalMissed.toLocaleString('id-ID')} Dosis
            </Typography>
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
              {(100 - parseFloat(overallRate)).toFixed(1)}% Butuh Tindak Lanjut
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <TrendingUp color="var(--mui-palette-primary-main)" size={18} />
              <Typography variant="subtitle2" color="text.secondary">
                Skor Efektivitas Klinik
              </Typography>
            </Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, mb: 0.5 }}>
              Sangat Baik (A)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Berdasarkan Indikator Standar WHO
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Breakdown Grid */}
      <Grid container spacing={3}>
        {/* Table breakdown */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
              Rincian Kepatuhan Konsumsi Harian Pasien
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {mockComplianceReports.map((report) => (
                <Box key={report.date} sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.primary">
                      {report.date}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 700 }}>
                      {report.adherencePercentage}% ({report.takenCount} diminum, {report.missedCount} terlewat)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={report.adherencePercentage}
                    sx={{
                      height: 8,
                      borderRadius: 2,
                      bgcolor: 'divider',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: report.adherencePercentage >= 90 ? 'primary.main' : 'warning.main',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Patient Adherence Leaderboard (Lower visual hierarchy) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 2 }}>
              Distribusi Kepatuhan Pasien
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {initialPatients.slice(0, 5).map((p) => (
                <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.primary">
                      {p.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.assignedDoctor.split(',')[0]}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${p.adherenceRate}%`}
                    size="small"
                    color={p.adherenceRate >= 90 ? 'success' : 'warning'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              ))}
            </Box>
            <Button variant="text" size="small" fullWidth sx={{ mt: 2 }}>
              Lihat Semua Pasien
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
