'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material'
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react'
import AdminHeader from './AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '../api/adminRepository'
import { MedicalProduct } from '../types/admin.types'

export default function ProductManagementView() {
  const [products, setProducts] = useState<MedicalProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = React.useCallback(async () => {
    const data = await getProductsAction()
    setProducts(data)
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const init = async () => {
      const data = await getProductsAction()
      if (isMounted) {
        setProducts(data)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState<{
    name: string
    category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
    sku: string
    stock: string
    unit: string
    price: string
    description: string
  }>({
    name: '',
    category: 'Obat Resep',
    sku: '',
    stock: '50',
    unit: 'Tablet',
    price: '20000',
    description: '',
  })

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      category: 'Obat Resep',
      sku: '',
      stock: '50',
      unit: 'Tablet',
      price: '20000',
      description: '',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (product: MedicalProduct) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      stock: product.stock.toString(),
      unit: product.unit,
      price: product.price.toString(),
      description: product.description || '',
    })
    setOpenModal(true)
  }

  const handleSaveProduct = async () => {
    if (!formData.name) return

    const stockNum = parseInt(formData.stock) || 0
    let status: 'Tersedia' | 'Stok Menipis' | 'Habis' = 'Tersedia'
    if (stockNum === 0) status = 'Habis'
    else if (stockNum < 20) status = 'Stok Menipis'

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
        setToastMsg('Produk berhasil diperbarui di database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal memperbarui produk')
        setToastOpen(true)
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
        setToastMsg('Produk baru berhasil disimpan ke database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal menambahkan produk')
        setToastOpen(true)
      }
    }
  }

  const handleDeleteRequest = (id: string) => {
    setProductToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const res = await deleteProductAction(productToDelete)
      if (res.success) {
        await loadData()
        setToastMsg('Produk berhasil dihapus dari database.')
      } else {
        setToastMsg(res.error || 'Gagal menghapus produk')
      }
      setToastOpen(true)
    }
    setDeleteConfirmOpen(false)
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
            <IconButton size="small" onClick={() => handleOpenEdit(product)}>
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
            onClick={handleOpenAdd}
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nama Obat / Produk"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    label="Kategori"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan',
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
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Satuan"
                  fullWidth
                  size="small"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Harga (Rp)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus Produk</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
