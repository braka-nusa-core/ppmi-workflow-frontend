'use client'

import { useState }               from 'react'
import { useRouter }              from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaymentInstallment } from '@/types/payment'
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
import { ConfirmModal, BaseModal, ModalHeader, ModalBody, ModalFooter } from '@/components/modal/BaseModal'
import { Button }      from '@/components/ui/Button'
import { FormField }   from '@/components/form/FormField'
import { Textarea }    from '@/components/ui/Input'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState }  from '@/components/feedback/ErrorState'
import { useModal }    from '@/hooks/useModal'
import { useRole }     from '@/hooks/useRole'
import { fetchPaymentDetail, updatePayment, deletePayment } from '@/lib/api/payment'

interface Props { id: string }

export function PaymentDetailClient({ id }: Props) {
  const router = useRouter()
  const qc     = useQueryClient()
  const { canUpdatePayment, canVerify, canCreate } = useRole()

  const recordModal   = useModal<PaymentInstallment>()
  const verifyModal   = useModal<unknown>()
  const flagModal     = useModal<unknown>()
  const shipmentModal = useModal<unknown>()
  const deleteModal   = useModal<unknown>()

  const [isProcessing, setProcessing] = useState(false)
  const [flagReason,   setFlagReason] = useState('')
  const [verifyNotes,  setVerifyNotes] = useState('')

  // ── Fetch ──────────────────────────────────────────────────────
  const { data: pay, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-detail', id],
    queryFn:  () => fetchPaymentDetail(id),
  })

  // ── Shared invalidation ─────────────────────────────────────────
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['payment-detail', id] }),
      qc.invalidateQueries({ queryKey: ['payment-list'] }),
    ])
  }

  const run = (action: () => Promise<void>, close: () => void) => async () => {
    setProcessing(true)
    try {
      await action()
      close()
      await invalidate()
    } finally {
      setProcessing(false)
    }
  }

  // ── Loading / error ─────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />

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

      <PaymentDetailHeader
        pay={pay}
        canUpdatePayment={canUpdatePayment}
        canVerify={canVerify}
        canCreate={canCreate}
        onRecord={()   => recordModal.open()}
        onVerify={()   => verifyModal.open()}
        onFlag={()     => flagModal.open()}
        onShipment={() => shipmentModal.open()}
      />

      <div className="flex gap-5 px-7 py-6 flex-1">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PaymentInfoPanel    pay={pay} />
          <PaymentSummaryPanel pay={pay} />

          {pay.isInstallment && pay.installments && pay.installments.length > 0 && (
            <PaymentInstallmentTable
              payment={pay}
              canUpdatePayment={canUpdatePayment}
              onRecordInstallment={(inst) => recordModal.open(inst)}
            />
          )}

          <PaymentLinkedDocsPanel pay={pay} />
          <PaymentNotesPanel      pay={pay} />
          <PaymentActivityTimeline activity={pay.activity ?? []} />
        </div>

        <PaymentDetailSidebar
          pay={pay}
          canUpdatePayment={canUpdatePayment}
          canVerify={canVerify}
          canCreate={canCreate}
          onRecord={()   => recordModal.open()}
          onVerify={()   => verifyModal.open()}
          onFlag={()     => flagModal.open()}
          onShipment={() => shipmentModal.open()}
        />
      </div>

      {/* Record payment receipt — PATCH /payments/:id */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={pay}
        installment={recordModal.data ?? null}
        isInstallment={!!recordModal.data}
        onSuccess={async (payId, paidAmount, remainingAmount, paymentDate, remarks) => {
          setProcessing(true)
          try {
            await updatePayment(payId, {
              paidAmount:      paidAmount,
              remainingAmount: remainingAmount,
              paymentDate:     paymentDate,
              paymentStatus:   remainingAmount <= 0 ? 'PAID' : 'INSTALLMENT',
              ...(remarks ? { remarks } : {}),
            })
            recordModal.close()
            await invalidate()
          } finally {
            setProcessing(false)
          }
        }}
      />

      {/* Verify — NO backend endpoint. Intentionally non-functional. */}
      <BaseModal open={verifyModal.isOpen} onClose={verifyModal.close} size="sm">
        <ModalHeader title="Verify Payment" description={pay.docNumber} onClose={verifyModal.close} />
        <ModalBody>
          <p className="text-[13px] text-[#3a5068] mb-4">
            Mark this payment as verified? This confirms the payment details have been reviewed.
          </p>
          <p className="text-[11px] text-[#e0a020] mb-4">
            Note: payment verification has no backend endpoint yet — this action will close the modal only.
          </p>
          <FormField label="Verification Notes" hint="Optional — internal remarks">
            <Textarea
              rows={3}
              placeholder="Add any verification notes..."
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
            />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={verifyModal.close} disabled={isProcessing}>Cancel</Button>
          <Button
            variant="primary"
            loading={isProcessing}
            onClick={() => {
              // INTENTIONALLY NON-FUNCTIONAL — no POST /payments/:id/verify
              verifyModal.close()
            }}
          >
            Verify Payment
          </Button>
        </ModalFooter>
      </BaseModal>

      {/* Flag — NO backend endpoint. Intentionally non-functional. */}
      <BaseModal open={flagModal.isOpen} onClose={flagModal.close} size="sm">
        <ModalHeader title="Flag for Review" description={pay.docNumber} onClose={flagModal.close} />
        <ModalBody>
          <p className="text-[13px] text-[#3a5068] mb-4">
            Flag this payment for review? The finance team will be notified to investigate.
          </p>
          <p className="text-[11px] text-[#e0a020] mb-4">
            Note: payment flagging has no backend endpoint yet — this action will close the modal only.
          </p>
          <FormField label="Reason" required>
            <Textarea
              rows={3}
              placeholder="Describe the issue or discrepancy..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={flagModal.close} disabled={isProcessing}>Cancel</Button>
          <Button
            variant="danger"
            loading={isProcessing}
            disabled={!flagReason.trim()}
            onClick={() => {
              // INTENTIONALLY NON-FUNCTIONAL — no POST /payments/:id/flag
              flagModal.close()
            }}
          >
            Flag Payment
          </Button>
        </ModalFooter>
      </BaseModal>

      {/* Generate Shipment — navigates; POST /shipments created on shipment page */}
      <ConfirmModal
        open={shipmentModal.isOpen}
        onClose={shipmentModal.close}
        onConfirm={run(async () => {
          router.push(`/dashboard/shipment/new?paymentId=${pay.id}&invoiceId=${pay.invoiceId}`)
        }, shipmentModal.close)}
        title="Generate Shipment"
        description={`Generate a shipment document from ${pay.docNumber}? This advances the workflow to the final Shipment stage.`}
        confirmLabel="Generate Shipment"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* Delete — hard delete: DELETE /payments/:id */}
      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={run(async () => {
          await deletePayment(pay.id)
          await qc.invalidateQueries({ queryKey: ['payment-list'] })
          router.push('/dashboard/payment')
        }, deleteModal.close)}
        title="Delete Payment"
        description={`Permanently delete ${pay.docNumber}? This cannot be undone — payment records are hard-deleted.`}
        confirmLabel="Delete Payment"
        cancelLabel="Cancel"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  )
}