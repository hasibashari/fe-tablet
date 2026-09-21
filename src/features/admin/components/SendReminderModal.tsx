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
  IconButton,
} from '@mui/material'
import { BellRing, MessageSquare, Send, X, Smartphone, Sparkles } from 'lucide-react'
import { generateAiPatientNudgeAction } from '@/src/lib/gemini'

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
  const [channel, setChannel] = useState<'app' | 'whatsapp'>('whatsapp')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // Helper generator
  const getTemplateContent = (templateKey: string) => {
    switch (templateKey) {
      case 'standard':
        return `Halo Bpk/Ibu ${patientName}, ini pengingat medis dari Klinik Fe-Tablet untuk mengonsumsi obat ${medicationName} (${dosage}) pada jam ${timeSlot}. Mohon diminum tepat waktu ya! 🌸`
      case 'friendly':
        return `Halo Bpk/Ibu ${patientName}, menjaga kesehatan adalah investasi terbaik Anda. Jangan lupa minum obat ${medicationName} (${dosage}) hari ini ya! Tetap semangat! 🌸`
      case 'urgent':
        return `PERHATIAN MEDIS: Halo Bpk/Ibu ${patientName}, tim kesehatan mencatat jadwal obat ${medicationName} Anda terlewat. Segera konsumsi obat Anda dan hubungi klinik jika ada kendala.`
      default:
        return `Halo Bpk/Ibu ${patientName}, mohon konsumsi obat ${medicationName} (${dosage}) sesuai petunjuk pengobatan Anda.`
    }
  }

  const [message, setMessage] = useState<string>(() => getTemplateContent('standard'))

  const handleTemplateChange = (newTemplate: string) => {
    setSelectedTemplate(newTemplate)
    setMessage(getTemplateContent(newTemplate))
  }

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true)
    try {
      const res = await generateAiPatientNudgeAction({
        patientName,
        medicationName,
        dosage,
        timeSlot,
        tone: selectedTemplate === 'urgent' ? 'urgent' : selectedTemplate === 'friendly' ? 'friendly' : 'motivational',
      })
      if (res.success && res.message) {
        setMessage(res.message)
      }
    } finally {
      setIsGeneratingAi(false)
    }
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
            m: { xs: 1.5, sm: 3 },
            maxHeight: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 64px)' },
            borderRadius: { xs: 3, sm: 3 },
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: '#fff1f2',
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <BellRing size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
              Kirim Pengingat Obat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pasien: {patientName} • {dosage}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Channel Selector Pills */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              PILIH SALURAN PENGIRIMAN:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
              <Box
                onClick={() => setChannel('whatsapp')}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: channel === 'whatsapp' ? '#22c55e' : 'divider',
                  bgcolor: channel === 'whatsapp' ? '#f0fdf4' : 'background.paper',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#22c55e' },
                }}
              >
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: channel === 'whatsapp' ? '#22c55e' : 'grey.100',
                    color: channel === 'whatsapp' ? '#fff' : 'text.secondary',
                    display: 'flex',
                  }}
                >
                  <MessageSquare size={16} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
                    WhatsApp
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Direct Chat
                  </Typography>
                </Box>
              </Box>

              <Box
                onClick={() => setChannel('app')}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: channel === 'app' ? 'primary.main' : 'divider',
                  bgcolor: channel === 'app' ? '#fff1f2' : 'background.paper',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: channel === 'app' ? 'primary.main' : 'grey.100',
                    color: channel === 'app' ? '#fff' : 'text.secondary',
                    display: 'flex',
                  }}
                >
                  <Smartphone size={16} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
                    In-App Push
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Notifikasi Pasien
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Template Selection & AI Generator Button */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: 'center' }}>
            <FormControl fullWidth size="small" sx={{ flex: 1 }}>
              <InputLabel id="template-select-label">Pilih Template Pesan</InputLabel>
              <Select
                labelId="template-select-label"
                value={selectedTemplate}
                label="Pilih Template Pesan"
                onChange={(e) => handleTemplateChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="standard">
                  📋 Standar Medis (Rekomendasi)
                </MenuItem>
                <MenuItem value="friendly">
                  😊 Ramah & Edukatif
                </MenuItem>
                <MenuItem value="urgent">
                  🚨 Peringatan Medis Penting
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              size="small"
              variant="outlined"
              disabled={isGeneratingAi}
              onClick={handleGenerateAiMessage}
              startIcon={<Sparkles size={16} />}
              sx={{
                borderRadius: 2,
                fontSize: '0.78rem',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#fecdd3',
                color: 'primary.main',
                bgcolor: '#fff1f2',
                whiteSpace: 'nowrap',
                width: { xs: '100%', sm: 'auto' },
                py: 0.9,
                '&:hover': { bgcolor: '#ffe4e6', borderColor: 'primary.main' },
              }}
            >
              {isGeneratingAi ? 'Menulis Pesan...' : 'Tulis dengan AI ✨'}
            </Button>
          </Box>

          {/* Custom Message Editor */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Pratinjau & Edit Pesan:
              </Typography>
              <Chip label="Dapat Diedit" size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
            </Box>
            <TextField
              multiline
              rows={4}
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan pengingat khusus untuk pasien..."
              slotProps={{
                input: {
                  sx: { borderRadius: 2, fontSize: '0.88rem', color: 'text.primary' },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Batal
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={channel === 'whatsapp' ? <MessageSquare size={18} /> : <Send size={18} />}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: channel === 'whatsapp' ? '#22c55e' : 'primary.main',
            '&:hover': {
              bgcolor: channel === 'whatsapp' ? '#16a34a' : 'primary.dark',
            },
          }}
        >
          {channel === 'whatsapp' ? 'Buka WhatsApp Pasien' : 'Kirim Pengingat Sekarang'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

