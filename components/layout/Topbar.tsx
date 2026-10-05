'use client'

import { Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

// Two-letter initials from the authenticated user's full name.
function getInitials(name: string | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : ''
  return (first + last).toUpperCase() || '?'
}

export function Topbar() {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // The department shown here is read-only and comes from the account
  // returned by GET /profile (existing organizationUnit) — it is never
  // user-selectable and no technical department is invented for
  // accounts that have no organization unit (e.g. SUPERADMIN).
  const unitLabel = user?.organizationUnit?.name ?? null

  const displayName = user?.name ?? ''
  const displayEmail = user?.email ?? ''

  async function handleSignOut() {
    setUserMenuOpen(false)
    // Existing auth flow: clears the stored token, resets the user in
    // AuthContext and redirects to /auth/login.
    await logout()
  }

  return (
    <header className="app-topbar">
      <div className="flex items-center justify-between h-full px-5">

        {/* ── Left: Logo + Brand ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1e4a70] flex-shrink-0">
            <span className="text-white font-bold text-xs leading-none">PP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#232b34] leading-tight">PPMI Flow</span>
            <span className="text-[10px] text-[#9aa3ad] leading-tight">PT Pandi Proteksi Marine Indonesia</span>
          </div>

          {/* Organization unit indicator (read-only) */}
          {unitLabel && (
            <>
              <div className="w-px h-5 bg-[#e2e5e9] ml-2" />
              <div
                className={cn(
                  'flex items-center gap-2 px-3 h-7 rounded border text-xs font-medium select-none',
                  'bg-[#e8f4fd] border-[#b3c9df] text-[#1e4a70]'
                )}
                title="Your organization unit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e4a70] flex-shrink-0" />
                {unitLabel}
              </div>
            </>
          )}
        </div>

        {/* ── Right: Actions + User ──────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Notifications */}
          <button className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded',
            'text-[#9aa3ad] hover:text-[#232b34] hover:bg-[#f1f3f5]',
            'transition-colors duration-100'
          )}>
            <Bell size={16} />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#9b2020] rounded-full" />
          </button>

          {/* Settings */}
          <button className={cn(
            'flex items-center justify-center w-8 h-8 rounded',
            'text-[#9aa3ad] hover:text-[#232b34] hover:bg-[#f1f3f5]',
            'transition-colors duration-100'
          )}>
            <Settings size={16} />
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-[#e2e5e9] mx-1" />

          {/* User Menu */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((open) => !open)}
              className={cn(
                'flex items-center gap-2 px-2 h-8 rounded',
                'text-[#4d5966] hover:text-[#232b34] hover:bg-[#f1f3f5]',
                'transition-colors duration-100'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-[#1e4a70] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-semibold">{getInitials(displayName)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-[#232b34] leading-tight">{displayName}</span>
                <span className="text-[10px] text-[#9aa3ad] leading-tight">{displayEmail}</span>
              </div>
              <ChevronDown
                size={12}
                className={cn('text-[#9aa3ad] transition-transform duration-150', userMenuOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  {/* Click-outside layer: any click outside the menu closes it */}
                  <div
                    className="fixed inset-0 z-[99]"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.1, ease: [0.2, 0, 0, 1] }}
                    className="absolute right-0 top-full mt-1 z-[100] bg-white border border-[#e2e5e9] rounded-md shadow-md w-48 py-1 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-[#e2e5e9]">
                      <p className="text-xs font-medium text-[#232b34]">{displayName}</p>
                      <p className="text-[10px] text-[#9aa3ad]">{displayEmail}</p>
                    </div>

                    {/* No profile / settings route exists in the app yet —
                        shown disabled rather than as dead clickable items. */}
                    <button
                      type="button"
                      role="menuitem"
                      disabled
                      title="Profile page is not available yet"
                      className="w-full text-left px-3 py-2 text-xs text-[#4d5966] flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <User size={13} />
                      Profile
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled
                      title="Settings page is not available yet"
                      className="w-full text-left px-3 py-2 text-xs text-[#4d5966] flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <Settings size={13} />
                      Settings
                    </button>

                    <div className="h-px bg-[#e2e5e9] my-1" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-xs text-[#9b2020] hover:bg-[#fdecea] flex items-center gap-2 transition-colors duration-75"
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}