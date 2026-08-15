'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog'
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog'
import { ToastFeedback } from '@/src/shared/components/ToastFeedback'
import { useCrudModal } from '@/src/shared/hooks/useCrudModal'
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm'
import { useToast } from '@/src/shared/hooks/useToast'
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '../api/productRepository'
import { MedicalProduct } from '../types/admin.types'

interface ProductFormData {
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: string
  unit: string
  price: string
  description: string
}

const initialProductFormData: ProductFormData = {
  name: '',
  category: 'Obat Resep',
  sku: '',
  stock: '50',
  unit: 'Tablet',
  price: '20000',
  description: '',
}

export default function ProductManagementView() {
  const [products, setProducts] = useState<MedicalProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [submitting, setSubmitting] = useState(false)

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ProductFormData>(initialProductFormData)

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: productToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>()

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast()

  const loadData = useCallback(async () => {
    const data = await getProductsAction()
    setProducts(data)
  }, [])

  useEffect(() => {
    let isMounted = true
    getProductsAction().then((data) => {
      if (isMounted) setProducts(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const onOpenEdit = (product: MedicalProduct) => {
    handleOpenEdit(product.id, {
      name: product.name,
      category: product.category,
      sku: product.sku,
      stock: product.stock.toString(),
      unit: product.unit,
      price: product.price.toString(),
      description: product.description || '',
    })
  }

  const handleSaveProduct = async () => {
    if (!formData.name) {
      showToast('Nama produk wajib diisi', 'error')
      return
    }

    const stockNum = parseInt(formData.stock) || 0
    let status: 'Tersedia' | 'Stok Menipis' | 'Habis' = 'Tersedia'
    if (stockNum === 0) status = 'Habis'
    else if (stockNum < 20) status = 'Stok Menipis'

    setSubmitting(true)
    try {
      if (editingId) {
        const res = await updateProductAction(editingId, {
          name: formData.name,
          category: formData.category,
          sku: formData.sku,
          stock: stockNum,
          unit: formData.unit,
          price: parseInt(formData.price) || 0,
          status,
          description: formData.description,
        })

        if (res.success) {
          await loadData()
          handleCloseModal()
          showToast('Produk berhasil diperbarui di database!', 'success')
        } else {
          showToast(res.error || 'Gagal memperbarui produk', 'error')
        }
      } else {
        const res = await createProductAction({
          name: formData.name,
          category: formData.category,
          sku: formData.sku || `MED-${formData.name.substring(0, 3).toUpperCase()}-100`,
          stock: stockNum,
          unit: formData.unit,
          price: parseInt(formData.price) || 10000,
          status,
          description: formData.description || 'Deskripsi produk medis.',
        })

        if (res.success) {
          await loadData()
          handleCloseModal()
          showToast('Produk baru berhasil disimpan ke database!', 'success')
        } else {
          showToast(res.error || 'Gagal menambahkan produk', 'error')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const res = await deleteProductAction(productToDelete)
      if (res.success) {
        await loadData()
        showToast('Produk berhasil dihapus dari database.', 'success')
      } else {
        showToast(res.error || 'Gagal menghapus produk', 'error')
      }
    }
    handleCloseDelete()
  }

  const columns: Column<MedicalProduct>[] = [
    {
      id: 'no',
      label: 'No.',
      width: '5%',
      renderCell: (_, index) => (
        <Typography variant="body2" color="text.secondary">
          {index + 1}
        </Typography>
      ),
    },
    {
      id: 'nama',
      label: 'Nama Produk',
      width: '35%',
      renderCell: (product) => (
        <Box>
          <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip 
              label={product.category} 
              size="small" 
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark' }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tag size={12} /> SKU: {product.sku}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'stok',
      label: 'Stok & Satuan',
      renderCell: (product) => (
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {product.stock} <Typography component="span" variant="caption" color="text.secondary">{product.unit}</Typography>
        </Typography>
      ),
    },
    {
      id: 'harga',
      label: 'Harga Estimasi',
      renderCell: (product) => (
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          Rp {product.price.toLocaleString('id-ID')}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      renderCell: (product) => (
        <Chip 
          label={product.status} 
          size="small" 
          color={
            product.status === 'Tersedia' ? 'success' : 
            product.status === 'Stok Menipis' ? 'warning' : 'error'
          }
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      renderCell: (product) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Produk">
            <IconButton size="small" onClick={() => onOpenEdit(product)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Produk">
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(product.id)}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <AdminHeader
        title="Katalog Produk Medis"
        subtitle="Kelola ketersediaan inventaris farmasi, suplemen kesehatan, dan alat medis."
      />

      {/* Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
            <TextField
              placeholder="Cari nama produk atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="Semua">Semua Kategori</MenuItem>
                <MenuItem value="Obat Resep">Obat Resep</MenuItem>
                <MenuItem value="Obat Bebas">Obat Bebas</MenuItem>
                <MenuItem value="Suplemen">Suplemen</MenuItem>
                <MenuItem value="Alat Kesehatan">Alat Kesehatan</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenAdd()}
          >
            Tambah Produk
          </Button>
        </Box>
      </Card>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        emptyMessage="Tidak ada produk yang ditemukan."
      />

      {/* Add/Edit Product Modal */}
      <CrudModalDialog
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
        onSubmit={handleSaveProduct}
        submitText={editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
        submitting={submitting}
      >
        <TextField
          label="Nama Obat / Produk"
          fullWidth
          size="small"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label="Kategori"
                onChange={(e) =>
                  updateFormData({
                    category: e.target.value as ProductFormData['category'],
                  })
                }
              >
                <MenuItem value="Obat Resep">Obat Resep</MenuItem>
                <MenuItem value="Obat Bebas">Obat Bebas</MenuItem>
                <MenuItem value="Suplemen">Suplemen</MenuItem>
                <MenuItem value="Alat Kesehatan">Alat Kesehatan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Kode SKU (Opsional)"
              fullWidth
              size="small"
              value={formData.sku}
              onChange={(e) => updateFormData({ sku: e.target.value })}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <TextField
              label="Jumlah Stok"
              type="number"
              fullWidth
              size="small"
              value={formData.stock}
              onChange={(e) => updateFormData({ stock: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              label="Satuan"
              fullWidth
              size="small"
              value={formData.unit}
              onChange={(e) => updateFormData({ unit: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              label="Harga (Rp)"
              type="number"
              fullWidth
              size="small"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
            />
          </Grid>
        </Grid>

        <TextField
          label="Deskripsi / Indikasi Medis"
          multiline
          rows={3}
          fullWidth
          size="small"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
      </CrudModalDialog>
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus Produk"
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </Box>
  )
}
