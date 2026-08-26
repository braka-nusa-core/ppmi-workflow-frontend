'use client'

import { Clock, Download, User, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, daysUntilDue, formatDateTime } from '@/lib/format'
import type { PaymentDocument } from '@/types/payment'
import { Button } from '@/components/ui/Button'

interface PaymentDetailSidebarProps {
  payment:          PaymentDocument
  canUpdatePayment: boolean
  onRecord?:        () => void
  onDownload?:      () => void
}

export function PaymentDetailSidebar({
  payment: pay,
  canUpdatePayment,
  onRecord,
  onDownload,
}: PaymentDetailSidebarProps) {
  const days      = pay.dueDate ? daysUntilDue(pay.dueDate) : null
  const isOverdue = days != null && days < 0 && pay.paymentStatus !== 'PAID'
  const paidPct   = pay.totalAmount > 0
    ? Math.min(Math.round((pay.paidAmount / pay.totalAmount) * 100), 100)
    : 0

  const showRecord = canUpdatePayment && pay.paymentStatus !== 'PAID'

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col gap-4">
      {/* Progress */}
      <div className="card">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Payment Progress</p>
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[20px] font-bold text-[#18273a] tabular-nums">{paidPct}%</span>
            <span className="text-[11px] text-[#7a8fa3]">
              {formatCurrency(pay.paidAmount, pay.currency, { compact: true })} / {formatCurrency(pay.totalAmount, pay.currency, { compact: true })}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f0f4f7] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${paidPct}%`, background: paidPct >= 100 ? '#1a6b3a' : '#123d6b' }}
            />
          </div>

          {isOverdue && (
            <div className="flex items-start gap-2 mt-3 px-2.5 py-2 rounded-md" style={{ background: '#fdecea', border: '1px solid #f0a0a0' }}>
              <AlertTriangle size={12} className="text-[#8c1f1f] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#8c1f1f]">Payment is overdue</p>
            </div>
          )}

          {pay.dueDate && (
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-[#7a8fa3]">
              <Clock size={11} />
              Due {formatDate(pay.dueDate)}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {(showRecord || true) && (
        <div className="card">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Actions</p>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {showRecord && (
              <Button variant="primary" size="sm" className="w-full justify-start" onClick={onRecord}>
                Record Payment
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<Download size={12} />} className="w-full justify-start text-[#7a8fa3]" onClick={onDownload}>
              Download Receipt
            </Button>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="card card-body">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Details</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[12px] text-[#3a5068]">
            <User size={12} className="text-[#9aa3ad] flex-shrink-0" />
            <span>Created by {pay.createdBy}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#3a5068]">
            <Clock size={12} className="text-[#9aa3ad] flex-shrink-0" />
            <span>{formatDateTime(pay.createdAt)}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
