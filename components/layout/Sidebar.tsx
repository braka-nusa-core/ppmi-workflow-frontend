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
  Shield,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/useRole'
import { getNavForRole, type NavItemConfig } from '@/config/navigation'

// Maps config/navigation.ts's iconName strings to actual icon components.
const ICON_MAP: Record<string, LucideIcon> = {
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
  Shield,
  ClipboardList,
}

function SidebarNavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = ICON_MAP[item.iconName] ?? FileText

  return (
    <Link
      href={item.href}
      className={cn('nav-item group', isActive && 'active')}
    >
      <Icon
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
  const { role } = useRole()
  const navGroups = role ? getNavForRole(role) : []

  return (
    <aside className="app-sidebar flex flex-col">
      <nav className="py-2 flex-1">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.label && (
              <p className="nav-group-label">{group.label}</p>
            )}
            {group.items.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
            {groupIdx < navGroups.length - 1 && group.label && (
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