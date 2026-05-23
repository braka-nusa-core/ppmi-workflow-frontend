import { PERMISSIONS, type RolePermissions } from '@/config/permissions'
import type { UserRole } from '@/types/workflow'

/**
 * Check if a role has a specific permission
 */
export function can(role: UserRole, permission: keyof RolePermissions): boolean {
  return PERMISSIONS[role]?.[permission] ?? false
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): RolePermissions {
  return PERMISSIONS[role]
}

/**
 * Check if role is at least a given role level
 * Order: viewer < editor < finance < administrator
 */
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
