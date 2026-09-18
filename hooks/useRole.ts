import { useAuth } from '@/context/AuthContext'
import { can, isAdmin, isFinance, isAtLeast } from '@/lib/permissions'
import type { RolePermissions } from '@/config/permissions'
import type { UserRole } from '@/types/workflow'

// ─── Legacy role bridge ──────────────────────────────────────────
// TEMPORARY COMPATIBILITY SHIM. The backend this app now authenticates
// against only exposes `role: 'SUPERADMIN' | 'USER'` — it has no concept
// of 'viewer' / 'editor' / 'finance' / 'administrator'. That distinction
// used to come from the old backend's free-form `roles[]` field, which
// no longer exists.
//
// Invoice, Payment, Voucher, the legacy /qs pages, and the Overview
// dashboard still gate their UI on this 4-value enum, and none of them
// have a working counterpart in the new backend yet (it currently only
// implements /quotations) — so there is no truthful, real permission
// data to map them to. Rather than break those pages outright, this
// derives the closest honest approximation:
//   SUPERADMIN → 'administrator' (full access, matches old semantics)
//   USER       → 'editor'        (can create/edit; NOT finance or admin)
// This intentionally cannot distinguish Finance staff from Teknik staff
// today. Do not extend or "fix" this matrix — resolve it by migrating
// those modules to the real backend + permission model in their own
// phase, the same way QS is being migrated now. New work (the
// /quotations feature) must use useAuth().can(resource, action),
// isSupervisorTeknik(), and technicalDepartment() instead — never this.
function deriveLegacyRole(isSuperAdmin: boolean | undefined, hasUser: boolean): UserRole | null {
  if (!hasUser) return null
  return isSuperAdmin ? 'administrator' : 'editor'
}

// ─── useRole ─────────────────────────────────────────────────────
// Single hook for legacy permission/role checks in components that
// have not yet been migrated to the new backend's permission model.
export function useRole() {
  const { user } = useAuth()
  const role = deriveLegacyRole(user?.isSuperAdmin, !!user)

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