import { UserProfile } from '../types'
import { MOCK_PROFILE } from '../../../shared/constants/mockData'

export const getProfile = async (): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return MOCK_PROFILE
}
