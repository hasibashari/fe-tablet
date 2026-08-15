import { UserProfile } from '../types'
import { getUserProfileAction } from './userRepository'

export const getProfile = async (userId: string = 'usr_1'): Promise<UserProfile> => {
  const profile = await getUserProfileAction(userId)
  if (profile) return profile

  // Fallback if not found
  return {
    id: userId,
    name: 'Pengguna',
    email: 'user@example.com',
    phone: '-',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    dateOfBirth: '1990-01-01',
    bloodType: 'O+',
    height: 170,
    weight: 65,
  }
}
