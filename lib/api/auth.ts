import { post } from './client'
import { decodeJwtPayload, isTokenExpired } from './jwt'
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  BackendLoginResponse,
  BackendRegisterResponse,
  BackendRegisterData,
  BackendJwtPayload,
} from '@/types/auth'
import type { UserRole, Division } from '@/types/workflow'
import { LS_AUTH_KEY, LS_AUTH_USER_KEY } from '@/config/constants'

const BASE = '/auth'

// ─────────────────────────────────────────────────────────────────
// NORMALIZATION HELPERS
// ─────────────────────────────────────────────────────────────────

const VALID_ROLES: UserRole[] = ['viewer', 'editor', 'finance', 'administrator']

/**
 * Map backend role data → frontend's fixed UserRole enum.
 *
 * Backend `is_admin` is a separate boolean (not part of `roles`).
 * Priority: is_admin === true ALWAYS → 'administrator'.
 *
 * For non-admin users, match the first entry of `roles[]` against
 * VALID_ROLES (case-insensitive), then check common aliases.
 * Default: 'viewer' (least privilege — never silently elevates).
 *
 * Alias map — extend if backend role names differ from VALID_ROLES:
 * Confirmed role names are stored in the `roles` table via /roles CRUD.
 * Actual DB values are unknown until first real login test.
 */
function normalizeRole(isAdmin: boolean, roles: string[] | null): UserRole {
  if (isAdmin) return 'administrator'

  const first = roles?.[0]?.toLowerCase().trim()
  if (!first) return 'viewer'

  if (VALID_ROLES.includes(first as UserRole)) return first as UserRole

  const aliases: Record<string, UserRole> = {
    admin:            'administrator',
    administrator:    'administrator',
    'finance manager':'finance',
    'finance staff':  'finance',
    keuangan:         'finance',
    edit:             'editor',
    editor:           'editor',
  }

  return aliases[first] ?? 'viewer'
}

/**
 * Map backend division names → frontend Division code.
 *
 * Backend stores division names in DB (e.g. 'P&I', 'H&M').
 * Frontend Division type = 'PI' | 'HM'.
 * `undefined` when is_admin (full access, no division restriction).
 *
 * If the actual DB name strings differ from these, add cases here.
 */
