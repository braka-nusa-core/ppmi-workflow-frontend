// FILE: components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type FocusEvent, type MouseEvent } from 'react'
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
  ArrowUpCircle,
  ChevronsLeft,
  ChevronsRight,
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
  ArrowUpCircle,
}

type TipHandler = (label: string | null, el?: HTMLElement) => void

function SidebarNavItem({ item, collapsed, onTip }: { item: NavItemConfig; collapsed: boolean; onTip: TipHandler }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = ICON_MAP[item.iconName] ?? FileText

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-describedby={collapsed ? 'sidebar-tooltip' : undefined}
      onMouseEnter={collapsed ? (e: MouseEvent<HTMLElement>) => onTip(item.label, e.currentTarget) : undefined}
      onFocus={collapsed ? (e: FocusEvent<HTMLElement>) => onTip(item.label, e.currentTarget) : undefined}
      onMouseLeave={collapsed ? () => onTip(null) : undefined}
      onBlur={collapsed ? () => onTip(null) : undefined}
      className={cn(
        'nav-item group',
        isActive && 'active',
        // collapsed: centred icon, plus a left bar so the active route stays obvious
        collapsed && 'relative justify-center !px-0',
        collapsed && isActive && 'shadow-[inset_3px_0_0_#123d6b]',
      )}
    >
      <Icon
        size={15}
        className={cn(
          'flex-shrink-0 transition-colors duration-100',
          isActive ? 'text-[#123d6b]' : 'text-[#7a8fa3] group-hover:text-[#3a5068]'
        )}
        strokeWidth={1.7}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {item.badge !== undefined && (
        <span
          className={cn(
            collapsed
              ? 'absolute top-0.5 right-1 w-2 h-2 rounded-full'
              : 'ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
            isActive ? 'bg-[#123d6b] text-white' : 'bg-[#fdecea] text-[#8c1f1f]'
          )}
          aria-label={collapsed ? `${item.badge} pending` : undefined}
        >
          {!collapsed && item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { role } = useRole()
  const navGroups = role ? getNavForRole(role) : []
  const [tip, setTip] = useState<{ label: string; top: number } | null>(null)
  const showTip: TipHandler = (label, el) => {
    if (!label || !el) return setTip(null)
    const r = el.getBoundingClientRect()
    setTip({ label, top: r.top + r.height / 2 })
  }

  return (
    <aside className="app-sidebar flex flex-col" aria-label="Main navigation">
      {onToggle && (
        <div className={cn('flex px-2 pt-2', collapsed ? 'justify-center' : 'justify-end')}>
          <button
            type="button"
            onClick={() => { setTip(null); onToggle() }}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded text-[#7a8fa3] hover:bg-[#f0f3f6] hover:text-[#3a5068]"
          >
            {collapsed ? <ChevronsRight size={15} strokeWidth={1.7} /> : <ChevronsLeft size={15} strokeWidth={1.7} />}
          </button>
        </div>
      )}
      <nav className="py-2 flex-1">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.label && !collapsed && (
              <p className="nav-group-label">{group.label}</p>
            )}
            {group.label && collapsed && groupIdx > 0 && <div className="divider mx-3 my-2" />}
            {group.items.map((item) => (
              <SidebarNavItem key={item.href} item={item} collapsed={collapsed} onTip={showTip} />
            ))}
            {groupIdx < navGroups.length - 1 && group.label && !collapsed && (
              <div className="divider mx-4 my-2" />
            )}
          </div>
        ))}
      </nav>

      {/* System info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-[#edf1f5]">
          <p className="text-[10px] text-[#7a8fa3]">PPMI Flow v0.1.0</p>
          <p className="text-[10px] text-[#b5cede]">Internal System</p>
        </div>
      )}
      {collapsed && tip && (
        <div id="sidebar-tooltip" role="tooltip" className="sidebar-tooltip" style={{ top: tip.top }}>{tip.label}</div>
      )}
    </aside>
  )
}