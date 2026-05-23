'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

// ─── Modal Size Widths ───────────────────────────────────────────
const MODAL_WIDTHS = {
  sm:  'max-w-[400px]',
  md:  'max-w-[640px]',
  lg:  'max-w-[800px]',
  xl:  'max-w-[960px]',
  '2xl': 'max-w-[1100px]',
} as const

type ModalSize = keyof typeof MODAL_WIDTHS

// ─── Animation variants ─────────────────────────────────────────
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
}

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.97, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0  },
}

// ─── BaseModal ──────────────────────────────────────────────────
interface BaseModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize
  children: React.ReactNode
  closeOnBackdrop?: boolean
  className?: string
}

export function BaseModal({
  open,
  onClose,
  size = 'md',
  children,
  closeOnBackdrop = true,
  className,
}: BaseModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <motion.div
            className={cn('modal-panel', MODAL_WIDTHS[size], className)}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Modal Header ────────────────────────────────────────────────
interface ModalHeaderProps {
  title: string
  description?: string
  onClose: () => void
  className?: string
}

export function ModalHeader({ title, description, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn('modal-header', className)}>
      <div>
        <h2 className="text-base font-semibold text-[#232b34]">{title}</h2>
        {description && (
          <p className="text-xs text-[#9aa3ad] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded',
          'text-[#9aa3ad] hover:text-[#232b34] hover:bg-[#f1f3f5]',
          'transition-colors duration-100 flex-shrink-0 ml-4'
        )}
      >
        <X size={15} />
      </button>
    </div>
  )
}

// ─── Modal Body ──────────────────────────────────────────────────
export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('modal-body', className)}>
      {children}
    </div>
  )
}

// ─── Modal Footer ────────────────────────────────────────────────
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('modal-footer', className)}>
      {children}
    </div>
  )
}

// ─── ConfirmModal ────────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} size="sm">
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>
        {description && (
          <p className="text-sm text-[#4d5966]">{description}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}

// ─── FormModal ───────────────────────────────────────────────────
interface FormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  title: string
  description?: string
  size?: ModalSize
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  children: React.ReactNode
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  size = 'md',
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  children,
}: FormModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} size={size} closeOnBackdrop={!loading}>
      <ModalHeader title={title} description={description} onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={onSubmit} loading={loading}>
          {submitLabel}
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}
