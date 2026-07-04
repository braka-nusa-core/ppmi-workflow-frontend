import type { UserRole, Division } from './workflow'

export interface AuthUser {
  id:       string
  name:     string    // from backend `fullname`
  email:    string
  isAdmin:  boolean   // from backend `is_admin`

  /**
   * Primary role used for ALL permission checks (config/permissions.ts).
   * Derived by normalizeRole(is_admin, roles) in lib/api/auth.ts:
   *   is_admin === true  → 'administrator'  (always wins)
   *   roles[0] matches   → that role (case-insensitive)
   *   otherwise          → 'viewer'  (least-privilege default)
   */
  role: UserRole

  /**
   * Primary division, normalized from backend division names
   * ('P&I' → 'PI', 'H&M' → 'HM').
   * undefined when is_admin === true (admin has access to all divisions).
   */
  division?: Division

  /**
   * Raw division name strings exactly as the backend returns them.
   * e.g. ['P&I'] or null (when is_admin).
   * Preserved for future multi-division UI; not used by permission system.
   */
  divisions?: string[] | null

  /**
   * Raw role name strings exactly as the backend returns them.
   * e.g. ['Editor'] or null (when no roles assigned).
   * Backend roles are free-form CRUD records — these may not match the
   * fixed UserRole enum. Use `role` (normalized) for permission checks.
   */
  roles?: string[] | null

  avatar?:   string
  createdAt: string
}

export interface AuthSession {
  user:        AuthUser
  accessToken: string
  expiresAt:   string
}

export interface LoginCredentials {
  email:    string
  password: string
}

/**
 * Payload for POST /auth/register (AdminOnly).
 * Confirmed against backend registerSchema in auth.validation.ts.
 * NOTE: `divisions` and `roles` here are UUID arrays (IDs), NOT name strings.
 * This differs from AuthUser.divisions/roles which are name strings returned
 * at login. Relevant for the Users/Admin module (future priority #2).
 */
export interface RegisterCredentials {
  fullname:   string
  email:      string
  password:   string
  phone?:     string
  is_admin?:  boolean
  divisions?: string[]   // division UUIDs
  roles?:     string[]   // role UUIDs
}

// ═══════════════════════════════════════════════════════════════
// BACKEND RESPONSE SHAPES  — confirmed from backend source code
// ppmi-workflow-backend-main/src/auth/auth.service.ts
// ppmi-workflow-backend-main/src/common/types/global.type.ts
// ═══════════════════════════════════════════════════════════════

/**
 * The `data` field inside POST /auth/login response (HTTP 201).
 *
 * Full response envelope:
 *   { success: true, status_code: 201, data: BackendLoginData }
 *
 * Confirmed return value from auth.service.ts login():
 *   { id, fullname, email, is_admin,
 *     divisions: string[]|null,   ← division NAMEs, null when is_admin
 *     roles:     string[]|null,   ← role NAMEs, null when empty
 *     access_token }
 *
 * client.ts post<T>() returns the full envelope, so callers receive
 * { success, status_code, data: BackendLoginData }.
 */
export interface BackendLoginData {
  id:           string
  fullname:     string
  email:        string
  is_admin:     boolean
  divisions:    string[] | null
  roles:        string[] | null
  access_token: string
}

export interface BackendLoginResponse {
  success:     boolean
  status_code: number
  data:        BackendLoginData
}

/**
 * POST /auth/register (AdminOnly) returns only { id, email } of the
 * newly created user — no token, no login side-effect.
 * Confirmed from auth.service.ts register() prisma select clause.
 */
export interface BackendRegisterData {
  id:    string
  email: string
}

export interface BackendRegisterResponse {
  success:     boolean
  status_code: number
  data:        BackendRegisterData
}

/**
 * Decoded JWT payload.
 *
 * Confirmed claims from auth.service.ts jwtService.signAsync({...}):
 *   { id, is_admin, fullname, divisions, roles }
 * Plus standard JWT claims added by jwtService:
 *   { iat, exp }   (exp = iat + 6h per app.module.ts signOptions)
 *
 * NOTE: `email` is NOT a JWT claim. getMe() falls back to an empty
 * string for email when reconstructing from JWT (no cache available).
 */
export interface BackendJwtPayload {
  id:        string
  is_admin:  boolean
  fullname:  string
  divisions: string[] | null
  roles:     string[] | null
  iat?:      number
  exp?:      number
}