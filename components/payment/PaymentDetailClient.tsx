'use client'

import { useRouter }              from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PaymentDetailHeader }    from './PaymentDetailHeader'
import { PaymentDetailSidebar }   from './PaymentDetailSidebar'
import { PaymentActivityTimeline } from './PaymentActivityTimeline'
import { PaymentInstallmentTable } from './PaymentInstallmentTable'
import { RecordPaymentModal }     from './RecordPaymentModal'
import {
  PaymentInfoPanel,
  PaymentSummaryPanel,
  PaymentLinkedDocsPanel,
  PaymentNotesPanel,
} from './PaymentDetailInfoPanels'
import { LoadingSkeleton }        from '@/components/feedback/LoadingSkeleton'
import { ErrorState }             from '@/components/feedback/ErrorState'
import { useModal }               from '@/hooks/useModal'
import { useRole }                from '@/hooks/useRole'
import { fetchPaymentDetail, createPayment } from '@/lib/api/payment'
import type { RecordPaymentFormData } from '@/lib/validations/payment'

interface Props { id: string }

export function PaymentDetailClient({ id }: Props) {
  const router = useRouter()
  const qc     = useQueryClient()
  const { canUpdatePayment } = useRole()

  const recordModal = useModal<unknown>()

  // ── Fetch ──────────────────────────────────────────────────────
  const { data: pay, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-detail', id],
    queryFn:  () => fetchPaymentDetail(id),
  })

  // ── Shared invalidation helper ─────────────────────────────────
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['payment-detail', id] }),
      qc.invalidateQueries({ queryKey: ['payment-list'] }),
    ])
  }

  // ── Loading / error states ─────────────────────────────────────
  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSkeleton /></div>

  if (isError || !pay) {
    return (
      <ErrorState
        message="Failed to load payment"
        description="An error occurred while loading this payment. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <PaymentDetailHeader
        payment={pay}
        canUpdatePayment={canUpdatePayment}
        onRecord={() => recordModal.open()}
        onDownload={() => { /* wire to fetchPaymentReceiptUrl */ }}
      />

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PaymentInfoPanel      pay={pay} />
          <PaymentSummaryPanel   pay={pay} />
          <PaymentLinkedDocsPanel pay={pay} />
          <PaymentNotesPanel     pay={pay} />

          {pay.isInstallment && pay.installments && pay.installments.length > 0 && (
            <PaymentInstallmentTable
              payment={pay}
              canUpdatePayment={canUpdatePayment}
              onRecordInstallment={() => recordModal.open()}
            />
          )}

          <PaymentActivityTimeline activity={pay.activity ?? []} />
        </div>

        <PaymentDetailSidebar
          payment={pay}
          canUpdatePayment={canUpdatePayment}
          onRecord={() => recordModal.open()}
          onDownload={() => { /* wire to fetchPaymentReceiptUrl */ }}
        />
      </div>

      {/* Record payment — creates a new payment row against the linked invoice */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={pay}
        onSuccess={(data: RecordPaymentFormData) => {
          createPayment({
            invoiceId:       pay.invoiceId,
            paidDate:        data.paidDate,
            paidAmount:      data.paidAmount,
            paymentMethod:   data.paymentMethod,
            bankAccount:     data.bankAccount,
            referenceNumber: data.referenceNumber,
            notes:           data.notes,
          }).then(async () => {
            recordModal.close()
            await invalidate()
            router.refresh()
          })
        }}
      />
    </div>
  )
}
