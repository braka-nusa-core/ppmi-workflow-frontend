import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/types/payment'

const PAYMENT_STATUS_CFG: Record<PaymentStatus, {
  label: string; bg: string; text: string; border: string; dot: string
}> = {
  UNPAID:  { label: 'Unpaid',  bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  PARTIAL: { label: 'Partial', bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  PAID:    { label: 'Paid',    bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  OVERDUE: { label: 'Overdue', bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0', dot: '#8c1f1f' },
}

interface PaymentStatusBadgeProps {
  status:     PaymentStatus
  dot?:       boolean
  className?: string
}

export function PaymentStatusBadge({ status, dot = true, className }: PaymentStatusBadgeProps) {
  const cfg = PAYMENT_STATUS_CFG[status]
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