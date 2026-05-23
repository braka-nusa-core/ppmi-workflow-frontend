import type { UserRole, Division } from './workflow'

// ─── Auth User ───────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  division?: Division   // null = access to all divisions (admin/finance)
  avatar?: string
  createdAt: string
}

// ─── Auth Session ────────────────────────────────────────────────
export interface AuthSession {
  user: AuthUser
  accessToken: string
  expiresAt: string
}

// ─── Login Credentials ───────────────────────────────────────────
export interface LoginCredentials {
  email: string
  password: string
}

// ─── Login Response ──────────────────────────────────────────────
export interface LoginResponse {
  session: AuthSession
  message: string
}

// ─── Permission Check ────────────────────────────────────────────
export interface PermissionCheck {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canVerify: boolean
  canExport: boolean
  canManageUsers: boolean
  canViewFinance: boolean
}
