'use client'

import { Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const DIVISIONS = ['P&I', 'H&M'] as const
type Division = typeof DIVISIONS[number]

export function Topbar() {
  const [activeDivision, setActiveDivision] = useState<Division>('P&I')
  const [divisionOpen, setDivisionOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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

          {/* Separator */}
          <div className="w-px h-5 bg-[#e2e5e9] ml-2" />

          {/* Division Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setDivisionOpen(!divisionOpen)
                setUserMenuOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 px-3 h-7 rounded border text-xs font-medium',
                'transition-colors duration-100',
                'bg-[#e8f4fd] border-[#b3c9df] text-[#1e4a70]',
                'hover:bg-[#d9eaf6] hover:border-[#7fa3c4]'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e4a70] flex-shrink-0" />
              {activeDivision}
              <ChevronDown
                size={12}
                className={cn('transition-transform duration-150', divisionOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {divisionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[99]"
                    onClick={() => setDivisionOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.1, ease: [0.2, 0, 0, 1] }}
                    className="absolute left-0 top-full mt-1 z-[100] bg-white border border-[#e2e5e9] rounded-md shadow-md min-w-[120px] py-1 overflow-hidden"
                  >
                    {DIVISIONS.map((div) => (
                      <button
                        key={div}
                        onClick={() => {
                          setActiveDivision(div)
                          setDivisionOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs font-medium',
                          'flex items-center gap-2',
                          'transition-colors duration-75',
                          activeDivision === div
                            ? 'bg-[#e8f4fd] text-[#1e4a70]'
                            : 'text-[#4d5966] hover:bg-[#f1f3f5]'
                        )}
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          activeDivision === div ? 'bg-[#1e4a70]' : 'bg-[#ced3d9]'
                        )} />
                        {div} Division
                        {activeDivision === div && (
                          <span className="ml-auto text-[10px] text-[#1e4a70]">Active</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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
              onClick={() => {
                setUserMenuOpen(!userMenuOpen)
                setDivisionOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 px-2 h-8 rounded',
                'text-[#4d5966] hover:text-[#232b34] hover:bg-[#f1f3f5]',
                'transition-colors duration-100'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-[#1e4a70] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-semibold">AD</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-[#232b34] leading-tight">Administrator</span>
                <span className="text-[10px] text-[#9aa3ad] leading-tight">admin@ppmi.co.id</span>
              </div>
              <ChevronDown
                size={12}
                className={cn('text-[#9aa3ad] transition-transform duration-150', userMenuOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[99]"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.1, ease: [0.2, 0, 0, 1] }}
                    className="absolute right-0 top-full mt-1 z-[100] bg-white border border-[#e2e5e9] rounded-md shadow-md w-48 py-1 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-[#e2e5e9]">
                      <p className="text-xs font-medium text-[#232b34]">Administrator</p>
                      <p className="text-[10px] text-[#9aa3ad]">admin@ppmi.co.id</p>
                    </div>
                    <button className="w-full text-left px-3 py-2 text-xs text-[#4d5966] hover:bg-[#f1f3f5] flex items-center gap-2 transition-colors duration-75">
                      <User size={13} />
                      Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs text-[#4d5966] hover:bg-[#f1f3f5] flex items-center gap-2 transition-colors duration-75">
                      <Settings size={13} />
                      Settings
                    </button>
                    <div className="h-px bg-[#e2e5e9] my-1" />
                    <button className="w-full text-left px-3 py-2 text-xs text-[#9b2020] hover:bg-[#fdecea] flex items-center gap-2 transition-colors duration-75">
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
