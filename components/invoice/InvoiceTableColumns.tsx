'use client'

import { Receipt, Wallet, Download, Send } from 'lucide-react'
import { formatCurrency, formatDateShort, daysUntilDue } from '@/lib/format'
import { cn }                      from '@/lib/utils'
import type { ColumnDef }          from '@/components/table/DataTable'
import type { InvoiceListItem }    from '@/types/invoice'
import { InvoiceStatusBadge, PaymentStatusBadge } from './InvoiceStatusBadge'
import { DivisionBadge }           from '@/components/ui/Badge'
import { TableActions }            from '@/components/table/TableActions'

interface InvoiceTableActionsConfig {
  onView:            (row: InvoiceListItem) => void
  onEdit:            (row: InvoiceListItem) => void
  onGenerateVoucher: (row: InvoiceListItem) => void
  onDownloadPDF:     (row: InvoiceListItem) => void
  onMarkSent:        (row: InvoiceListItem) => void
  canEdit:           boolean
  canCreate:         boolean
}

export function buildInvoiceColumns(
  actions: InvoiceTableActionsConfig
): ColumnDef<InvoiceListItem>[] {
  return [
    {
      key:      'docNumber',
      header:   'Invoice No.',
      width:    152,
      sortable: true,
      sticky:   'left',
      render:   (row) => (
        <div className="flex items-center gap-2">
          <Receipt size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key:    'qsNumber',
      header: 'QS Ref.',
      width:  132,
      render: (row) => (
        <a
          href={`/dashboard/qs/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.qsNumber}
        </a>
      ),
    },
    {
      key:    'division',
      header: 'Div.',
      width:  68,
      render: (row) => <DivisionBadge division={row.division} />,
    },
    {
      key:      'insuredName',
      header:   'Insured',
      minWidth: 180,
      sortable: true,
      render:   (row) => (
        <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
      ),
    },
    {
      key:      'vesselName',
      header:   'Vessel',
      minWidth: 148,
      render:   (row) => (
        <span className="text-[12px] text-[#3a5068]">{row.vesselName ?? '—'}</span>
      ),
    },
    {
      key:      'totalAmount',
      header:   'Amount',
      width:    148,
      align:    'right',
      sortable: true,
      render:   (row) => (
        <div className="text-right">
          <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
            {formatCurrency(row.totalAmount, row.currency)}
          </span>
          {row.currency === 'USD' && (
            <span className="block text-[10px] text-[#7a8fa3]">USD</span>
          )}
        </div>
      ),
    },
    {
      key:    'dueDate',
      header: 'Due Date',
      width:  112,
      sortable: true,
      render: (row) => {
        const days = daysUntilDue(row.dueDate)
        const isOverdue = (days ?? 0) < 0 && row.paymentStatus !== 'PAID'
        const isDueSoon = (days ?? 999) <= 7 && (days ?? 0) >= 0 && row.paymentStatus !== 'PAID'

        return (
          <div>
            <span className={cn(
              'text-[12px]',
              isOverdue  ? 'text-[#8c1f1f] font-semibold' :
              isDueSoon  ? 'text-[#7a5000] font-medium'   : 'text-[#3a5068]'
            )}>
              {formatDateShort(row.dueDate)}
            </span>
            {isOverdue && (
              <span className="block text-[10px] text-[#8c1f1f]">
                {Math.abs(days ?? 0)}d overdue
              </span>
            )}
            {isDueSoon && (
              <span className="block text-[10px] text-[#7a5000]">
                Due in {days}d
              </span>
            )}
          </div>
        )
      },
    },
    {
      key:    'paymentStatus',
      header: 'Payment',
      width:  88,
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      key:    'status',
      header: 'Status',
      width:  96,
      render: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      key:      'createdAt',
      header:   'Created',
      width:    96,
      sortable: true,
      render:   (row) => (
        <div>
          <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
          {row.hasVoucher && (
            <div className="flex items-center gap-1 mt-0.5">
              <Wallet size={9} className="text-[#2d6495]" />
              <span className="text-[10px] text-[#2d6495] font-medium">{row.voucherNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key:       'actions',
      header:    '',
      width:     108,
      sticky:    'right',
      className: 'bg-white',
      render:    (row) => (
        <TableActions
          onView={() => actions.onView(row)}
          onEdit={actions.canEdit && (row.status === 'DRAFT' || row.status === 'ISSUED')
            ? () => actions.onEdit(row)
            : undefined
          }
          extra={[
            {
              label:   'Mark as Sent',
              icon:    <Send size={13} />,
              onClick: () => actions.onMarkSent(row),
              hidden:  row.status !== 'ISSUED' || !actions.canEdit,
            },
            {
              label:   'Generate Voucher',
              icon:    <Wallet size={13} />,
              onClick: () => actions.onGenerateVoucher(row),
              hidden:  row.hasVoucher || row.status !== 'SENT' || !actions.canCreate,
            },
            {
              label:   'Download PDF',
              icon:    <Download size={13} />,
              onClick: () => actions.onDownloadPDF(row),
            },
          ]}
        />
      ),
    },
  ]
}
