import { PERMISSIONS, type RolePermissions } from '@/config/permissions'
import type { UserRole } from '@/types/workflow'
import type { AuthUser } from '@/types/auth'

// ═══════════════════════════════════════════════════════════════
// NEW MODEL — real backend permission/org-unit checks
// Use these (via useAuth()) for anything touching the new
// /quotations backend. This is the source of truth going forward.
// ═══════════════════════════════════════════════════════════════

export type TechnicalDepartment = 'H&M' | 'P&I' | 'Cargo'

const TECHNICAL_DEPARTMENTS: TechnicalDepartment[] = ['H&M', 'P&I', 'Cargo']

/**
 * Check a real backend permission string ("resource:action").
 * `permissions === null` means the user is SUPERADMIN (unrestricted).
 * This is a UX convenience only — the backend re-checks every request
 * independently and remains the actual security boundary.
 */
export function hasPermission(
  user: AuthUser | null,
  resource: string,
  action: string
): boolean {
  if (!user) return false
  if (user.isSuperAdmin || user.permissions === null) return true
  return user.permissions.includes(`${resource}:${action}`)
}

/** True if the user's organization unit is exactly the given name. */
export function isInOrganizationUnit(user: AuthUser | null, unitName: string): boolean {
  return user?.organizationUnit?.name === unitName
}

/**
 * True if the user's `Supervisor Teknik` organization unit matches the
 * backend's own check (assertSupervisorTeknik in quotations.service.ts):
 * a DEPARTMENT literally named "Supervisor Teknik" under the "Teknik"
 * DIVISION, or SUPERADMIN.
 *
 * This mirrors the backend's identity check for UX purposes (e.g. hiding
 * approve/reject buttons). It is NOT what makes approval safe — the
 * backend enforces this independently on every approve/reject/
 * request-revision call regardless of what the frontend shows.
 */
export function isSupervisorTeknik(user: AuthUser | null): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true
  const unit = user.organizationUnit
  return (
    unit?.type === 'DEPARTMENT' &&
    unit.name === 'Supervisor Teknik' &&
    unit.parent?.type === 'DIVISION' &&
    unit.parent?.name === 'Teknik'
  )
}

/**
 * Returns the user's technical department (H&M / P&I / Cargo) if they
 * belong to one under the "Teknik" division, mirroring the backend's
 * getTechnicalUnitId check — otherwise null (including for
 * Supervisor Teknik, Finance, or any non-Teknik org unit).
 */
export function getTechnicalDepartment(user: AuthUser | null): TechnicalDepartment | null {
  const unit = user?.organizationUnit
  if (
    unit?.type === 'DEPARTMENT' &&
    unit.parent?.type === 'DIVISION' &&
    unit.parent?.name === 'Teknik' &&
    TECHNICAL_DEPARTMENTS.includes(unit.name as TechnicalDepartment)
  ) {
    return unit.name as TechnicalDepartment
  }
  return null
}

// ═══════════════════════════════════════════════════════════════
// LEGACY MODEL — kept only for modules still built against the
// old backend's flat role enum (Invoice, Payment, Voucher, the old
// /qs pages, and the Overview dashboard). None of these have a
// backend counterpart in the new system yet, so there is nothing
// truthful to migrate them to right now. See hooks/useRole.ts for
// how `role` is now derived (a documented, temporary bridge from
// the new AuthUser) rather than removed outright and breaking these
// pages. Do NOT use this matrix for any new /quotations work.
// ═══════════════════════════════════════════════════════════════

export function can(role: UserRole, permission: keyof RolePermissions): boolean {
  return PERMISSIONS[role]?.[permission] ?? false
}

export function getPermissions(role: UserRole): RolePermissions {
  return PERMISSIONS[role]
}

const ROLE_LEVEL: Record<UserRole, number> = {
  viewer:        1,
  editor:        2,
  finance:       3,
  administrator: 4,
}

export function isAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimum]
}

export function isAdmin(role: UserRole): boolean {
  return role === 'administrator'
}

export function isFinance(role: UserRole): boolean {
  return role === 'finance' || role === 'administrator'
}