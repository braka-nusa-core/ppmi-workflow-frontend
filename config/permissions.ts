import type { UserRole } from '@/types/workflow'

// ─── Permission Actions ──────────────────────────────────────────
export interface RolePermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canVerify: boolean       // Finance verification
  canExport: boolean
  canManageUsers: boolean
  canManageRoles: boolean
  canViewFinance: boolean
  canUpdatePayment: boolean
  canViewAdmin: boolean
}

// ─── Role → Permission Matrix ────────────────────────────────────
export const PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: {
    canCreate:       false,
    canEdit:         false,
    canDelete:       false,
    canVerify:       false,
    canExport:       true,
    canManageUsers:  false,
    canManageRoles:  false,
    canViewFinance:  true,
    canUpdatePayment:false,
    canViewAdmin:    false,
  },
  editor: {
    canCreate:       true,
    canEdit:         true,
    canDelete:       false,
    canVerify:       false,
    canExport:       true,
    canManageUsers:  false,
    canManageRoles:  false,
    canViewFinance:  false,
    canUpdatePayment:false,
    canViewAdmin:    false,
  },
  finance: {
    canCreate:       false,
    canEdit:         true,
    canDelete:       false,
    canVerify:       true,
    canExport:       true,
    canManageUsers:  false,
    canManageRoles:  false,
    canViewFinance:  true,
    canUpdatePayment:true,
    canViewAdmin:    false,
  },
  administrator: {
    canCreate:       true,
    canEdit:         true,
    canDelete:       true,
    canVerify:       true,
    canExport:       true,
    canManageUsers:  true,
    canManageRoles:  true,
    canViewFinance:  true,
    canUpdatePayment:true,
    canViewAdmin:    true,
  },
}

// ─── Permission checker utility ──────────────────────────────────
export function getPermissions(role: UserRole): RolePermissions {
  return PERMISSIONS[role]
}

export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  return PERMISSIONS[role][permission]
}

// ─── Role display labels ─────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  viewer:        'Viewer',
  editor:        'Editor',
  finance:       'Finance',
  administrator: 'Administrator',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  viewer:        'View-only access to all modules and reports',
  editor:        'Create and update workflow documents (QS, Invoice, Voucher)',
  finance:       'Payment management, installment tracking, and finance verification',
  administrator: 'Full access including user and permission management',
}
