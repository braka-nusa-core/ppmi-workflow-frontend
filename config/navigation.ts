import type { UserRole } from '@/types/workflow'

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

// Full nav — filtered at runtime by role
export const FULL_NAV_CONFIG: NavGroupConfig[] = [
  {
    label: '',
    items: [
      { label: 'Overview', href: '/dashboard/overview', iconName: 'LayoutDashboard' },
    ],
  },
  {
    label: 'P&I Division',
    items: [
      { label: 'Quotation Sheet', href: '/dashboard/pi/qs',       iconName: 'FileText' },
      { label: 'Invoice',         href: '/dashboard/pi/invoice',   iconName: 'Receipt'  },
      { label: 'Voucher',         href: '/dashboard/pi/voucher',   iconName: 'Wallet'   },
      { label: 'Payment',         href: '/dashboard/pi/payment',   iconName: 'CreditCard' },
      { label: 'Shipment',        href: '/dashboard/pi/shipment',  iconName: 'Package'  },
    ],
  },
  {
    label: 'H&M Division',
    items: [
      { label: 'Quotation Sheet', href: '/dashboard/hm/qs',       iconName: 'FileText' },
      { label: 'Invoice',         href: '/dashboard/hm/invoice',   iconName: 'Receipt'  },
      { label: 'Voucher',         href: '/dashboard/hm/voucher',   iconName: 'Wallet'   },
      { label: 'Payment',         href: '/dashboard/hm/payment',   iconName: 'CreditCard' },
      { label: 'Shipment',        href: '/dashboard/hm/shipment',  iconName: 'Package'  },
    ],
  },
  {
    label: 'Finance',
    requiredRole: ['finance', 'administrator'],
    items: [
      { label: 'Payment Monitor', href: '/dashboard/finance',              iconName: 'DollarSign'  },
      { label: 'Overdue',         href: '/dashboard/finance/overdue',      iconName: 'AlertTriangle', badge: 'overdue' },
      { label: 'Verification',    href: '/dashboard/finance/verification', iconName: 'CheckSquare' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports', href: '/dashboard/reports', iconName: 'BarChart2' },
    ],
  },
  {
    label: 'Administration',
    requiredRole: ['administrator'],
    items: [
      { label: 'Users',       href: '/dashboard/admin/users',    iconName: 'Users'    },
      { label: 'Permissions', href: '/dashboard/admin/roles',    iconName: 'Shield'   },
      { label: 'Settings',    href: '/dashboard/admin/settings', iconName: 'Settings' },
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
