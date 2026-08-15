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
import {
  loginUserAction,
  quickLoginAction,
  registerPatientAction,
} from '../api/authRepository'

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
    let isMounted = true
    const initAuth = async () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null
        if (stored) {
          const parsedUser: AuthUser = JSON.parse(stored)
          if (isMounted) {
            setState({
              user: parsedUser,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }
        }
      } catch {
        // ignore storage parsing error
      }
      if (isMounted) {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
    return () => {
      isMounted = false
    }
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
      const res = await loginUserAction(credentials)
      if (res.success && res.user) {
        saveUserSession(res.user)
        return { success: true, redirectTo: res.redirectTo }
      }
      return {
        success: false,
        error: res.error || 'Gagal login. Periksa kembali email Anda.',
      }
    },
    []
  )

  const quickLogin = useCallback(
    async (role: UserRole): Promise<{ success: boolean; redirectTo: string }> => {
      const res = await quickLoginAction(role)
      if (res.success && res.user) {
        saveUserSession(res.user)
        return { success: true, redirectTo: res.redirectTo }
      }
      return { success: false, redirectTo: '/auth/login' }
    },
    []
  )

  const register = useCallback(
    async (data: RegisterCredentials): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
      const res = await registerPatientAction(data)
      if (res.success && res.user) {
        saveUserSession(res.user)
        return { success: true, redirectTo: res.redirectTo }
      }
      return {
        success: false,
        error: res.error || 'Gagal mendaftar. Silakan coba lagi.',
      }
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
