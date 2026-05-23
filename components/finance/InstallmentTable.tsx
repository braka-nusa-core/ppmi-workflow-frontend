import { formatCurrency, formatDate, isOverdue, daysUntilDue } from '@/lib/format'
import { StatusBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { PaymentInstallment } from '@/types/payment'
import { Button } from '@/components/ui/Button'
import { CreditCard } from 'lucide-react'

interface InstallmentTableProps {
  installments:    PaymentInstallment[]
  currency:        'IDR' | 'USD'
  onRecord?:       (installment: PaymentInstallment) => void
  canUpdatePayment?: boolean
}

export function InstallmentTable({
  installments,
  currency,
  onRecord,
  canUpdatePayment = false,
}: InstallmentTableProps) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>#</th>
            <th style={{ width: 140 }}>Due Date</th>
            <th style={{ width: 160 }}>Amount Due</th>
            <th style={{ width: 160 }}>Paid Amount</th>
            <th style={{ width: 140 }}>Paid Date</th>
            <th style={{ width: 110 }}>Status</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {installments.map((inst) => {
            const days = daysUntilDue(inst.dueDate)
            const isActuallyOverdue = isOverdue(inst.dueDate) && inst.status !== 'PAID'

            return (
              <tr key={inst.id}>
                <td>
                  <span className="text-doc-id">#{inst.installmentNumber}</span>
                </td>
                <td>
                  <span className={cn(
                    'text-sm',
                    isActuallyOverdue ? 'text-[#9b2020] font-medium' : 'text-[#232b34]'
                  )}>
                    {formatDate(inst.dueDate)}
                  </span>
                  {isActuallyOverdue && (
                    <span className="block text-[10px] text-[#9b2020]">
                      {Math.abs(days ?? 0)} days overdue
                    </span>
                  )}
                  {!isActuallyOverdue && days !== null && days <= 7 && inst.status !== 'PAID' && (
                    <span className="block text-[10px] text-[#7a4f00]">
                      Due in {days} days
                    </span>
                  )}
                </td>
                <td>
                  <span className="text-currency">
                    {formatCurrency(inst.amount, currency)}
                  </span>
                </td>
                <td>
                  <span className="text-currency text-[#1a6b3a]">
                    {inst.paidAmount != null
                      ? formatCurrency(inst.paidAmount, currency)
                      : '—'}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-[#4d5966]">
                    {formatDate(inst.paidDate)}
                  </span>
                </td>
                <td>
                  <StatusBadge status={inst.status} />
                </td>
                <td className="col-actions">
                  {canUpdatePayment && inst.status !== 'PAID' && onRecord && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<CreditCard size={12} />}
                      onClick={() => onRecord(inst)}
                      className="text-[#1e4a70]"
                    >
                      Record
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
