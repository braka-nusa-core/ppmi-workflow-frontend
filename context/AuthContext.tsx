'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser, LoginCredentials } from '@/types/auth'
import type { UserRole } from '@/types/workflow'
import { login as apiLogin, logout as apiLogout, getMe } from '@/lib/api/auth'
import { LS_AUTH_KEY } from '@/config/constants'
import { can } from '@/lib/permissions'
import type { RolePermissions } from '@/config/permissions'

// ─── Context Shape ───────────────────────────────────────────────
interface AuthContextValue {
  user:        AuthUser | null
  isLoading:   boolean
  isLoggedIn:  boolean

  login:  (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>

  // Permission helpers
  can: (permission: keyof RolePermissions) => boolean
  role: UserRole | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(true)

  // On mount — try to restore session from token
  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem(LS_AUTH_KEY)
      : null

    if (!token) {
      setLoading(false)
      return
    }

    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(LS_AUTH_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await apiLogin(credentials)
    setUser(session.user)
    router.push('/dashboard/overview')
  }, [router])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push('/auth/login')
  }, [router])

  const checkPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!user) return false
      return can(user.role, permission)
    },
    [user]
  )

  const value: AuthContextValue = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
    can:  checkPermission,
    role: user?.role ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
