import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/types/workflow'

interface PaymentStatusCardProps {
  totalAmount:    number
  paidAmount:     number
  remainingAmount:number
  currency:       'IDR' | 'USD'
  paymentStatus:  PaymentStatus
  className?:     string
}

export function PaymentStatusCard({
  totalAmount,
  paidAmount,
  remainingAmount,
  currency,
  paymentStatus,
  className,
}: PaymentStatusCardProps) {
  const paidPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

  return (
    <div className={cn('card card-body', className)}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-[#4d5966]">Payment Progress</span>
          <span className="text-xs font-semibold text-[#232b34]">
            {formatPercent(paidPercent)}
          </span>
        </div>
        <div className="h-2 bg-[#e2e5e9] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              paymentStatus === 'PAID'    && 'bg-[#1a6b3a]',
              paymentStatus === 'PARTIAL' && 'bg-[#1e4a70]',
              paymentStatus === 'OVERDUE' && 'bg-[#9b2020]',
              paymentStatus === 'UNPAID'  && 'bg-[#ced3d9]',
            )}
            style={{ width: `${Math.min(paidPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9aa3ad] uppercase tracking-wide mb-1">Total</span>
          <span className="text-sm font-semibold text-[#232b34] text-currency">
            {formatCurrency(totalAmount, currency, { compact: true })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9aa3ad] uppercase tracking-wide mb-1">Paid</span>
          <span className="text-sm font-semibold text-[#1a6b3a] text-currency">
            {formatCurrency(paidAmount, currency, { compact: true })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9aa3ad] uppercase tracking-wide mb-1">Remaining</span>
          <span className={cn(
            'text-sm font-semibold text-currency',
            remainingAmount > 0 ? 'text-[#9b2020]' : 'text-[#1a6b3a]'
          )}>
            {formatCurrency(remainingAmount, currency, { compact: true })}
          </span>
        </div>
      </div>
    </div>
  )
}
