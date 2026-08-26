'use client'

import { Receipt } from 'lucide-react'
import { formatCurrency, formatDateShort } from '@/lib/format'
import type { ColumnDef } from '@/components/table/DataTable'
import type { PaymentListItem } from '@/types/payment'
import { TableActions } from '@/components/table/TableActions'
import { PaymentStatusBadge } from './PaymentStatusBadge'

interface PaymentTableActionsConfig {
  onView:        (row: PaymentListItem) => void
  onRecord:      (row: PaymentListItem) => void
  canUpdatePayment: boolean
}

export function buildPaymentColumns(a: PaymentTableActionsConfig): ColumnDef<PaymentListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Payment No.', width: 180, sticky: 'left',
      render: (row) => (
        <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
          {row.docNumber}
        </span>
      ),
    },
    {
      key: 'invoiceNumber', header: 'Invoice Ref.', width: 136,
      render: (row) => (
        <a
          href={`/dashboard/invoice/${row.invoiceId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.invoiceNumber}
        </a>
      ),
    },
    {
      key: 'insuredName', header: 'Insured', minWidth: 160, sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Receipt size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
        </div>
      ),
    },
    {
      key: 'totalAmount', header: 'Total', width: 120, align: 'right', sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3] tabular-nums">
          {formatCurrency(row.totalAmount, row.currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'paidAmount', header: 'Paid', width: 120, align: 'right',
      render: (row) => (
        <span className="text-[12px] font-semibold text-[#1a5c38] tabular-nums">
          {formatCurrency(row.paidAmount, row.currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'remainingAmount', header: 'Remaining', width: 120, align: 'right',
      render: (row) => (
        <span className={row.remainingAmount > 0 ? 'text-[12px] font-semibold text-[#7a5000] tabular-nums' : 'text-[12px] text-[#7a8fa3] tabular-nums'}>
          {formatCurrency(row.remainingAmount, row.currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'dueDate', header: 'Due Date', width: 110, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{row.dueDate ? formatDateShort(row.dueDate) : '—'}</span>
      ),
    },
    {
      key: 'paymentStatus', header: 'Status', width: 130,
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      key: 'actions', header: '', width: 88, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions
          onView={() => a.onView(row)}
          extra={[
            {
              label:   'Record Payment',
              onClick: () => a.onRecord(row),
              hidden:  row.paymentStatus === 'PAID' || !a.canUpdatePayment,
            },
          ]}
        />
      ),
    },
  ]
}
