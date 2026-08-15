'use server'

import db from '@/src/lib/db/client'
import { MedicalProduct } from '../types/admin.types'

interface ProductDbRow {
  id: string
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: number
  unit: string
  price: number
  status: 'Tersedia' | 'Stok Menipis' | 'Habis'
  description: string | null
}

// ============================================================
// PRODUCTS MANAGEMENT (PRODUCTS CRUD)
// ============================================================
export async function getProductsAction(): Promise<MedicalProduct[]> {
  try {
    const res = await db.query<ProductDbRow>(`SELECT * FROM products ORDER BY name ASC`)
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      sku: r.sku,
      stock: Number(r.stock) || 0,
      unit: r.unit,
      price: Number(r.price) || 0,
      status: r.status,
      description: r.description || '',
    }))
  } catch (error) {
    console.error('Error in getProductsAction:', error)
    return []
  }
}

export async function createProductAction(data: {
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: number
  unit: string
  price: number
  status: 'Tersedia' | 'Stok Menipis' | 'Habis'
  description?: string
}): Promise<{ success: boolean; product?: MedicalProduct; error?: string }> {
  try {
    const newId = `PRD-${Date.now().toString().slice(-3)}`
    await db.query(
      `INSERT INTO products (id, name, category, sku, stock, unit, price, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newId,
        data.name,
        data.category,
        data.sku,
        data.stock,
        data.unit,
        data.price,
        data.status,
        data.description || null,
      ]
    )

    const created: MedicalProduct = {
      id: newId,
      name: data.name,
      category: data.category,
      sku: data.sku,
      stock: data.stock,
      unit: data.unit,
      price: data.price,
      status: data.status,
      description: data.description || '',
    }
    return { success: true, product: created }
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat data produk'
    return { success: false, error: errMsg }
  }
}

export async function updateProductAction(
  productId: string,
  data: Partial<MedicalProduct>
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(
      `UPDATE products
       SET
         name = COALESCE($1, name),
         category = COALESCE($2, category),
         sku = COALESCE($3, sku),
         stock = COALESCE($4, stock),
         unit = COALESCE($5, unit),
         price = COALESCE($6, price),
         status = COALESCE($7, status),
         description = COALESCE($8, description),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        data.name ?? null,
        data.category ?? null,
        data.sku ?? null,
        data.stock ?? null,
        data.unit ?? null,
        data.price ?? null,
        data.status ?? null,
        data.description ?? null,
        productId,
      ]
    )
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data produk'
    return { success: false, error: errMsg }
  }
}

export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`DELETE FROM products WHERE id = $1`, [productId])
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data produk'
    return { success: false, error: errMsg }
  }
}
