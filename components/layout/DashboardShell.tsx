// FILE: components/layout/DashboardShell.tsx
// Client wrapper for the dashboard grid so the sidebar's collapsed state can
// drive the grid columns (data-sidebar attribute → globals.css). Navigation,
// role/permission filtering and the topbar are unchanged and still rendered
// by the same components.

'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

const STORAGE_KEY = 'ppmi.sidebar.collapsed'
const AUTO_COLLAPSE_BELOW = 1100 // px — only when the user has never chosen

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // Resolve after mount so server and first client render match.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      setCollapsed(saved !== null ? saved === '1' : window.innerWidth < AUTO_COLLAPSE_BELOW)
    } catch { /* storage unavailable: stay expanded */ }
  }, [])

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try { window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch { /* best effort */ }
      return next
    })
  }, [])

  return (
    <div className="app-shell" data-sidebar={collapsed ? 'collapsed' : 'expanded'}>
      <Topbar />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="app-content">{children}</main>
    </div>
  )
}