'use client'

import { ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { LinkedWorkflowNavigator } from '@/components/workflow/LinkedWorkflowNavigator'
import type { PaymentDocument } from '@/types/payment'

interface PaymentDetailHeaderProps {
  payment:      PaymentDocument
  canUpdatePayment: boolean
  onRecord?:    () => void
  onDownload?:  () => void
}

export function PaymentDetailHeader({
  payment: pay,
  canUpdatePayment,
  onRecord,
  onDownload,
}: PaymentDetailHeaderProps) {
  const router = useRouter()

  const showRecord = canUpdatePayment && pay.paymentStatus !== 'PAID'

  // Build linked workflow nodes. QS/Voucher are optional upstream
  // context (may not be present on the Payment response under the
  // invoice-origin model) — only included when both id and number are
  // actually available, since LinkedDoc.docNumber requires a string,
  // not string | undefined.
  const workflowLinks = [
    ...(pay.qsId && pay.qsNumber ? [{
      stage: 'QS' as const, docNumber: pay.qsNumber, href: `/dashboard/qs/${pay.qsId}`, isActive: false, isDone: true,
    }] : []),
    ...(pay.voucherId && pay.voucherNumber ? [{
      stage: 'VOUCHER_INVOICE' as const, docNumber: pay.voucherNumber, href: `/dashboard/voucher/${pay.voucherId}`, isActive: false, isDone: true,
    }] : []),
    { stage: 'INVOICE' as const, docNumber: pay.invoiceNumber, href: `/dashboard/invoice/${pay.invoiceId}`, isActive: false, isDone: true },
    { stage: 'INCOMING_PAYMENT' as const, docNumber: pay.docNumber, href: `/dashboard/payment/${pay.id}`, isActive: true, isDone: pay.paymentStatus === 'PAID' },
    ...(pay.shipmentId && pay.shipmentNumber ? [{
      stage: 'SHIPMENT' as const, docNumber: pay.shipmentNumber, href: `/dashboard/shipment/${pay.shipmentId}`, isActive: false, isDone: true,
    }] : []),
  ]

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#e2e5e9] px-7 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/payment')}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#f0f4f7] text-[#7a8fa3] hover:text-[#3a5068] transition-colors"
            aria-label="Back to Payment list"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[16px] font-semibold text-[#18273a] tracking-tight font-mono">{pay.docNumber}</h1>
              <PaymentStatusBadge status={pay.paymentStatus} />
            </div>
            <p className="text-[12px] text-[#7a8fa3] mt-0.5">{pay.insuredName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={12} />}
            onClick={onDownload}
          >
            Download Receipt
          </Button>
          {showRecord && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRecord}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      <div className={cn('mt-4')}>
        <LinkedWorkflowNavigator links={workflowLinks} />
      </div>
    </div>
  )
}
