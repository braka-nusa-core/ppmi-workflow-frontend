'use client'

import { ArrowUpCircle } from 'lucide-react'
import { formatCurrency, formatDateShort } from '@/lib/format'
import type { ColumnDef } from '@/components/table/DataTable'
import type { OutgoingPaymentListItem } from '@/types/outgoingPayment'
import { TableActions } from '@/components/table/TableActions'
import { OutgoingPaymentStatusBadge } from './OutgoingPaymentStatusBadge'

interface OutgoingPaymentTableActionsConfig {
  onView: (row: OutgoingPaymentListItem) => void
}

export function buildOutgoingPaymentColumns(
  a: OutgoingPaymentTableActionsConfig
): ColumnDef<OutgoingPaymentListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Payment No.', width: 180, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ArrowUpCircle size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'invoiceNumber', header: 'Invoice Ref.', width: 140,
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
      key: 'insuredName', header: 'Insured', minWidth: 140, sortable: true,
      render: (row) => (
        <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
      ),
    },
    {
      key: 'insuranceCompanyName', header: 'Insurance Company', minWidth: 160,
      render: (row) => (
        <span className="text-[13px] text-[#18273a]">{row.insuranceCompanyName}</span>
      ),
    },
    {
      key: 'amount', header: 'Amount', width: 130, align: 'right', sortable: true,
      render: (row) => (
        <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
          {formatCurrency(row.amount, 'IDR', { compact: true })}
        </span>
      ),
    },
    {
      key: 'paymentDate', header: 'Payment Date', width: 116, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.paymentDate)}</span>
      ),
    },
    {
      key: 'status', header: 'Status', width: 150,
      render: (row) => <OutgoingPaymentStatusBadge status={row.status} />,
    },
    {
      key: 'actions', header: '', width: 60, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions onView={() => a.onView(row)} />
      ),
    },
  ]
}
