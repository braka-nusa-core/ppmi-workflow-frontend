'use client'

import { CreditCard, CheckCircle } from 'lucide-react'
import { cn }                    from '@/lib/utils'
import { formatCurrency, formatDate, formatDateShort, daysUntilDue } from '@/lib/format'
import type { PaymentInstallment, PaymentDocument } from '@/types/payment'
import { PaymentStatusBadge }    from './PaymentStatusBadge'
import { Button }                from '@/components/ui/Button'

interface PaymentInstallmentTableProps {
  payment:         PaymentDocument
  onRecordInstallment: (installment: PaymentInstallment) => void
  canUpdatePayment:boolean
}

export function PaymentInstallmentTable({
  payment,
  onRecordInstallment,
  canUpdatePayment,
}: PaymentInstallmentTableProps) {
  const installments = payment.installments ?? []

  // Summary stats
  const paidCount    = installments.filter((i) => i.status === 'PAID').length
  const overdueCount = installments.filter((i) => i.status === 'OVERDUE').length

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">
            Installment Schedule
          </h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">
            {paidCount}/{installments.length} paid
            {overdueCount > 0 && (
              <span className="text-[#8c1f1f] font-medium"> · {overdueCount} overdue</span>
            )}
          </p>
        </div>
        {/* Mini progress */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-[#edf1f5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#123d6b]"
              style={{ width: `${Math.round((paidCount / installments.length) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-[#3a5068]">
            {Math.round((paidCount / installments.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60  }}>#</th>
              <th style={{ width: 120 }}>Due Date</th>
              <th style={{ width: 140 }} className="text-right">Amount Due</th>
              <th style={{ width: 140 }} className="text-right">Paid</th>
              <th style={{ width: 120 }}>Paid Date</th>
              <th style={{ width: 140 }}>Reference</th>
              <th style={{ width: 96  }}>Status</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => {
              const days    = daysUntilDue(inst.dueDate)
              const overdue = inst.status !== 'PAID' && (days ?? 0) < 0
              const dueSoon = inst.status !== 'PAID' && (days ?? 999) <= 7 && (days ?? 0) >= 0

              return (
                <tr key={inst.id}>
                  <td>
                    <span className="text-doc-id">#{inst.installmentNumber}</span>
                  </td>
                  <td>
                    <span className={cn(
                      'text-[12px]',
                      overdue  ? 'text-[#8c1f1f] font-semibold' :
                      dueSoon  ? 'text-[#7a5000] font-medium'   : 'text-[#3a5068]'
                    )}>
                      {formatDateShort(inst.dueDate)}
                    </span>
                    {overdue && (
                      <span className="block text-[10px] text-[#8c1f1f]">
                        {Math.abs(days ?? 0)}d overdue
                      </span>
                    )}
                    {dueSoon && (
                      <span className="block text-[10px] text-[#7a5000]">
                        Due in {days}d
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="text-[12px] font-medium text-[#18273a] tabular-nums">
                      {formatCurrency(inst.amount, payment.currency)}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={cn(
                      'text-[12px] tabular-nums font-medium',
                      inst.paidAmount > 0 ? 'text-[#1a5c38]' : 'text-[#b5cede]'
                    )}>
                      {inst.paidAmount > 0
                        ? formatCurrency(inst.paidAmount, payment.currency)
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#7a8fa3]">
                      {inst.paidDate ? formatDateShort(inst.paidDate) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-[11px] text-[#7a8fa3] font-mono">
                      {inst.referenceNumber ?? '—'}
                    </span>
                  </td>
                  <td>
                    <PaymentStatusBadge status={inst.status} />
                  </td>
                  <td className="col-actions">
                    {canUpdatePayment && inst.status !== 'PAID' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<CreditCard size={12} />}
                        onClick={() => onRecordInstallment(inst)}
                        className="text-[#123d6b] text-[11px]"
                      >
                        Record
                      </Button>
                    )}
                    {inst.status === 'PAID' && inst.verifiedBy && (
                      <div className="flex items-center gap-1 justify-end">
                        <CheckCircle size={11} className="text-[#1a5c38]" />
                        <span className="text-[10px] text-[#1a5c38]">Verified</span>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>

          {/* Footer totals */}
          <tfoot>
            <tr style={{ background: '#f7f9fb', borderTop: '2px solid #d5e3ef' }}>
              <td colSpan={2} className="px-4 py-2.5">
                <span className="text-[11px] font-semibold text-[#3a5068]">Total</span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="text-[12px] font-bold text-[#18273a] tabular-nums">
                  {formatCurrency(payment.totalAmount, payment.currency)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="text-[12px] font-bold text-[#1a5c38] tabular-nums">
                  {formatCurrency(payment.paidAmount, payment.currency)}
                </span>
              </td>
              <td colSpan={4} className="px-4 py-2.5">
                {payment.remainingAmount > 0 && (
                  <span className="text-[11px] font-medium text-[#8c1f1f]">
                    {formatCurrency(payment.remainingAmount, payment.currency)} remaining
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
