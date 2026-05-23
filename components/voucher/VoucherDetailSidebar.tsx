'use client'

import {
  Pencil, CreditCard, CheckCircle, XCircle,
  Download, User, Clock, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn }                    from '@/lib/utils'
import { formatDateTime, formatCurrency } from '@/lib/format'
import type { VoucherDocument }  from '@/types/voucher'
import { VoucherStatusBadge, ApprovalStatusBadge, PaymentTypeBadge } from './VoucherStatusBadge'
import { DivisionBadge }         from '@/components/ui/Badge'
import { Button }                from '@/components/ui/Button'

interface VoucherDetailSidebarProps {
  vch:         VoucherDocument
  canEdit:     boolean
  canVerify:   boolean
  canCreate:   boolean
  onApprove?:  () => void
  onReject?:   () => void
  onPayment?:  () => void
  onDownload?: () => void
  onCancel?:   () => void
  onEdit?:     () => void
}

export function VoucherDetailSidebar({
  vch,
  canEdit, canVerify, canCreate,
  onApprove, onReject, onPayment, onDownload, onCancel, onEdit,
}: VoucherDetailSidebarProps) {
  const showApprove = canVerify && vch.approvalStatus === 'WAITING' && vch.status === 'PENDING_APPROVAL'
  const showReject  = canVerify && vch.approvalStatus === 'WAITING' && vch.status === 'PENDING_APPROVAL'
  const showPayment = canCreate && vch.status === 'APPROVED' && !vch.paymentId
  const showEdit    = canEdit   && (vch.status === 'DRAFT' || vch.status === 'PENDING_APPROVAL')
  const showCancel  = canEdit   && (vch.status === 'DRAFT' || vch.status === 'PENDING_APPROVAL')

  return (
    <aside className="flex flex-col gap-4 w-[264px] flex-shrink-0">

      {/* Status card */}
      <div className="card card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Status</p>
          <VoucherStatusBadge status={vch.status} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ApprovalStatusBadge status={vch.approvalStatus} />
          <DivisionBadge division={vch.division} />
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#f0f4f7]">
          <PaymentTypeBadge type={vch.paymentType} />
          <span className="text-[12px] font-semibold text-[#18273a] tabular-nums ml-auto">
            {formatCurrency(vch.amount, vch.currency, { compact: true })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      {(showApprove || showReject || showPayment || showEdit || showCancel) && (
        <div className="card">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Actions</p>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {showEdit && (
              <Button variant="secondary" size="sm" icon={<Pencil size={12} />} className="w-full justify-start" onClick={onEdit}>
                Edit Voucher
              </Button>
            )}
            {showApprove && (
              <Button variant="primary" size="sm" icon={<CheckCircle size={12} />} className="w-full justify-start" onClick={onApprove}>
                Approve Voucher
              </Button>
            )}
            {showReject && (
              <Button variant="secondary" size="sm" icon={<XCircle size={12} />} className="w-full justify-start text-[#8c1f1f]" onClick={onReject}>
                Reject Voucher
              </Button>
            )}
            {showPayment && (
              <Button variant="primary" size="sm" icon={<CreditCard size={12} />} className="w-full justify-start" onClick={onPayment}>
                Generate Payment
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<Download size={12} />} className="w-full justify-start text-[#7a8fa3]" onClick={onDownload}>
              Download PDF
            </Button>
            {showCancel && (
              <Button variant="ghost" size="sm" icon={<XCircle size={12} />} className="w-full justify-start text-[#8c1f1f]" onClick={onCancel}>
                Cancel Voucher
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Finance Processing Status */}
      <div className="card card-body">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Finance Processing</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Submitted',    done: vch.status !== 'DRAFT' },
            { label: 'Approved',     done: vch.approvalStatus === 'APPROVED' },
            { label: 'Processed',    done: vch.status === 'PROCESSED' },
            { label: 'Payment Done', done: !!vch.paymentId },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                step.done ? 'bg-[#1a5c38]' : 'bg-[#d5e3ef]'
              )} />
              <span className={cn(
                'text-[12px]',
                step.done ? 'text-[#18273a] font-medium' : 'text-[#7a8fa3]'
              )}>
                {step.label}
              </span>
              {step.done && (
                <CheckCircle size={11} className="text-[#1a5c38] ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Linked Payment */}
      {vch.paymentId && (
        <div className="card card-body">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Linked Documents</p>
          <Link
            href={`/dashboard/payment/${vch.paymentId}`}
            className="flex items-center gap-2.5 p-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-[#e8f3fb] flex-shrink-0">
              <CreditCard size={11} className="text-[#123d6b]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#18273a]">{vch.paymentNumber}</p>
              <p className="text-[10px] text-[#123d6b]">Payment · Generated</p>
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
              <p className="text-[12px] font-medium text-[#18273a]">{vch.createdBy}</p>
              <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(vch.createdAt)}</p>
            </div>
          </div>
          {vch.updatedBy && (
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#7a8fa3]">Last updated</p>
                <p className="text-[12px] font-medium text-[#18273a]">{vch.updatedBy}</p>
                <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(vch.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
