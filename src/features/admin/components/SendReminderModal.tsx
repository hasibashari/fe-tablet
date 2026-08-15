'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { BellRing, MessageSquare, Send } from 'lucide-react'

export interface SendReminderModalProps {
  open: boolean
  onClose: () => void
  patientId?: string
  patientName: string
  patientPhone?: string
  scheduleId?: string
  medicationName?: string
  dosage?: string
  timeSlot?: string
  onSendSuccess: (channel: 'app' | 'whatsapp', messageSent: string) => void
}

export default function SendReminderModal({
  open,
  onClose,
  patientName,
  patientPhone = '0812-3456-7890',
  medicationName = 'Amlodipine Besylate 10mg',
  dosage = '1 Tablet',
  timeSlot = '08:00 WIB',
  onSendSuccess,
}: SendReminderModalProps) {
  const [channel, setChannel] = useState<'app' | 'whatsapp'>('app')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard')

  // Helper generator
  const getTemplateContent = (templateKey: string) => {
    switch (templateKey) {
      case 'standard':
        return `Halo Bpk/Ibu ${patientName}, ini pengingat medis dari Klinik MediCore untuk mengonsumsi obat ${medicationName} (${dosage}) pada jam ${timeSlot}. Mohon diminum tepat waktu!`
      case 'friendly':
        return `Halo Bpk/Ibu ${patientName}, menjaga kesehatan adalah investasi terbaik Anda. Jangan lupa minum obat ${medicationName} (${dosage}) hari ini ya!`
      case 'urgent':
        return `PERHATIAN MEDIS: Halo Bpk/Ibu ${patientName}, tim kesehatan mencatat jadwal obat ${medicationName} Anda terlewat. Segera konsumsi obat Anda dan hubungi klinik jika ada kendala.`
      default:
        return `Halo Bpk/Ibu ${patientName}, mohon konsumsi obat ${medicationName} (${dosage}) sesuai instruksi dokter.`
    }
  }

  const [message, setMessage] = useState<string>(() => getTemplateContent('standard'))

  const handleTemplateChange = (newTemplate: string) => {
    setSelectedTemplate(newTemplate)
    setMessage(getTemplateContent(newTemplate))
  }

  const handleSend = () => {
    const finalMsg = message || getTemplateContent(selectedTemplate)
    if (channel === 'whatsapp') {
      const cleanPhone = patientPhone.replace(/[^0-9]/g, '')
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
      const encodedMsg = encodeURIComponent(finalMsg)
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMsg}`, '_blank')
    }

    onSendSuccess(channel, finalMsg)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.dark' }}>
          <BellRing size={22} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Kirim Pengingat Obat Pasien
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Pasien: {patientName} • {medicationName} ({dosage})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Saluran Pengingat */}
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Pilih Saluran Pengiriman:
            </Typography>
            <RadioGroup row value={channel} onChange={(e) => setChannel(e.target.value as 'app' | 'whatsapp')}>
              <FormControlLabel
                value="app"
                control={<Radio size="small" color="primary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <BellRing size={16} color="var(--mui-palette-primary-main)" />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Notifikasi Aplikasi Patient Portal
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="whatsapp"
                control={<Radio size="small" color="success" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <MessageSquare size={16} color="var(--mui-palette-success-main)" />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Pesan WhatsApp ({patientPhone})
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          {/* Template Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="template-select-label">Pilih Template Pesan Khusus</InputLabel>
            <Select
              labelId="template-select-label"
              value={selectedTemplate}
              label="Pilih Template Pesan Khusus"
              onChange={(e) => handleTemplateChange(e.target.value)}
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="standard">
                📋 Pengingat Obat Standar Medis (Rekomendasi)
              </MenuItem>
              <MenuItem value="friendly">
                😊 Pengingat Edukatif & Ramah
              </MenuItem>
              <MenuItem value="urgent">
                🚨 Peringatan Medis Penting (Untuk Jadwal Terlewat / Risiko Tinggi)
              </MenuItem>
            </Select>
          </FormControl>

          {/* Custom Message Editor */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Pratinjau & Edit Pesan:
              </Typography>
              <Chip label="Dapat Diedit" size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
            </Box>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan pengingat khusus untuk pasien..."
              slotProps={{
                input: {
                  sx: { borderRadius: 1, fontSize: '0.9rem', color: 'text.primary' },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500 }}>
          Batal
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={channel === 'whatsapp' ? <MessageSquare size={18} /> : <Send size={18} />}
          color={channel === 'whatsapp' ? 'success' : 'primary'}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          {channel === 'whatsapp' ? 'Kirim via WhatsApp' : 'Kirim Pengingat Sekarang'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
