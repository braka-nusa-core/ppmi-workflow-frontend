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
import { login as apiLogin, logout as apiLogout, getMe, clearLocalSession } from '@/lib/api/auth'
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
  can:  (permission: keyof RolePermissions) => boolean
  role: UserRole | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(true)

  // ── Session restore on mount ─────────────────────────────────
  // Delegates entirely to getMe() which encapsulates:
  //   1. Read token from LS_AUTH_KEY — throw if missing
  //   2. Check expiry via isTokenExpired() — throw + clearLocalSession if expired
  //   3. Read user snapshot from LS_AUTH_USER_KEY — return if valid JSON
  //   4. Fall back to JWT decode — return AuthUser (email will be empty)
  //
  // On any throw (no token, expired, corrupted): clearLocalSession() and
  // leave user as null → renders as logged-out.
  //
  // No network call is made — backend has no /auth/me.
  // A 401 from any subsequent API call is handled by lib/api/client.ts
  // interceptor which clears session and redirects to /auth/login.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => clearLocalSession())
      .finally(() => setLoading(false))
  }, [])

  // ── Login ────────────────────────────────────────────────────
  // Calls POST /auth/login via lib/api/auth.ts, receives AuthSession,
  // sets user state, then navigates to dashboard.
  // Throws ApiError on failure — LoginForm catches and displays err.message.
  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await apiLogin(credentials)
    setUser(session.user)
    router.push('/dashboard/overview')
  }, [router])

  // ── Logout ───────────────────────────────────────────────────
  // No backend logout endpoint — clears local session only.
  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push('/auth/login')
  }, [router])

  // ── Permission helper ────────────────────────────────────────
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