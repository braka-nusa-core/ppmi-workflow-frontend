'use client'

import {
  CreditCard, CheckCircle, Flag, Package,
  User, Clock, ArrowRight, Layers, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { cn }                     from '@/lib/utils'
import { formatDateTime, formatCurrency, formatDate, daysUntilDue } from '@/lib/format'
import type { PaymentDocument }   from '@/types/payment'
import { PaymentStatusBadge, VerificationStatusBadge } from './PaymentStatusBadge'
import { DivisionBadge }          from '@/components/ui/Badge'
import { Button }                 from '@/components/ui/Button'

interface PaymentDetailSidebarProps {
  pay:              PaymentDocument
  canUpdatePayment: boolean
  canVerify:        boolean
  canCreate:        boolean
  onRecord?:        () => void
  onVerify?:        () => void
  onFlag?:          () => void
  onShipment?:      () => void
}

export function PaymentDetailSidebar({
  pay, canUpdatePayment, canVerify, canCreate,
  onRecord, onVerify, onFlag, onShipment,
}: PaymentDetailSidebarProps) {
  const days      = daysUntilDue(pay.dueDate)
  const isOverdue = (days ?? 0) < 0 && pay.paymentStatus !== 'PAID'
  const isDueSoon = (days ?? 999) <= 7 && (days ?? 0) >= 0 && pay.paymentStatus !== 'PAID'
  const paidPct   = pay.totalAmount > 0
    ? Math.min(Math.round((pay.paidAmount / pay.totalAmount) * 100), 100)
    : 0

  const showRecord   = canUpdatePayment && pay.paymentStatus !== 'PAID'
  const showVerify   = canVerify        && pay.verificationStatus !== 'VERIFIED'
  const showFlag     = canVerify        && pay.verificationStatus !== 'FLAGGED'
  const showShipment = canCreate        && pay.paymentStatus === 'PAID' && !pay.shipmentId

  return (
    <aside className="flex flex-col gap-4 w-[264px] flex-shrink-0">

      {/* Status card */}
      <div className="card card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Status</p>
          <PaymentStatusBadge status={pay.paymentStatus} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <VerificationStatusBadge status={pay.verificationStatus} />
          <DivisionBadge division={pay.division} />
        </div>

        {/* Due date indicator */}
        {pay.paymentStatus !== 'PAID' && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md',
            isOverdue ? 'bg-[#fdecea]' : isDueSoon ? 'bg-[#fdf7ed]' : 'bg-[#f0f4f7]'
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
                  : isDueSoon ? `Due in ${days} days`
                  : `Due ${formatDate(pay.dueDate)}`}
              </p>
              {!isOverdue && <p className="text-[10px] text-[#7a8fa3]">{formatDate(pay.dueDate)}</p>}
            </div>
          </div>
        )}

        {/* Installment badge */}
        {pay.isInstallment && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#e8f3fb]">
            <Layers size={13} className="text-[#123d6b]" strokeWidth={1.8} />
            <span className="text-[11px] font-medium text-[#123d6b]">
              {pay.installmentCount}x Installment Plan
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(showRecord || showVerify || showFlag || showShipment) && (
        <div className="card">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Actions</p>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {showRecord && (
              <Button variant="primary" size="sm" icon={<CreditCard size={12} />} className="w-full justify-start" onClick={onRecord}>
                {pay.isInstallment ? 'Record Installment' : 'Record Payment'}
              </Button>
            )}
            {showVerify && (
              <Button variant="secondary" size="sm" icon={<CheckCircle size={12} />} className="w-full justify-start text-[#1a5c38]" onClick={onVerify}>
                Verify Payment
              </Button>
            )}
            {showFlag && (
              <Button variant="ghost" size="sm" icon={<Flag size={12} />} className="w-full justify-start text-[#7a8fa3]" onClick={onFlag}>
                Flag for Review
              </Button>
            )}
            {showShipment && (
              <Button variant="primary" size="sm" icon={<Package size={12} />} className="w-full justify-start" onClick={onShipment}>
                Generate Shipment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Finance summary */}
      <div className="card card-body">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Finance Summary</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#edf1f5] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${paidPct}%`,
              background: pay.paymentStatus === 'PAID' ? '#1a5c38' :
                          isOverdue ? '#8c1f1f' : '#123d6b',
            }}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Total',     value: formatCurrency(pay.totalAmount,     pay.currency, { compact: true }), color: 'text-[#18273a]' },
            { label: 'Paid',      value: formatCurrency(pay.paidAmount,      pay.currency, { compact: true }), color: 'text-[#1a5c38]' },
            { label: 'Remaining', value: formatCurrency(pay.remainingAmount, pay.currency, { compact: true }),
              color: pay.remainingAmount > 0 ? (isOverdue ? 'text-[#8c1f1f] font-bold' : 'text-[#18273a] font-bold') : 'text-[#1a5c38]' },
          ].map((row) => (
            <div key={row.label} className={cn(
              'flex items-center justify-between',
              row.label === 'Remaining' && 'pt-2 border-t border-[#f0f4f7]'
            )}>
              <span className="text-[11px] text-[#7a8fa3]">{row.label}</span>
              <span className={cn('text-[12px] tabular-nums', row.color)}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Shipment */}
      {pay.shipmentId && (
        <div className="card card-body">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Linked Documents</p>
          <Link
            href={`/dashboard/shipment/${pay.shipmentId}`}
            className="flex items-center gap-2.5 p-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-[#eaf6f0] flex-shrink-0">
              <Package size={11} className="text-[#1a5c38]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#18273a]">{pay.shipmentNumber}</p>
              <p className="text-[10px] text-[#1a5c38]">Shipment · Generated</p>
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
              <p className="text-[12px] font-medium text-[#18273a]">{pay.createdBy}</p>
              <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(pay.createdAt)}</p>
            </div>
          </div>
          {pay.updatedBy && (
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#7a8fa3]">Last updated</p>
                <p className="text-[12px] font-medium text-[#18273a]">{pay.updatedBy}</p>
                <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(pay.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
