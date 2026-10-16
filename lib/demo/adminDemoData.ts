// FILE: lib/demo/adminDemoData.ts
// ═══════════════════════════════════════════════════════════════
// DEMO DATA — ADMINISTRATION OVERVIEW (NOT REAL ACCOUNTS)
//
// Clearly fictional users (reserved ".example" e-mail domain) arranged
// in the organisation structure the frontend already understands
// (see lib/permissions.ts): division "Teknik" with departments
// "Supervisor Teknik", "H&M", "P&I", "Cargo", plus "Finance" and
// "Administration". Names match the staff shown as creators/approvers in
// the demo documents (lib/demo/registry.ts).
//
// The permission strings are the ones the quotation screens actually
// check (can('quotation', …)); WHICH unit holds WHICH string below is
// illustrative demo data — it is NOT read from the live system.
// The legacy role matrix is the real frontend configuration
// (config/permissions.ts), shown unchanged.
// ═══════════════════════════════════════════════════════════════

import { PERMISSIONS, type RolePermissions } from '@/config/permissions'
import type { UserRole } from '@/types/workflow'

const DAY = 86_400_000

export type DemoUnitType = 'DIVISION' | 'DEPARTMENT'

export interface DemoOrgUnit {
  name:    string
  type:    DemoUnitType
  parent:  string | null
  members: number
}

export interface DemoAdminUser {
  id:         string
  fullname:   string
  email:      string
  role:       'SUPERADMIN' | 'USER'
  unit:       string
  parentUnit: string | null
  status:     'Active' | 'Inactive'
  lastActive: string   // ISO
}

export interface DemoPermissionColumn { key: string; label: string; description: string }

export interface DemoAdminOverview {
  users:           DemoAdminUser[]
  units:           DemoOrgUnit[]
  permissionCols:  DemoPermissionColumn[]
  /** unit name → granted permission strings (SUPERADMIN is unrestricted and not listed). */
  unitPermissions: Record<string, string[]>
  roleMatrix:      { role: UserRole; permissions: RolePermissions }[]
  roleFlags:       { key: keyof RolePermissions; label: string }[]
  configuration:   { label: string; value: string }[]
  stats:           { users: number; active: number; units: number; superAdmins: number }
}

const PERMISSION_COLS: DemoPermissionColumn[] = [
  { key: 'quotation:read',                 label: 'Read',             description: 'View quotation sheets' },
  { key: 'quotation:create',               label: 'Create',           description: 'Create quotation sheets' },
  { key: 'quotation:update',               label: 'Update',           description: 'Edit draft or revision quotations' },
  { key: 'quotation:submit',               label: 'Submit',           description: 'Submit for Supervisor Teknik approval' },
  { key: 'quotation:approve',              label: 'Approve',          description: 'Approve, reject or request revision' },
  { key: 'quotation:send-to-insurance',    label: 'Send to insurer',  description: 'Send an approved quotation to the insurer' },
  { key: 'quotation:record-insurer-review', label: 'Insurer review',  description: 'Record the insurer decision' },
]

const ROLE_FLAGS: { key: keyof RolePermissions; label: string }[] = [
  { key: 'canCreate', label: 'Create' }, { key: 'canEdit', label: 'Edit' }, { key: 'canDelete', label: 'Delete' },
  { key: 'canVerify', label: 'Verify' }, { key: 'canUpdatePayment', label: 'Record payment' },
  { key: 'canExport', label: 'Export' }, { key: 'canViewFinance', label: 'View finance' },
  { key: 'canViewAdmin', label: 'View admin' }, { key: 'canManageUsers', label: 'Manage users' },
  { key: 'canManageRoles', label: 'Manage roles' },
]

const UNIT_PERMISSIONS: Record<string, string[]> = {
  'Supervisor Teknik': ['quotation:read', 'quotation:update', 'quotation:approve', 'quotation:send-to-insurance', 'quotation:record-insurer-review'],
  'H&M':               ['quotation:read', 'quotation:create', 'quotation:update', 'quotation:submit'],
  'P&I':               ['quotation:read', 'quotation:create', 'quotation:update', 'quotation:submit'],
  'Cargo':             ['quotation:read', 'quotation:create', 'quotation:update', 'quotation:submit'],
  'Finance':           ['quotation:read'],
  'Administration':    ['quotation:read'],
}

