import { cn } from '@/lib/utils'
import type { VoucherStatus, VoucherApprovalStatus, VoucherPaymentType } from '@/types/voucher'

// ─── Voucher Status ──────────────────────────────────────────────
const VOUCHER_STATUS_CFG: Record<VoucherStatus, {
  label: string; bg: string; text: string; border: string; dot: string
}> = {
  DRAFT:            { label: 'Draft',           bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  PENDING_APPROVAL: { label: 'Pending Approval',bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  APPROVED:         { label: 'Approved',         bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  PROCESSED:        { label: 'Processed',        bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  CANCELLED:        { label: 'Cancelled',        bg: '#f7f3f0', text: '#6b4a3a', border: '#d4b8a8', dot: '#9a7060' },
}

export function VoucherStatusBadge({
  status, dot = true, className,
}: { status: VoucherStatus; dot?: boolean; className?: string }) {
  const cfg = VOUCHER_STATUS_CFG[status]
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

// ─── Approval Status ─────────────────────────────────────────────
const APPROVAL_STATUS_CFG: Record<VoucherApprovalStatus, {
  label: string; bg: string; text: string; border: string
}> = {
  WAITING:  { label: 'Awaiting Approval', bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a' },
  APPROVED: { label: 'Approved',          bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4' },
  REJECTED: { label: 'Rejected',          bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0' },
}

export function ApprovalStatusBadge({
  status, className,
}: { status: VoucherApprovalStatus; className?: string }) {
  const cfg = APPROVAL_STATUS_CFG[status]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Payment Type Badge ──────────────────────────────────────────
const PAYMENT_TYPE_LABELS: Record<VoucherPaymentType, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE:        'Cheque',
  RTGS:          'RTGS',
  SWIFT:         'SWIFT',
  CASH:          'Cash',
}

export function PaymentTypeBadge({
  type, className,
}: { type: VoucherPaymentType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border',
        className
      )}
      style={{ background: '#f0f4f7', color: '#3a5068', border: '1px solid #b5cede' }}
    >
      {PAYMENT_TYPE_LABELS[type]}
    </span>
  )
}
