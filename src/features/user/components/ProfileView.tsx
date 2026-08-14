'use client'

import React, { useEffect, useState } from 'react'
import { getProfile } from '../api/getProfile'
import { UserProfile } from '../types'
import { Mail, Phone, Calendar, Activity, User } from 'lucide-react'
import ProfileLayout from '@/src/shared/components/ProfileLayout'

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProfile()
      setProfile(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading || !profile) {
    return (
      <ProfileLayout
        title="My Profile"
        subtitle="Manage your personal information and health data."
        name=""
        contactItems={[]}
        loading={true}
      />
    )
  }

  return (
    <ProfileLayout
      title="My Profile"
      subtitle="Manage your personal information and health data."
      name={profile.name}
      avatarUrl={profile.avatar}
      onEditClick={() => {
        // Can trigger an edit flow or modal in future
      }}
      contactItems={[
        { icon: Mail, value: profile.email },
        { icon: Phone, value: profile.phone },
        { icon: Calendar, value: `Born ${profile.dateOfBirth}` },
      ]}
      metricsTitle="Health Metrics"
      metrics={[
        {
          label: 'Blood Type',
          value: profile.bloodType,
          icon: Activity,
          iconBgColor: 'error.light',
          iconColor: 'error.dark',
        },
        {
          label: 'Height',
          value: `${profile.height} cm`,
          icon: User,
          iconBgColor: 'info.light',
          iconColor: 'info.dark',
        },
        {
          label: 'Weight',
          value: `${profile.weight} kg`,
          icon: Activity,
          iconBgColor: 'success.light',
          iconColor: 'success.dark',
        },
      ]}
    />
  )
}
