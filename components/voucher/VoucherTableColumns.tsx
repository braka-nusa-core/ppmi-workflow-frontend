'use client'

import { Wallet, CreditCard, Download, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDateShort }  from '@/lib/format'
import type { ColumnDef }                   from '@/components/table/DataTable'
import type { VoucherListItem }             from '@/types/voucher'
import { VoucherStatusBadge, ApprovalStatusBadge, PaymentTypeBadge } from './VoucherStatusBadge'
import { DivisionBadge }                    from '@/components/ui/Badge'
import { TableActions }                     from '@/components/table/TableActions'

interface VoucherTableActionsConfig {
  onView:            (row: VoucherListItem) => void
  onEdit:            (row: VoucherListItem) => void
  onApprove:         (row: VoucherListItem) => void
  onGeneratePayment: (row: VoucherListItem) => void
  onDownload:        (row: VoucherListItem) => void
  canEdit:           boolean
  canVerify:         boolean
  canCreate:         boolean
}

export function buildVoucherColumns(a: VoucherTableActionsConfig): ColumnDef<VoucherListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Voucher No.', width: 148, sortable: true, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Wallet size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'invoiceNumber', header: 'Invoice Ref.', width: 136,
      render: (row) => (
        <a
          href={`/dashboard/invoice/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.invoiceNumber}
        </a>
      ),
    },
    {
      key: 'qsNumber', header: 'QS Ref.', width: 120,
      render: (row) => (
        <span className="text-[11px] text-[#7a8fa3] font-mono">{row.qsNumber}</span>
      ),
    },
    {
      key: 'division', header: 'Div.', width: 68,
      render: (row) => <DivisionBadge division={row.division} />,
    },
    {
      key: 'insuredName', header: 'Insured', minWidth: 168, sortable: true,
      render: (row) => (
        <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
      ),
    },
    {
      key: 'paymentType', header: 'Payment Type', width: 120,
      render: (row) => <PaymentTypeBadge type={row.paymentType} />,
    },
    {
      key: 'bankName', header: 'Bank', width: 120,
      render: (row) => <span className="text-[12px] text-[#3a5068]">{row.bankName}</span>,
    },
    {
      key: 'amount', header: 'Amount', width: 144, align: 'right', sortable: true,
      render: (row) => (
        <div className="text-right">
          <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
            {formatCurrency(row.amount, row.currency)}
          </span>
          {row.currency === 'USD' && (
            <span className="block text-[10px] text-[#7a8fa3]">USD</span>
          )}
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', width: 148,
      render: (row) => <VoucherStatusBadge status={row.status} />,
    },
    {
      key: 'approvalStatus', header: 'Approval', width: 136,
      render: (row) => <ApprovalStatusBadge status={row.approvalStatus} />,
    },
    {
      key: 'createdAt', header: 'Created', width: 96, sortable: true,
      render: (row) => (
        <div>
          <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
          {row.hasPayment && (
            <div className="flex items-center gap-1 mt-0.5">
              <CreditCard size={9} className="text-[#123d6b]" />
              <span className="text-[10px] text-[#123d6b] font-medium">{row.paymentNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions', header: '', width: 108, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions
          onView={() => a.onView(row)}
          onEdit={
            a.canEdit && (row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL')
              ? () => a.onEdit(row)
              : undefined
          }
          extra={[
            {
              label: 'Approve',
              icon:  <CheckCircle size={13} />,
              onClick: () => a.onApprove(row),
              hidden: !a.canVerify || row.approvalStatus !== 'WAITING' || row.status !== 'PENDING_APPROVAL',
            },
            {
              label: 'Generate Payment',
              icon:  <CreditCard size={13} />,
              onClick: () => a.onGeneratePayment(row),
              hidden: row.hasPayment || row.status !== 'APPROVED' || !a.canCreate,
            },
            {
              label: 'Download PDF',
              icon:  <Download size={13} />,
              onClick: () => a.onDownload(row),
            },
          ]}
        />
      ),
    },
  ]
}
