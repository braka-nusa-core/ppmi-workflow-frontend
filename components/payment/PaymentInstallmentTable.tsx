'use client'

import { CheckCircle2, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PaymentDocument, PaymentInstallment } from '@/types/payment'
import { PaymentStatusBadge } from './PaymentStatusBadge'

interface PaymentInstallmentTableProps {
  payment:          PaymentDocument
  canUpdatePayment: boolean
  onRecordInstallment: (installment: PaymentInstallment) => void
}

/**
 * Displays per-installment breakdown. NOTE: the backend Payment model
 * is flat (each row is one payment against an invoice) — installments
 * are not returned as a structured sub-array from any documented
 * endpoint, so payment.installments is always [] from the adapter
 * today. This table renders correctly (as empty) and does not crash;
 * it's kept for architectural readiness if the backend later exposes
 * a real installment breakdown.
 */
export function PaymentInstallmentTable({
  payment,
  canUpdatePayment,
  onRecordInstallment,
}: PaymentInstallmentTableProps) {
  const installments = payment.installments ?? []

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Installment Schedule</h3>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Status</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-[12px] text-[#7a8fa3] py-6">
                  No installment schedule available for this payment.
                </td>
              </tr>
            )}
            {installments.map((inst) => (
              <tr key={inst.id}>
                <td className="text-[12px] font-mono text-[#7a8fa3]">#{inst.installmentNumber}</td>
                <td className="text-[12px] text-[#3a5068]">{formatDate(inst.dueDate)}</td>
                <td className="text-[12px] font-mono text-[#18273a]">{formatCurrency(inst.amount, 'IDR')}</td>
                <td className="text-[12px] font-mono text-[#1a5c38]">
                  {inst.paidAmount != null ? formatCurrency(inst.paidAmount, 'IDR') : '—'}
                </td>
                <td><PaymentStatusBadge status={inst.status} /></td>
                <td>
                  {canUpdatePayment && inst.status !== 'PAID' && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[11px] font-medium text-[#123d6b] hover:underline"
                      onClick={() => onRecordInstallment(inst)}
                    >
                      <Clock size={11} /> Record
                    </button>
                  )}
                  {inst.status === 'PAID' && (
                    <span className="flex items-center gap-1 text-[11px] text-[#1a6b3a]">
                      <CheckCircle2 size={11} /> Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
