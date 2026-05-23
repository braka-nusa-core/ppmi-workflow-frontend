'use client'

import {
  Pencil, Wallet, Send, CheckCircle,
  XCircle, User, Clock, Download,
  ArrowRight, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { cn }                    from '@/lib/utils'
import { formatDateTime, formatCurrency, formatDate, daysUntilDue } from '@/lib/format'
import type { InvoiceDocument }  from '@/types/invoice'
import { InvoiceStatusBadge, PaymentStatusBadge } from './InvoiceStatusBadge'
import { DivisionBadge }         from '@/components/ui/Badge'
import { Button }                from '@/components/ui/Button'

interface InvoiceDetailSidebarProps {
  invoice:     InvoiceDocument
  canEdit:     boolean
  canCreate:   boolean
  onIssue?:    () => void
  onMarkSent?: () => void
  onVoucher?:  () => void
  onDownload?: () => void
  onCancel?:   () => void
  onEdit?:     () => void
}

export function InvoiceDetailSidebar({
  invoice,
  canEdit,
  canCreate,
  onIssue,
  onMarkSent,
  onVoucher,
  onDownload,
  onCancel,
  onEdit,
}: InvoiceDetailSidebarProps) {
  const days      = daysUntilDue(invoice.dueDate)
  const isOverdue = (days ?? 0) < 0 && invoice.paymentStatus !== 'PAID'
  const isDueSoon = (days ?? 999) <= 7 && (days ?? 0) >= 0 && invoice.paymentStatus !== 'PAID'
  const paidPct   = invoice.totalAmount > 0
    ? Math.min(Math.round((invoice.paidAmount / invoice.totalAmount) * 100), 100)
    : 0

  const showIssue   = canEdit   && invoice.status === 'DRAFT'
  const showSent    = canEdit   && invoice.status === 'ISSUED'
  const showVoucher = canCreate && invoice.status === 'SENT' && !invoice.voucherId
  const showEdit    = canEdit   && (invoice.status === 'DRAFT' || invoice.status === 'ISSUED')
  const showCancel  = canEdit   && (invoice.status === 'DRAFT' || invoice.status === 'ISSUED')

  return (
    <aside className="flex flex-col gap-4 w-[264px] flex-shrink-0">

      {/* Status card */}
      <div className="card card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Status</p>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PaymentStatusBadge status={invoice.paymentStatus} />
          <DivisionBadge division={invoice.division} />
        </div>

        {/* Due date info */}
        {invoice.paymentStatus !== 'PAID' && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md',
            isOverdue  ? 'bg-[#fdecea]' :
            isDueSoon  ? 'bg-[#fdf7ed]' : 'bg-[#f0f4f7]'
          )}>
            <AlertTriangle
              size={13}
              className={isOverdue ? 'text-[#8c1f1f]' : isDueSoon ? 'text-[#7a5000]' : 'text-[#7a8fa3]'}
              strokeWidth={1.8}
            />
            <div>
              <p className={cn(
                'text-[11px] font-semibold',
                isOverdue ? 'text-[#8c1f1f]' : isDueSoon ? 'text-[#7a5000]' : 'text-[#3a5068]'
              )}>
                {isOverdue
                  ? `${Math.abs(days ?? 0)} days overdue`
                  : isDueSoon
                    ? `Due in ${days} days`
                    : `Due ${formatDate(invoice.dueDate)}`
                }
              </p>
              {!isOverdue && <p className="text-[10px] text-[#7a8fa3]">{formatDate(invoice.dueDate)}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(showIssue || showSent || showVoucher || showEdit || showCancel) && (
        <div className="card">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Actions</p>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {showEdit && (
              <Button variant="secondary" size="sm" icon={<Pencil size={12} />} className="w-full justify-start" onClick={onEdit}>
                Edit Invoice
              </Button>
            )}
            {showIssue && (
              <Button variant="primary" size="sm" icon={<CheckCircle size={12} />} className="w-full justify-start" onClick={onIssue}>
                Issue Invoice
              </Button>
            )}
            {showSent && (
              <Button variant="secondary" size="sm" icon={<Send size={12} />} className="w-full justify-start text-[#123d6b]" onClick={onMarkSent}>
                Mark as Sent
              </Button>
            )}
            {showVoucher && (
              <Button variant="primary" size="sm" icon={<Wallet size={12} />} className="w-full justify-start" onClick={onVoucher}>
                Generate Voucher
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<Download size={12} />} className="w-full justify-start text-[#7a8fa3]" onClick={onDownload}>
              Download PDF
            </Button>
            {showCancel && (
              <Button variant="ghost" size="sm" icon={<XCircle size={12} />} className="w-full justify-start text-[#8c1f1f]" onClick={onCancel}>
                Cancel Invoice
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Finance Summary */}
      <div className="card card-body">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Finance Summary</p>

        {/* Mini progress bar */}
        <div className="h-1.5 bg-[#edf1f5] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full"
            style={{
              width: `${paidPct}%`,
              background: invoice.paymentStatus === 'PAID' ? '#1a5c38' :
                          isOverdue ? '#8c1f1f' : '#123d6b',
            }}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7a8fa3]">Total</span>
            <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
              {formatCurrency(invoice.totalAmount, invoice.currency, { compact: true })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7a8fa3]">Paid</span>
            <span className="text-[12px] font-semibold text-[#1a5c38] tabular-nums">
              {formatCurrency(invoice.paidAmount, invoice.currency, { compact: true })}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#f0f4f7] pt-2">
            <span className="text-[11px] text-[#7a8fa3]">Remaining</span>
            <span className={cn(
              'text-[13px] font-bold tabular-nums',
              invoice.remainingAmount > 0
                ? (isOverdue ? 'text-[#8c1f1f]' : 'text-[#18273a]')
                : 'text-[#1a5c38]'
            )}>
              {formatCurrency(invoice.remainingAmount, invoice.currency, { compact: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Voucher */}
      {invoice.voucherId && (
        <div className="card card-body">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Linked Documents</p>
          <Link
            href={`/dashboard/voucher/${invoice.voucherId}`}
            className="flex items-center gap-2.5 p-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-[#eaf6f0] flex-shrink-0">
              <Wallet size={11} className="text-[#1a5c38]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#18273a]">{invoice.voucherNumber}</p>
              <p className="text-[10px] text-[#1a5c38]">Voucher · Generated</p>
            </div>
            <ArrowRight size={11} className="text-[#7a8fa3]" />
          </Link>
        </div>
      )}

      {/* Record Info */}
      <div className="card card-body flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Record</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <User size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#7a8fa3]">Created by</p>
              <p className="text-[12px] font-medium text-[#18273a]">{invoice.createdBy}</p>
              <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(invoice.createdAt)}</p>
            </div>
          </div>
          {invoice.updatedBy && (
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#7a8fa3]">Last updated</p>
                <p className="text-[12px] font-medium text-[#18273a]">{invoice.updatedBy}</p>
                <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(invoice.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
