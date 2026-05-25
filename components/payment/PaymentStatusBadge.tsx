import { cn } from '@/lib/utils'
import type { PaymentStatus, PaymentVerificationStatus, PaymentMethod } from '@/types/payment'

// ─── Payment Status ──────────────────────────────────────────────
const PAYMENT_STATUS_CFG: Record<PaymentStatus, {
  label: string; bg: string; text: string; border: string; dot: string
}> = {
  UNPAID:  { label: 'Unpaid',   bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  PARTIAL: { label: 'Partial',  bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  PAID:    { label: 'Paid',     bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  OVERDUE: { label: 'Overdue',  bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0', dot: '#8c1f1f' },
}

export function PaymentStatusBadge({
  status, dot = true, className,
}: { status: PaymentStatus; dot?: boolean; className?: string }) {
  const cfg = PAYMENT_STATUS_CFG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  )
}

// ─── Verification Status ─────────────────────────────────────────
const VERIFICATION_CFG: Record<PaymentVerificationStatus, {
  label: string; bg: string; text: string; border: string
}> = {
  UNVERIFIED: { label: 'Unverified', bg: '#f0f4f7', text: '#3a5068', border: '#b5cede' },
  VERIFIED:   { label: 'Verified',   bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4' },
  FLAGGED:    { label: 'Flagged',    bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0' },
}

export function VerificationStatusBadge({
  status, className,
}: { status: PaymentVerificationStatus; className?: string }) {
  const cfg = VERIFICATION_CFG[status]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Payment Method Badge ────────────────────────────────────────
const METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  RTGS:          'RTGS',
  SWIFT:         'SWIFT',
  CHEQUE:        'Cheque',
  CASH:          'Cash',
}

export function PaymentMethodBadge({
  method, className,
}: { method: PaymentMethod; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide', className)}
      style={{ background: '#f0f4f7', color: '#3a5068', border: '1px solid #b5cede' }}
    >
      {METHOD_LABELS[method]}
    </span>
  )
}
