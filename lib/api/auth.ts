import { get, post } from './client'
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  BackendLoginResponse,
  BackendProfileData,
  OrganizationUnit,
} from '@/types/auth'
import { LS_AUTH_KEY } from '@/config/constants'

const BASE = '/auth'

// ─────────────────────────────────────────────────────────────────
// USER BUILDER
// ─────────────────────────────────────────────────────────────────

/**
 * Build the frontend AuthUser directly from GET /profile's response.
 * This is the ONLY place identity/role/permissions are derived — no
 * JWT decoding, no client-side reconstruction, no cached fallback.
 */
function mapProfileToUser(data: BackendProfileData): AuthUser {
  const organizationUnit: OrganizationUnit | null = data.organizationUnit
    ? {
        name:   data.organizationUnit.name,
        type:   data.organizationUnit.type,
        parent: data.organizationUnit.parent,
      }
    : null

  return {
    id:               data._id,
    name:             data.fullname,
    email:            data.email,
    phone:            data.phone,
    role:             data.role,
    isSuperAdmin:     data.role === 'SUPERADMIN',
    organizationUnit,
    permissions:      data.permissions,
    createdAt:        data.createdAt,
  }
}

// ─────────────────────────────────────────────────────────────────
// SESSION PERSISTENCE
// ─────────────────────────────────────────────────────────────────
// Only the access token is persisted locally. The user's identity,
// role, organization unit, and permissions are NEVER cached or
// reconstructed client-side — they are re-fetched from GET /profile
// every time they're needed (on login, and on every page load/refresh),
// so a change made on the backend (role, permissions, org unit) is
// reflected on the very next load rather than trusted from stale state.

export function clearLocalSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_AUTH_KEY)
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC AUTH API
// ─────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 *
 * Sends credentials, stores the returned access token, then immediately
 * calls GET /profile to hydrate the full, authoritative user record
 * (role + organization unit + permissions). The login response itself
 * only carries a partial shape (id, fullname, email, organizationUnit
 * name) — it is not used to build the AuthUser.
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const res = await post<BackendLoginResponse>(`${BASE}/login`, credentials)

  if (!res?.data?.accessToken) {
    throw {
      status: 0,
      message:
        'Login succeeded but no accessToken was returned. ' +
        'Check BackendLoginData shape against the actual response.',
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_AUTH_KEY, res.data.accessToken)
  }

  const user = await fetchProfile()

  return { user, accessToken: res.data.accessToken }
}

/**
 * No backend logout endpoint exists.
 * Clears the local token only — the token itself remains valid until
 * it expires server-side; there is nothing further the frontend can do.
 */
export async function logout(): Promise<void> {
  clearLocalSession()
}

/**
 * GET /profile
 *
 * The single source of truth for "who is the current user and what can
 * they do." Always a real network call — never a cache, never a JWT
 * decode. A 401 here (missing/expired/invalid token) is surfaced as a
 * thrown ApiError, which AuthContext treats as "not logged in."
 */
export async function fetchProfile(): Promise<AuthUser> {
  const res = await get<{ success: boolean; data: BackendProfileData }>('/profile')
  return mapProfileToUser(res.data)
}