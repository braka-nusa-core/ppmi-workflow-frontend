import { useAuth } from '@/context/AuthContext'
import { can, isAdmin, isFinance, isAtLeast } from '@/lib/permissions'
import type { RolePermissions } from '@/config/permissions'
import type { UserRole } from '@/types/workflow'

// ─── useRole ─────────────────────────────────────────────────────
// Single hook for all permission/role checks in components
export function useRole() {
  const { user, role } = useAuth()

  return {
    role,
    // Specific permission checks
    can:           (permission: keyof RolePermissions) => role ? can(role, permission) : false,
    isAdmin:       () => role ? isAdmin(role) : false,
    isFinance:     () => role ? isFinance(role) : false,
    isEditor:      () => role === 'editor' || role === 'administrator',
    isViewer:      () => role === 'viewer',
    isAtLeast:     (minimum: UserRole) => role ? isAtLeast(role, minimum) : false,

    // Shorthand permission flags
    canCreate:        role ? can(role, 'canCreate')        : false,
    canEdit:          role ? can(role, 'canEdit')          : false,
    canDelete:        role ? can(role, 'canDelete')        : false,
    canVerify:        role ? can(role, 'canVerify')        : false,
    canExport:        role ? can(role, 'canExport')        : false,
    canManageUsers:   role ? can(role, 'canManageUsers')   : false,
    canViewFinance:   role ? can(role, 'canViewFinance')   : false,
    canUpdatePayment: role ? can(role, 'canUpdatePayment') : false,
    canViewAdmin:     role ? can(role, 'canViewAdmin')     : false,
  }
}
