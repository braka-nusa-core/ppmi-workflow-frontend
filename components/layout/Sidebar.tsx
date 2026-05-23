'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  Package,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  BarChart2,
  Users,
  Shield,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
  badge?: string | number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_CONFIG: NavGroup[] = [
  {
    label: '',
    items: [
      { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { label: 'Quotation Sheet', href: '/dashboard/qs',       icon: FileText   },
      { label: 'Invoice',         href: '/dashboard/invoice',   icon: Receipt    },
      { label: 'Voucher',         href: '/dashboard/voucher',   icon: Wallet     },
      { label: 'Payment',         href: '/dashboard/payment',   icon: CreditCard },
      { label: 'Shipment',        href: '/dashboard/shipment',  icon: Package    },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payment Monitor', href: '/dashboard/finance',              icon: DollarSign   },
      { label: 'Overdue',         href: '/dashboard/finance/overdue',      icon: AlertTriangle, badge: 6 },
      { label: 'Verification',    href: '/dashboard/finance/verification', icon: CheckSquare  },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users',       href: '/dashboard/admin/users',    icon: Users    },
      { label: 'Permissions', href: '/dashboard/admin/roles',    icon: Shield   },
      { label: 'Settings',    href: '/dashboard/admin/settings', icon: Settings },
    ],
  },
]

function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      className={cn('nav-item group', isActive && 'active')}
    >
      <item.icon
        size={15}
        className={cn(
          'flex-shrink-0 transition-colors duration-100',
          isActive ? 'text-[#123d6b]' : 'text-[#7a8fa3] group-hover:text-[#3a5068]'
        )}
        strokeWidth={1.7}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className={cn(
          'ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
          isActive ? 'bg-[#123d6b] text-white' : 'bg-[#fdecea] text-[#8c1f1f]'
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="app-sidebar flex flex-col">
      <nav className="py-2 flex-1">
        {NAV_CONFIG.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.label && (
              <p className="nav-group-label">{group.label}</p>
            )}
            {group.items.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
            {groupIdx < NAV_CONFIG.length - 1 && group.label && (
              <div className="divider mx-4 my-2" />
            )}
          </div>
        ))}
      </nav>

      {/* System info */}
      <div className="px-4 py-3 border-t border-[#edf1f5]">
        <p className="text-[10px] text-[#7a8fa3]">PPMI Flow v0.1.0</p>
        <p className="text-[10px] text-[#b5cede]">Internal System</p>
      </div>
    </aside>
  )
}
