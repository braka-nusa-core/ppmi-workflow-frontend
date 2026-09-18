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
import {
  login as apiLogin,
  logout as apiLogout,
  fetchProfile,
  clearLocalSession,
} from '@/lib/api/auth'
import { hasPermission, isSupervisorTeknik, getTechnicalDepartment } from '@/lib/permissions'
import { LS_AUTH_KEY } from '@/config/constants'
import type { TechnicalDepartment } from '@/lib/permissions'

// ─── Context Shape ───────────────────────────────────────────────
// Deliberately does NOT expose a flattened `role` like the old
// 'viewer'|'editor'|'finance'|'administrator' enum — the backend no
// longer has that concept. Authorization here is answered via:
//   - can(resource, action)      → real backend permission strings
//   - isSupervisorTeknik()       → organization-unit identity check
//   - technicalDepartment()      → 'H&M' | 'P&I' | 'Cargo' | null
// These are for UX only; the backend remains authoritative and
// re-checks all of this server-side on every request.
interface AuthContextValue {
  user:        AuthUser | null
  isLoading:   boolean
  isLoggedIn:  boolean

  login:  (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>

  can:                 (resource: string, action: string) => boolean
  isSupervisorTeknik:  () => boolean
  technicalDepartment: () => TechnicalDepartment | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(true)

  // ── Session restore on mount ─────────────────────────────────
  // If a token is present, hydrate the user from a real GET /profile
  // call — never from a cache and never by decoding the token. If
  // /profile rejects (expired/invalid token, user deactivated, etc.)
  // the local token is cleared and the user is treated as logged out.
  // If no token is present at all, skip the network call entirely.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(LS_AUTH_KEY) : null
    if (!token) {
      setLoading(false)
      return
    }

    fetchProfile()
      .then(setUser)
      .catch(() => {
        clearLocalSession()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await apiLogin(credentials)
    setUser(session.user)
    router.push('/dashboard/overview')
  }, [router])

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push('/auth/login')
  }, [router])

  // ── Authorization helpers (UX only — backend is authoritative) ─
  const can = useCallback(
    (resource: string, action: string) => hasPermission(user, resource, action),
    [user]
  )
  const checkIsSupervisorTeknik = useCallback(() => isSupervisorTeknik(user), [user])
  const checkTechnicalDepartment = useCallback(() => getTechnicalDepartment(user), [user])

  const value: AuthContextValue = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
    can,
    isSupervisorTeknik:  checkIsSupervisorTeknik,
    technicalDepartment: checkTechnicalDepartment,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}