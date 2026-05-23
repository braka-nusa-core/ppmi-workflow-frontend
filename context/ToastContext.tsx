'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { generateId } from '@/lib/utils'
import type { Toast, ToastType } from '@/components/feedback/ToastContainer'

// ─── Context Shape ───────────────────────────────────────────────
interface ToastContextValue {
  toasts:  Toast[]
  toast:   (type: ToastType, title: string, message?: string, duration?: number) => void
  dismiss: (id: string) => void
  success: (title: string, message?: string) => void
  error:   (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info:    (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = generateId()
      setToasts((prev) => [
        ...prev.slice(-4), // Keep max 5 toasts
        { id, type, title, message, duration },
      ])
    },
    []
  )

  const success = useCallback((title: string, message?: string) => toast('success', title, message), [toast])
  const error   = useCallback((title: string, message?: string) => toast('error',   title, message), [toast])
  const warning = useCallback((title: string, message?: string) => toast('warning', title, message), [toast])
  const info    = useCallback((title: string, message?: string) => toast('info',    title, message), [toast])

  const value: ToastContextValue = { toasts, toast, dismiss, success, error, warning, info }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
