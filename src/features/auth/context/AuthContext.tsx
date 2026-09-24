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
  registerUserAction,
} from '../api/authRepository'

export const AUTH_STORAGE_KEY = 'fe_tablet_auth_user'
export const ONBOARDING_STORAGE_KEY = 'fe_tablet_has_onboarded'
const LEGACY_AUTH_STORAGE_KEY = 'medicore_auth_user'
const LEGACY_ONBOARDING_STORAGE_KEY = 'fe_has_onboarded'

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  hasCompletedOnboarding: false,
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState)

  // Initialize from localStorage on client side mount
  useEffect(() => {
    let isMounted = true

    const initAppAuth = () => {
      try {
        if (typeof window === 'undefined') return

        // 1. Check Onboarding Status
        const onboardVal =
          localStorage.getItem(ONBOARDING_STORAGE_KEY) ||
          localStorage.getItem(LEGACY_ONBOARDING_STORAGE_KEY)
        const hasCompletedOnboarding = onboardVal === 'true'

        // 2. Check Auth User Session
        const storedAuth =
          localStorage.getItem(AUTH_STORAGE_KEY) ||
          localStorage.getItem(LEGACY_AUTH_STORAGE_KEY)
        let parsedUser: AuthUser | null = null

        if (storedAuth) {
          try {
            parsedUser = JSON.parse(storedAuth)
          } catch {
            // ignore JSON parse error
          }
        }

        if (isMounted) {
          setState({
            user: parsedUser,
            isAuthenticated: !!parsedUser,
            isLoading: false,
            isInitializing: false,
            hasCompletedOnboarding,
          })
        }
      } catch {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isInitializing: false,
            isLoading: false,
          }))
        }
      }
    }

    initAppAuth()
    return () => {
      isMounted = false
    }
  }, [])

  const completeOnboarding = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
        localStorage.setItem(LEGACY_ONBOARDING_STORAGE_KEY, 'true')
      }
    } catch {
      // storage error fallback
    }
    setState((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY)
        localStorage.removeItem(LEGACY_ONBOARDING_STORAGE_KEY)
      }
    } catch {
      // ignore
    }
    setState((prev) => ({
      ...prev,
      hasCompletedOnboarding: false,
    }))
  }, [])

  const saveUserSession = useCallback((user: AuthUser) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      }
    } catch {
      // storage error fallback
    }
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      isLoading: false,
    }))
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        const res = await loginUserAction(credentials)
        if (res.success && res.user) {
          saveUserSession(res.user)
          return { success: true, redirectTo: res.redirectTo }
        }
        setState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: false,
          error: res.error || 'Gagal login. Periksa kembali email Anda.',
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: false,
          error: 'Terjadi kendala sistem saat login.',
        }
      }
    },
    [saveUserSession]
  )

  const quickLogin = useCallback(
    async (role: UserRole): Promise<{ success: boolean; redirectTo: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        const res = await quickLoginAction(role)
        if (res.success && res.user) {
          saveUserSession(res.user)
          return { success: true, redirectTo: res.redirectTo }
        }
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, redirectTo: '/auth/login' }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, redirectTo: '/auth/login' }
      }
    },
    [saveUserSession]
  )

  const register = useCallback(
    async (data: RegisterCredentials): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        const res = await registerUserAction(data)
        if (res.success && res.user) {
          saveUserSession(res.user)
          return { success: true, redirectTo: res.redirectTo }
        }
        setState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: false,
          error: res.error || 'Gagal mendaftar. Silakan coba lagi.',
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: false,
          error: 'Terjadi kendala sistem saat pendaftaran.',
        }
      }
    },
    [saveUserSession]
  )

  const logout = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
      }
    } catch {
      // ignore
    }
    setState((prev) => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }))
    if (typeof window !== 'undefined') {
      window.location.href = '/onboarding'
    }
  }, [])

  const updateUser = useCallback((updated: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev
      const newUser: AuthUser = { ...prev.user, ...updated }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
        }
      } catch {
        // ignore storage parsing error
      }
      return {
        ...prev,
        user: newUser,
      }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        quickLogin,
        register,
        logout,
        completeOnboarding,
        resetOnboarding,
        updateUser,
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