function normalizeDivision(divisions: string[] | null): Division | undefined {
  const first = divisions?.[0]
  if (!first) return undefined

  const upper = first.toUpperCase().trim()
  if (upper === 'P&I' || upper === 'PI') return 'PI'
  if (upper === 'H&M' || upper === 'HM') return 'HM'

  // Unknown division name — undefined so DivisionContext uses its own default.
  // TODO: surface this in dev console so it can be caught during testing.
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[auth] Unknown division name from backend: "${first}". Expected 'P&I' or 'H&M'.`)
  }
  return undefined
}

// ─────────────────────────────────────────────────────────────────
// USER BUILDERS
// ─────────────────────────────────────────────────────────────────

/** Build AuthUser from POST /auth/login response data (has email). */
function mapLoginDataToUser(data: BackendLoginResponse['data']): AuthUser {
  return {
    id:        data.id,
    name:      data.fullname,
    email:     data.email,
    isAdmin:   data.is_admin,
    role:      normalizeRole(data.is_admin, data.roles),
    division:  normalizeDivision(data.divisions),
    divisions: data.divisions,
    roles:     data.roles,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Build AuthUser from decoded JWT payload (fallback — no email in JWT).
 * Used when LS_AUTH_USER_KEY cache is missing but token is still valid.
 * Email will be empty string; all permission-relevant fields are present.
 */
function mapJwtToUser(payload: BackendJwtPayload): AuthUser {
  return {
    id:        payload.id,
    name:      payload.fullname,
    email:     '',           // not a JWT claim — see BackendJwtPayload comment
    isAdmin:   payload.is_admin,
    role:      normalizeRole(payload.is_admin, payload.roles),
    division:  normalizeDivision(payload.divisions),
    divisions: payload.divisions,
    roles:     payload.roles,
    createdAt: new Date().toISOString(),
  }
}

/** Compute expiresAt from JWT exp claim (6h from issue, per app.module.ts). */
function resolveExpiresAt(token: string): string {
  const payload = decodeJwtPayload(token)
  if (payload?.exp) return new Date(payload.exp * 1000).toISOString()
  return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
}

// ─────────────────────────────────────────────────────────────────
// SESSION PERSISTENCE
// ─────────────────────────────────────────────────────────────────

/**
 * Clear all locally-persisted auth data.
 * Called by logout() and by AuthContext when a stored token is
 * found to be invalid or expired.
 */
export function clearLocalSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_AUTH_KEY)
  localStorage.removeItem(LS_AUTH_USER_KEY)
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC AUTH API
// ─────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 *
 * Sends credentials, parses BackendLoginData, normalizes to AuthUser,
 * persists both token (LS_AUTH_KEY) and user snapshot (LS_AUTH_USER_KEY)
 * to localStorage, and returns an AuthSession.
 *
 * The user snapshot is needed by getMe() on page refresh because:
 *   - There is no GET /auth/me
 *   - GET /users/{id} is AdminOnly (403 for viewer/editor/finance)
 *   - The JWT doesn't carry email
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const res = await post<BackendLoginResponse>(`${BASE}/login`, credentials)

  if (!res?.data?.access_token) {
    throw {
      status: 0,
      message:
        'Login succeeded but no access_token was returned. ' +
        'Check BackendLoginData shape against actual response.',
    }
  }

  const user = mapLoginDataToUser(res.data)

  localStorage.setItem(LS_AUTH_KEY, res.data.access_token)
  localStorage.setItem(LS_AUTH_USER_KEY, JSON.stringify(user))

  return {
    user,
    accessToken: res.data.access_token,
    expiresAt:   resolveExpiresAt(res.data.access_token),
  }
}

/**
 * No backend logout endpoint.
 * Clears the local session only — token is effectively abandoned
 * (will expire after 6h regardless).
 */
export async function logout(): Promise<void> {
  clearLocalSession()
}

/**
 * Session restore — no GET /auth/me exists; no network call made.
 *
 * Strategy:
 *   1. Read token from LS_AUTH_KEY; throw if missing.
 *   2. Check expiry client-side; throw (and clear) if expired.
 *   3. Read cached user from LS_AUTH_USER_KEY (has email); return if valid.
 *   4. Fall back to decoding JWT (email will be empty string).
 *
 * AuthContext catches any thrown error and clears the session.
 */
export async function getMe(): Promise<AuthUser> {
  if (typeof window === 'undefined') {
    throw { status: 401, message: 'Cannot restore session in server context' }
  }

  const token = localStorage.getItem(LS_AUTH_KEY)

  if (!token) {
    throw { status: 401, message: 'No session token found' }
  }

  if (isTokenExpired(token)) {
    clearLocalSession()
    throw { status: 401, message: 'Session token has expired' }
  }

  const cached = localStorage.getItem(LS_AUTH_USER_KEY)
  if (cached) {
    try {
      return JSON.parse(cached) as AuthUser
    } catch {
      // Corrupted cache — fall through to JWT decode
      localStorage.removeItem(LS_AUTH_USER_KEY)
    }
  }

  // Fallback: reconstruct from JWT (email will be blank)
  const payload = decodeJwtPayload(token) as BackendJwtPayload | null
  if (!payload?.id) {
    clearLocalSession()
    throw { status: 401, message: 'Unable to decode session token' }
  }

  const user = mapJwtToUser(payload)
  localStorage.setItem(LS_AUTH_USER_KEY, JSON.stringify(user))
  return user
}

/**
 * POST /auth/register (AdminOnly)
 *
 * Creates a new user account. Does NOT issue a token — the currently
 * authenticated admin's session is unchanged.
 *
 * This will be the primary "create user" call for the Users/Admin module
 * (no POST /users endpoint exists). Relevant for priority #2.
 */
export async function register(
  payload: RegisterCredentials
): Promise<BackendRegisterData> {
  const res = await post<BackendRegisterResponse>(`${BASE}/register`, payload)
  return res.data
}

// ─────────────────────────────────────────────────────────────────
// REMOVED — no backend endpoint for these
// ─────────────────────────────────────────────────────────────────
// refreshToken()    → no POST /auth/refresh
//                     On JWT expiry: UserGuard → 401 → client.ts
//                     interceptor clears session + redirects to login.
//
// changePassword()  → no POST /auth/change-password
//                     Revisit during Users module: PATCH /users/{id}
//                     accepts UpdateUserDto (confirm if password is there).