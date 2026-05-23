import { cn } from '@/lib/utils'
import type { InvoiceStatus, InvoicePaymentStatus } from '@/types/invoice'

// ─── Invoice Status ──────────────────────────────────────────────
const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
  dot:    string
}> = {
  DRAFT:     { label: 'Draft',     bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  ISSUED:    { label: 'Issued',    bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  SENT:      { label: 'Sent',      bg: '#edf5fb', text: '#2d6495', border: '#a0c4dd', dot: '#2d6495' },
  PAID:      { label: 'Paid',      bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  OVERDUE:   { label: 'Overdue',   bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0', dot: '#8c1f1f' },
  CANCELLED: { label: 'Cancelled', bg: '#f7f3f0', text: '#6b4a3a', border: '#d4b8a8', dot: '#9a7060' },
}

interface InvoiceStatusBadgeProps {
  status:     InvoiceStatus
  dot?:       boolean
  className?: string
}

export function InvoiceStatusBadge({ status, dot = true, className }: InvoiceStatusBadgeProps) {
  const cfg = INVOICE_STATUS_CONFIG[status]
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

// ─── Payment Status ──────────────────────────────────────────────
const PAYMENT_STATUS_CONFIG: Record<InvoicePaymentStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
}> = {
  UNPAID:  { label: 'Unpaid',   bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a' },
  PARTIAL: { label: 'Partial',  bg: '#e8f3fb', text: '#174e87', border: '#93c4e5' },
  PAID:    { label: 'Paid',     bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4' },
}

interface PaymentStatusBadgeProps {
  status:     InvoicePaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const cfg = PAYMENT_STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}