// [name, role, unit, parent, status, last-active days ago]
const USERS: [string, DemoAdminUser['role'], string, string | null, DemoAdminUser['status'], number][] = [
  ['Bagus Santoso',   'SUPERADMIN', 'Administration',    null,     'Active',   0],
  ['Agus Prasetyo',   'USER',       'Supervisor Teknik', 'Teknik', 'Active',   0],
  ['Dewi Anggraini',  'USER',       'P&I',               'Teknik', 'Active',   0],
  ['Rina Kusuma',     'USER',       'H&M',               'Teknik', 'Active',   1],
  ['Yusuf Hidayat',   'USER',       'Cargo',             'Teknik', 'Active',   2],
  ['Hendra Wijaya',   'USER',       'Finance',           null,     'Active',   0],
  ['Siti Maharani',   'USER',       'Finance',           null,     'Active',   1],
  ['Eko Wahyudi',     'USER',       'Finance',           null,     'Inactive', 64],
]

const slug = (name: string) => name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')

export function getDemoAdminOverview(now: Date = new Date()): DemoAdminOverview {
  const users: DemoAdminUser[] = USERS.map(([fullname, role, unit, parentUnit, status, ago], i) => ({
    id: `demo-user-${String(i + 1).padStart(2, '0')}`, fullname, email: `${slug(fullname)}@ppmi.example`,
    role, unit, parentUnit, status, lastActive: new Date(now.getTime() - ago * DAY).toISOString(),
  }))

  const count = (unit: string) => users.filter((u) => u.unit === unit).length
  const units: DemoOrgUnit[] = [
    { name: 'Teknik',            type: 'DIVISION',   parent: null,     members: users.filter((u) => u.parentUnit === 'Teknik').length },
    { name: 'Supervisor Teknik', type: 'DEPARTMENT', parent: 'Teknik', members: count('Supervisor Teknik') },
    { name: 'H&M',               type: 'DEPARTMENT', parent: 'Teknik', members: count('H&M') },
    { name: 'P&I',               type: 'DEPARTMENT', parent: 'Teknik', members: count('P&I') },
    { name: 'Cargo',             type: 'DEPARTMENT', parent: 'Teknik', members: count('Cargo') },
    { name: 'Finance',           type: 'DIVISION',   parent: null,     members: count('Finance') },
    { name: 'Administration',    type: 'DIVISION',   parent: null,     members: count('Administration') },
  ]

  return {
    users, units,
    permissionCols: PERMISSION_COLS,
    unitPermissions: UNIT_PERMISSIONS,
    roleMatrix: (Object.keys(PERMISSIONS) as UserRole[]).map((role) => ({ role, permissions: PERMISSIONS[role] })),
    roleFlags: ROLE_FLAGS,
    configuration: [
      { label: 'Organisation',          value: 'PT Pandi Proteksi Marine Indonesia' },
      { label: 'Business divisions',    value: 'P&I · H&M · Cargo' },
      { label: 'Currency',              value: 'IDR (Indonesian Rupiah)' },
      { label: 'Quotation workflow',    value: 'Draft → Supervisor Teknik approval → Insurance review → Policy issued' },
      { label: 'Downstream workflow',   value: 'Policy Placement → RFI → Voucher → Invoice → Incoming / Outgoing Payment → Shipment' },
      { label: 'Document prefixes',     value: 'POL · RFI · VCH · INV · PAY · AP · SHP' },
      { label: 'Application mode',      value: 'Demonstration — read-only, no changes are saved' },
    ],
    stats: {
      users: users.length, active: users.filter((u) => u.status === 'Active').length,
      units: units.length, superAdmins: users.filter((u) => u.role === 'SUPERADMIN').length,
    },
  }
}