// FILE: lib/demo/readOnly.ts
// ═══════════════════════════════════════════════════════════════
// DEMO READ-ONLY POLICY — single source of truth (pure, no side effects)
//
// Used by three enforcement layers, all active ONLY when
// NEXT_PUBLIC_DEMO_MODE === 'true' (see lib/demo/demoMode.ts):
//
//   1. UI      hooks/useRole.ts          → mutation permission flags
//                                          (canCreate/canEdit/…) are false,
//                                          so downstream pages hide or
//                                          disable their mutation controls.
//   2. Route   components/demo/DemoReadOnlyGate.tsx → shows the Demo /
//                                          Read-only banner on downstream
//                                          pages and replaces /new and
//                                          /:id/edit forms with a notice.
//   3. Network lib/demo/readOnlyGuard.ts → rejects any non-GET request to
//                                          a downstream API before it is
//                                          sent (backstop for handlers).
//
// QS / quotation routes and endpoints (/quotations, /pni, /hm/*, /cargo/*,
// /quotation-references, /auth, …) are deliberately NOT listed here and
// are never affected.
// ═══════════════════════════════════════════════════════════════

import { ROUTES } from '@/config/routes'
import type { RolePermissions } from '@/config/permissions'

/** Downstream page areas that are demo / read-only in demo mode. */
export const DEMO_READ_ONLY_PATH_PREFIXES: readonly string[] = [
  ROUTES.policy.list,
  ROUTES.rfi.list,
  ROUTES.voucher.list,
  ROUTES.invoice.list,
  ROUTES.payment.list,
  ROUTES.outgoingPayment.list,
  ROUTES.shipment.list,
  ROUTES.finance.monitor,
  ROUTES.reports,
  ROUTES.admin,
]

/**
 * Downstream API areas whose non-GET requests are blocked in demo mode.
 * A trailing "/" means "anything under this prefix"; otherwise the entry
 * matches the path itself and anything below it. Mirrors the BASE
 * constants in lib/api/{policy,rfi,voucher,invoice,payment,
 * outgoingPayment,shipment}.ts — keep in sync if a new downstream
 * module is added.
 */
export const DEMO_READ_ONLY_API_PREFIXES: readonly string[] = [
  '/api/v1/',     // policies, request-for-invoices
  '/finance/',    // /finance/ar/payments, /finance/ap/payments
  '/vouchers',
  '/invoices',
  '/shipments',
  // Administration (users, roles, permissions, org units, settings) — read-only in demo
  '/users',
  '/roles',
  '/permissions',
  '/organization-units',
  '/admin',
  '/settings',
]

/** Mutation-capable flags of the legacy useRole() permission model. */
export const DEMO_LOCKED_PERMISSIONS: ReadonlySet<keyof RolePermissions> = new Set<keyof RolePermissions>([
  'canCreate',
  'canEdit',
  'canDelete',
  'canVerify',
  'canUpdatePayment',
  'canManageUsers',
  'canManageRoles',
])

export const DEMO_READ_ONLY_MESSAGE = 'Demo mode is read-only — changes are disabled.'

export function isDemoLockedPermission(permission: keyof RolePermissions): boolean {
  return DEMO_LOCKED_PERMISSIONS.has(permission)
}

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

/** The matching downstream page prefix for a pathname, or null. */
export function getDemoReadOnlyPrefix(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const p = normalizePath(pathname)
  return (
    DEMO_READ_ONLY_PATH_PREFIXES.find((prefix) => p === prefix || p.startsWith(prefix + '/')) ?? null
  )
}

export function isDemoReadOnlyPath(pathname: string | null | undefined): boolean {
  return getDemoReadOnlyPrefix(pathname) !== null
}

/** True for `<module>/…/new` and `<module>/…/<id>/edit` of a downstream demo area. */
export function isDemoMutationPath(pathname: string | null | undefined): boolean {
  const prefix = getDemoReadOnlyPrefix(pathname)
  if (!prefix || !pathname) return false
  const rest = normalizePath(pathname).slice(prefix.length)
  return /(^|\/)new$/.test(rest) || /\/edit$/.test(rest)
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function toPath(url: string): string {
  let path = url
  if (/^https?:\/\//i.test(path)) {
    try { path = new URL(path).pathname } catch { /* keep as-is */ }
  }
  path = path.split(/[?#]/)[0]
  return path.startsWith('/') ? path : '/' + path
}

/** True when a request would mutate a downstream API (and must be blocked in demo mode). */
export function isDemoBlockedRequest(method: string | undefined, url: string | undefined): boolean {
  if (!url) return false
  if (SAFE_METHODS.has((method ?? 'get').toUpperCase())) return false
  const path = normalizePath(toPath(url))
  return DEMO_READ_ONLY_API_PREFIXES.some((prefix) =>
    prefix.endsWith('/')
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(prefix + '/')
  )
}