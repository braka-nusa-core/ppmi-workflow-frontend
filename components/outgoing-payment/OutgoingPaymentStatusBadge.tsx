import { cn } from '@/lib/utils'
import type { OutgoingPaymentStatus } from '@/types/outgoingPayment'

const STATUS_CONFIG: Record<OutgoingPaymentStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
  dot:    string
}> = {
  WAITING_PAYMENT: { label: 'Waiting Payment', bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  PARTIAL_PAYMENT: { label: 'Partial Payment', bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  FULLY_PAID:      { label: 'Fully Paid',      bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
}

interface OutgoingPaymentStatusBadgeProps {
  status:     OutgoingPaymentStatus
  dot?:       boolean
  className?: string
}

export function OutgoingPaymentStatusBadge({ status, dot = true, className }: OutgoingPaymentStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      )}
      {cfg.label}
    </span>
  )
}
