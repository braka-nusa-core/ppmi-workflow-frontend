// ═══════════════════════════════════════════════════════════════
// BACKEND RESPONSE SHAPES — confirmed from backend source code
// ppmi-workflow-backend-2/src/app.controller.ts, app.service.ts
// (POST /auth/login, GET /profile)
//
// NOTE ON `_id`: the backend registers a global TransformIdInterceptor
// (src/common/interceptors/transform-id.interceptor.ts) that recursively
// renames every `id` key to `_id` in every JSON response. This is a real
// wire-format detail, not a typo — every object below uses `_id`.
//
// Response envelope (src/common/interceptors/response.interceptor.ts):
//   success responses:  { success: true, message?: string, data: T }
//   error responses:    { success: false, error: { name, message, details? } }
// There is no `status_code` field inside the body (only the HTTP status).
// ═══════════════════════════════════════════════════════════════

export interface BackendOrganizationUnit {
  name:   string
  type:   'DIVISION' | 'DEPARTMENT'
  parent: { name: string; type: 'DIVISION' | 'DEPARTMENT' } | null
}

/** `data` inside POST /auth/login (HTTP 201). Confirmed from AppService.login(). */
export interface BackendLoginData {
  _id:              string
  fullname:         string
  email:            string
  organizationUnit: string | null   // just the unit NAME at login time — full detail comes from /profile
  accessToken:      string
}

export interface BackendLoginResponse {
  success: boolean
  data:    BackendLoginData
}

/**
 * `data` inside GET /profile. Confirmed from AppService.profile().
 *
 * `permissions` is `null` when the user's role is 'SUPERADMIN' (meaning:
 * unrestricted — do not treat null as "no permissions").
 * Otherwise it's a flat list of "resource:action" strings, e.g.
 * "quotation:approve". Permissions are resolved from the user's
 * organizationUnit — and if that unit is a DEPARTMENT, from its
 * parent DIVISION's permissions (departments inherit from their division).
 */
export interface BackendProfileData {
  _id:              string
  fullname:         string
  email:            string
  phone:            string | null
  role:             'SUPERADMIN' | 'USER'
  createdAt:        string
  updatedAt:        string
  organizationUnit: BackendOrganizationUnit | null
  permissions:      string[] | null
}

// ═══════════════════════════════════════════════════════════════
// FRONTEND DOMAIN MODEL
// ═══════════════════════════════════════════════════════════════

export interface OrganizationUnit {
  name:   string
  type:   'DIVISION' | 'DEPARTMENT'
  parent: { name: string; type: 'DIVISION' | 'DEPARTMENT' } | null
}

/**
 * Authenticated user, shaped directly from GET /profile.
 * Deliberately preserves the backend's own concepts (role,
 * organizationUnit hierarchy, permission strings) instead of flattening
 * them into an invented role enum. Anything that needs a yes/no answer
 * (e.g. "is this user Supervisor Teknik?") should go through the helpers
 * in lib/permissions.ts rather than re-deriving it ad hoc.
 */
export interface AuthUser {
  id:               string
  name:             string
  email:            string
  phone:            string | null
  role:             'SUPERADMIN' | 'USER'
  isSuperAdmin:     boolean
  organizationUnit: OrganizationUnit | null
  /** null = unrestricted (SUPERADMIN). Otherwise "resource:action" strings. */
  permissions:      string[] | null
  createdAt:        string
}

export interface AuthSession {
  user:        AuthUser
  accessToken: string
}

export interface LoginCredentials {
  email:    string
  password: string
}