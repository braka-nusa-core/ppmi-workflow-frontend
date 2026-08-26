import type { UserRole } from '@/types/workflow'
import { ROUTES } from '@/config/routes'

export interface NavItemConfig {
  label: string
  href: string
  iconName: string
  badge?: string
  requiredPermission?: string
}

export interface NavGroupConfig {
  label: string
  items: NavItemConfig[]
  requiredRole?: UserRole[]
}

// Full nav — filtered at runtime by role. Hrefs sourced from config/routes.ts
// (the single source of truth for route paths); this file only adds
// UI concerns (labels, icons, grouping, role/permission gating).
export const FULL_NAV_CONFIG: NavGroupConfig[] = [
  {
    label: '',
    items: [
      { label: 'Overview', href: ROUTES.overview, iconName: 'LayoutDashboard' },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { label: 'Quotation Sheet', href: ROUTES.qs.list,       iconName: 'FileText' },
      { label: 'Policy Placement', href: ROUTES.policy.list,  iconName: 'Shield'   },
      { label: 'Request For Invoice', href: ROUTES.rfi.list, iconName: 'ClipboardList' },
      { label: 'Invoice',         href: ROUTES.invoice.list,  iconName: 'Receipt'  },
      { label: 'Voucher',         href: ROUTES.voucher.list,  iconName: 'Wallet'   },
      { label: 'Payment',         href: ROUTES.payment.list,  iconName: 'CreditCard' },
      { label: 'Outgoing Payment', href: ROUTES.outgoingPayment.list, iconName: 'ArrowUpCircle' },
      { label: 'Shipment',        href: ROUTES.shipment.list, iconName: 'Package'  },
    ],
  },
  {
    label: 'Finance',
    requiredRole: ['finance', 'administrator'],
    items: [
      { label: 'Payment Monitor', href: ROUTES.finance.monitor,      iconName: 'DollarSign'  },
      { label: 'Overdue',         href: ROUTES.finance.overdue,      iconName: 'AlertTriangle', badge: 'overdue' },
      { label: 'Verification',    href: ROUTES.finance.verification, iconName: 'CheckSquare' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports', href: ROUTES.reports, iconName: 'BarChart2' },
    ],
  },
  {
    label: 'Administration',
    requiredRole: ['administrator'],
    items: [
      { label: 'Administration', href: ROUTES.admin, iconName: 'Shield' },
    ],
  },
]

// Filter nav by user role
export function getNavForRole(role: UserRole): NavGroupConfig[] {
  return FULL_NAV_CONFIG.filter((group) => {
    if (!group.requiredRole) return true
    return group.requiredRole.includes(role)
  })
}