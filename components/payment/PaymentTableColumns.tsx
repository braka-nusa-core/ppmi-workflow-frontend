'use client'

import { CreditCard, Package, CheckCircle, Flag, Layers } from 'lucide-react'
import { formatCurrency, formatDateShort, daysUntilDue } from '@/lib/format'
import { cn }                       from '@/lib/utils'
import type { ColumnDef }           from '@/components/table/DataTable'
import type { PaymentListItem }     from '@/types/payment'
import { PaymentStatusBadge, VerificationStatusBadge } from './PaymentStatusBadge'
import { DivisionBadge }            from '@/components/ui/Badge'
import { TableActions }             from '@/components/table/TableActions'

interface PaymentTableActionsConfig {
  onView:             (row: PaymentListItem) => void
  onRecord:           (row: PaymentListItem) => void
  onVerify:           (row: PaymentListItem) => void
  onFlag:             (row: PaymentListItem) => void
  onGenerateShipment: (row: PaymentListItem) => void
  canUpdatePayment:   boolean
  canVerify:          boolean
  canCreate:          boolean
}

export function buildPaymentColumns(a: PaymentTableActionsConfig): ColumnDef<PaymentListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Payment No.', width: 152, sortable: true, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <CreditCard size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'voucherNumber', header: 'Voucher Ref.', width: 136,
      render: (row) => (
        <a
          href={`/dashboard/voucher/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.voucherNumber}
        </a>
      ),
    },
    {
      key: 'division', header: 'Div.', width: 68,
      render: (row) => <DivisionBadge division={row.division} />,
    },
    {
      key: 'insuredName', header: 'Insured', minWidth: 168, sortable: true,
      render: (row) => (
        <div>
          <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
          {row.isInstallment && (
            <div className="flex items-center gap-1 mt-0.5">
              <Layers size={10} className="text-[#2d6495]" />
              <span className="text-[10px] text-[#2d6495] font-medium">
                {row.installmentCount}x installment
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount', header: 'Total', width: 136, align: 'right', sortable: true,
      render: (row) => (
        <div className="text-right">
          <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
            {formatCurrency(row.totalAmount, row.currency, { compact: true })}
          </span>
          {row.currency === 'USD' && (
            <span className="block text-[10px] text-[#7a8fa3]">USD</span>
          )}
        </div>
      ),
    },
    {
      key: 'paidAmount', header: 'Paid', width: 120, align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className={cn(
            'text-[12px] tabular-nums font-medium',
            row.paidAmount === row.totalAmount ? 'text-[#1a5c38]' :
            row.paidAmount > 0 ? 'text-[#123d6b]' : 'text-[#7a8fa3]'
          )}>
            {formatCurrency(row.paidAmount, row.currency, { compact: true })}
          </span>
          {row.paidAmount < row.totalAmount && row.paidAmount > 0 && (
            <div
              className="mt-1 h-1 rounded-full bg-[#edf1f5] overflow-hidden"
              style={{ minWidth: 60 }}
            >
              <div
                className="h-full rounded-full bg-[#123d6b]"
                style={{ width: `${Math.round((row.paidAmount / row.totalAmount) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'dueDate', header: 'Due Date', width: 108, sortable: true,
      render: (row) => {
        const days = daysUntilDue(row.dueDate)
        const overdue  = (days ?? 0) < 0 && row.paymentStatus !== 'PAID'
        const dueSoon  = (days ?? 999) <= 7 && (days ?? 0) >= 0 && row.paymentStatus !== 'PAID'
        return (
          <div>
            <span className={cn(
              'text-[12px]',
              overdue  ? 'text-[#8c1f1f] font-semibold' :
              dueSoon  ? 'text-[#7a5000] font-medium'   : 'text-[#3a5068]'
            )}>
              {formatDateShort(row.dueDate)}
            </span>
            {overdue && (
              <span className="block text-[10px] text-[#8c1f1f]">{Math.abs(days ?? 0)}d overdue</span>
            )}
            {dueSoon && (
              <span className="block text-[10px] text-[#7a5000]">Due in {days}d</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'paymentStatus', header: 'Payment', width: 96,
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      key: 'verificationStatus', header: 'Verified', width: 100,
      render: (row) => <VerificationStatusBadge status={row.verificationStatus} />,
    },
    {
      key: 'createdAt', header: 'Created', width: 96, sortable: true,
      render: (row) => (
        <div>
          <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
          {row.hasShipment && (
            <div className="flex items-center gap-1 mt-0.5">
              <Package size={9} className="text-[#1a5c38]" />
              <span className="text-[10px] text-[#1a5c38] font-medium">{row.shipmentNumber}</span>
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
          extra={[
            {
              label:   'Record Payment',
              icon:    <CreditCard size={13} />,
              onClick: () => a.onRecord(row),
              hidden:  !a.canUpdatePayment || row.paymentStatus === 'PAID',
            },
            {
              label:   'Verify',
              icon:    <CheckCircle size={13} />,
              onClick: () => a.onVerify(row),
              hidden:  !a.canVerify || row.verificationStatus === 'VERIFIED',
            },
            {
              label:   'Flag Issue',
              icon:    <Flag size={13} />,
              onClick: () => a.onFlag(row),
              hidden:  !a.canVerify || row.verificationStatus === 'FLAGGED',
              danger:  false,
            },
            {
              label:   'Generate Shipment',
              icon:    <Package size={13} />,
              onClick: () => a.onGenerateShipment(row),
              hidden:  row.hasShipment || row.paymentStatus !== 'PAID' || !a.canCreate,
            },
          ]}
        />
      ),
    },
  ]
}
