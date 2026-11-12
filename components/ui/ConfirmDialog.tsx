// FILE: components/ui/ConfirmDialog.tsx
// Custom confirmation dialog — PPMI design system compliant.
// Replaces native browser confirm() for consistent UX.

'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Escape key handler — must be called unconditionally
  React.useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onCancel])

  if (!open) return null

  const variantStyles = {
    danger: {
      icon: 'text-[#9b2020]',
      border: 'border-[#f5b4b4]',
      bg: 'bg-[#fdecea]',
    },
    warning: {
      icon: 'text-[#7a4f00]',
      border: 'border-[#e6d3a3]',
      bg: 'bg-[#fdf8e8]',
    },
    info: {
      icon: 'text-[#1e4a70]',
      border: 'border-[#b3c9df]',
      bg: 'bg-[#e8f4fd]',
    },
  }

  const style = variantStyles[variant]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className={`flex items-start gap-3 p-4 border-b ${style.border} ${style.bg}`}>
          <AlertTriangle size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-sm font-semibold text-[#18273a]">
              {title}
            </h3>
            <p className="text-xs text-[#3a5068] mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className={variant === 'danger' ? 'bg-[#9b2020] hover:bg-[#7a1a1a]' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
