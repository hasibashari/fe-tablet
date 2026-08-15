'use server'

import db from '@/src/lib/db/client'
import { UserProfile } from '../types'

interface UserProfileRow {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  date_of_birth: string | null
  blood_type: string | null
  height: number | null
  weight: number | null
}

export async function getUserProfileAction(userId: string = 'usr_1'): Promise<UserProfile | null> {
  try {
    const row = db
      .prepare(
        `SELECT id, name, email, phone, avatar, date_of_birth, blood_type, height, weight 
         FROM users WHERE id = ?`
      )
      .get(userId) as UserProfileRow | undefined

    if (!row) return null

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '-',
      avatar: row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.name)}`,
      dateOfBirth: row.date_of_birth || '1985-05-15',
      bloodType: row.blood_type || 'O+',
      height: Number(row.height) || 170,
      weight: Number(row.weight) || 70,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfileAction(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const updateStmt = db.prepare(`
      UPDATE users 
      SET 
        phone = COALESCE(?, phone),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        blood_type = COALESCE(?, blood_type),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    updateStmt.run(
      data.phone ?? null,
      data.height ?? null,
      data.weight ?? null,
      data.bloodType ?? null,
      userId
    )

    const updated = await getUserProfileAction(userId)
    if (!updated) {
      return { success: false, error: 'User tidak ditemukan setelah pembaruan.' }
    }

    return { success: true, profile: updated }
  } catch (error: unknown) {
    console.error('Error updating user profile:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui profil.'
    return { success: false, error: errMsg }
  }
}
