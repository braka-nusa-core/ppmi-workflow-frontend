'use client'

import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

// ─── Single Action ───────────────────────────────────────────────
export interface RowAction {
  label:    string
  icon?:    React.ReactNode
  onClick:  () => void
  disabled?: boolean
  danger?:  boolean
  hidden?:  boolean
}

// ─── Inline icon actions (≤ 3 actions) ──────────────────────────
interface TableActionsProps {
  onView?:   () => void
  onEdit?:   () => void
  onDelete?: () => void
  extra?:    RowAction[]
  disabled?: boolean
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  extra = [],
  disabled,
}: TableActionsProps) {
  const actions: RowAction[] = [
    onView   && { label: 'View',   icon: <Eye size={14} />,    onClick: onView,   danger: false },
    onEdit   && { label: 'Edit',   icon: <Pencil size={14} />, onClick: onEdit,   danger: false },
    ...extra,
    onDelete && { label: 'Delete', icon: <Trash2 size={14} />, onClick: onDelete, danger: true  },
  ].filter(Boolean) as RowAction[]

  if (actions.length === 0) return null

  // ≤ 3 actions: show inline icon buttons
  if (actions.length <= 3) {
    return (
      <div className="flex items-center justify-end gap-0.5">
        {actions.map((action) => (
          !action.hidden && (
            <Tooltip key={action.label} content={action.label} placement="top">
              <button
                onClick={(e) => { e.stopPropagation(); action.onClick() }}
                disabled={disabled || action.disabled}
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded',
                  'transition-colors duration-100',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  action.danger
                    ? 'text-[#9aa3ad] hover:text-[#9b2020] hover:bg-[#fdecea]'
                    : 'text-[#9aa3ad] hover:text-[#232b34] hover:bg-[#f1f3f5]'
                )}
              >
                {action.icon}
              </button>
            </Tooltip>
          )
        ))}
      </div>
    )
  }

  // > 3 actions: collapse into dropdown
  return <DropdownActions actions={actions} disabled={disabled} />
}

// ─── Dropdown for 4+ actions ─────────────────────────────────────
function DropdownActions({
  actions,
  disabled,
}: {
  actions: RowAction[]
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded',
          'text-[#9aa3ad] hover:text-[#232b34] hover:bg-[#f1f3f5]',
          'transition-colors duration-100',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute right-0 top-full mt-1 z-[100]',
              'bg-white border border-[#e2e5e9] rounded-md shadow-md',
              'min-w-[140px] py-1 overflow-hidden'
            )}
          >
            {actions.filter((a) => !a.hidden).map((action) => (
              <button
                key={action.label}
                onClick={(e) => { e.stopPropagation(); setOpen(false); action.onClick() }}
                disabled={action.disabled}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium',
                  'flex items-center gap-2',
                  'transition-colors duration-75',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  action.danger
                    ? 'text-[#9b2020] hover:bg-[#fdecea]'
                    : 'text-[#4d5966] hover:bg-[#f1f3f5]'
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
