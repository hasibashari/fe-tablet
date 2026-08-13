'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  AuthUser,
  AuthState,
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
} from '../types/auth.types'
import { MOCK_ADMIN_USER, MOCK_PATIENT_USER } from '../api/mockAuthData'

const AUTH_STORAGE_KEY = 'medicore_auth_user'

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState)

  // Initialize from localStorage on client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const parsedUser: AuthUser = JSON.parse(stored)
        setState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        })
        return
      }
    } catch {
      // ignore storage parsing error
    }
    setState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  const saveUserSession = (user: AuthUser) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } catch {
      // storage error fallback
    }
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 500))

      const normalizedEmail = credentials.email.trim().toLowerCase()

      if (normalizedEmail.includes('admin') || credentials.roleHint === 'admin') {
        saveUserSession(MOCK_ADMIN_USER)
        return { success: true, redirectTo: '/admin/dashboard' }
      }

      if (normalizedEmail.includes('budi') || normalizedEmail.includes('patient') || normalizedEmail.includes('user') || credentials.roleHint === 'patient') {
        saveUserSession(MOCK_PATIENT_USER)
        return { success: true, redirectTo: '/user/dashboard' }
      }

      // Default fallback: If regular valid email, log in as patient with custom email
      if (normalizedEmail.includes('@')) {
        const customUser: AuthUser = {
          ...MOCK_PATIENT_USER,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0].toUpperCase(),
        }
        saveUserSession(customUser)
        return { success: true, redirectTo: '/user/dashboard' }
      }

      return {
        success: false,
        error: 'Format email tidak valid. Gunakan admin@medicore.com atau budi@medicore.com',
      }
    },
    []
  )

  const quickLogin = useCallback(
    async (role: UserRole): Promise<{ success: boolean; redirectTo: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 350))
      if (role === 'admin') {
        saveUserSession(MOCK_ADMIN_USER)
        return { success: true, redirectTo: '/admin/dashboard' }
      } else {
        saveUserSession(MOCK_PATIENT_USER)
        return { success: true, redirectTo: '/user/dashboard' }
      }
    },
    []
  )

  const register = useCallback(
    async (data: RegisterCredentials): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      
      if (!data.name || !data.email) {
        return { success: false, error: 'Nama dan Email wajib diisi.' }
      }

      const newUser: AuthUser = {
        id: `PAT-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: data.email,
        phone: data.phone || '0812-0000-0000',
        role: 'patient',
        title: 'Pasien Baru',
        gender: data.gender || 'Laki-laki',
        age: data.age || 35,
        assignedDoctor: 'dr. Siti Rahma, Sp.PD',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      }

      saveUserSession(newUser)
      return { success: true, redirectTo: '/user/dashboard' }
    },
    []
  )

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // ignore
    }
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        quickLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
