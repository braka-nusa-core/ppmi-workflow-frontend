'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const TOAST_COLORS: Record<ToastType, { icon: string; borderLeft: string }> = {
  success: { icon: 'text-[#1a6b3a]', borderLeft: 'border-l-[#1a6b3a]' },
  error:   { icon: 'text-[#9b2020]', borderLeft: 'border-l-[#9b2020]' },
  warning: { icon: 'text-[#7a4f00]', borderLeft: 'border-l-[#7a4f00]' },
  info:    { icon: 'text-[#1e4a70]', borderLeft: 'border-l-[#1e4a70]' },
}

// ─── Individual Toast Item ───────────────────────────────────────
function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast()
  const Icon = TOAST_ICONS[toast.type]
  const colors = TOAST_COLORS[toast.type]

  useEffect(() => {
    const duration = toast.duration ?? 4000
    const timer = setTimeout(() => dismiss(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, dismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className={cn(
        'toast border-l-[3px]',
        colors.borderLeft
      )}
    >
      <Icon size={16} className={cn('flex-shrink-0', colors.icon)} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#232b34] leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#4d5966] leading-tight">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="flex-shrink-0 text-[#9aa3ad] hover:text-[#4d5966] transition-colors duration-75"
      >
        <X size={13} />
      </button>
    </motion.div>
  )
}

// ─── Toast Container ─────────────────────────────────────────────
export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
