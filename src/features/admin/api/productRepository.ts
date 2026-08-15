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
    const rows = db.prepare(`SELECT * FROM products ORDER BY name ASC`).all() as ProductDbRow[]
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      sku: r.sku,
      stock: r.stock,
      unit: r.unit,
      price: r.price,
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
    db.prepare(`
      INSERT INTO products (id, name, category, sku, stock, unit, price, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.name,
      data.category,
      data.sku,
      data.stock,
      data.unit,
      data.price,
      data.status,
      data.description || null
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
    db.prepare(`
      UPDATE products
      SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        sku = COALESCE(?, sku),
        stock = COALESCE(?, stock),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name ?? null,
      data.category ?? null,
      data.sku ?? null,
      data.stock ?? null,
      data.unit ?? null,
      data.price ?? null,
      data.status ?? null,
      data.description ?? null,
      productId
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
    db.prepare(`DELETE FROM products WHERE id = ?`).run(productId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data produk'
    return { success: false, error: errMsg }
  }
}
