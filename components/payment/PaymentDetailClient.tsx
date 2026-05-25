'use client'

import { useState }                from 'react'
import { useRouter }               from 'next/navigation'
import type { PaymentDocument, PaymentInstallment } from '@/types/payment'
import { PaymentDetailHeader }     from './PaymentDetailHeader'
import { PaymentDetailSidebar }    from './PaymentDetailSidebar'
import { PaymentActivityTimeline } from './PaymentActivityTimeline'
import { PaymentInstallmentTable } from './PaymentInstallmentTable'
import { RecordPaymentModal }      from './RecordPaymentModal'
import {
  PaymentInfoPanel,
  PaymentSummaryPanel,
  PaymentLinkedDocsPanel,
  PaymentNotesPanel,
} from './PaymentDetailInfoPanels'
import { ConfirmModal, BaseModal, ModalHeader, ModalBody, ModalFooter } from '@/components/modal/BaseModal'
import { Button }    from '@/components/ui/Button'
import { FormField } from '@/components/form/FormField'
import { Textarea }  from '@/components/ui/Input'
import { useModal }  from '@/hooks/useModal'
import { useRole }   from '@/hooks/useRole'

interface PaymentDetailClientProps {
  pay: PaymentDocument
}

export function PaymentDetailClient({ pay }: PaymentDetailClientProps) {
  const router = useRouter()
  const { canUpdatePayment, canVerify, canCreate } = useRole()

  const recordModal    = useModal<PaymentInstallment>()
  const verifyModal    = useModal()
  const flagModal      = useModal()
  const shipmentModal  = useModal()

  const [isProcessing, setProcessing] = useState(false)
  const [flagReason,   setFlagReason] = useState('')
  const [verifyNotes,  setVerifyNotes] = useState('')

  const handle = (action: () => Promise<void>, close: () => void) => async () => {
    setProcessing(true)
    try {
      await action()
      close()
      router.refresh()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
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

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PaymentInfoPanel    pay={pay} />
          <PaymentSummaryPanel pay={pay} />

          {/* Installment table — shown only for installment payments */}
          {pay.isInstallment && pay.installments && (
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

        {/* Sidebar */}
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

      {/* ── Modals ────────────────────────────────────────────── */}

      {/* Record payment / installment */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={pay as any}
        installment={recordModal.data ?? null}
        isInstallment={!!recordModal.data}
        onSuccess={() => { recordModal.close(); router.refresh() }}
      />

      {/* Verify with optional notes */}
      <BaseModal open={verifyModal.isOpen} onClose={verifyModal.close} size="sm">
        <ModalHeader title="Verify Payment" description={pay.docNumber} onClose={verifyModal.close} />
        <ModalBody>
          <p className="text-[13px] text-[#3a5068] mb-4">
            Mark this payment as verified? This confirms the payment details have been reviewed.
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
            onClick={handle(async () => { await new Promise((r) => setTimeout(r, 700)) }, verifyModal.close)}
          >
            Verify Payment
          </Button>
        </ModalFooter>
      </BaseModal>

      {/* Flag with required reason */}
      <BaseModal open={flagModal.isOpen} onClose={flagModal.close} size="sm">
        <ModalHeader title="Flag for Review" description={pay.docNumber} onClose={flagModal.close} />
        <ModalBody>
          <p className="text-[13px] text-[#3a5068] mb-4">
            Flag this payment for review? The finance team will be notified to investigate.
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
            onClick={handle(async () => { await new Promise((r) => setTimeout(r, 700)) }, flagModal.close)}
          >
            Flag Payment
          </Button>
        </ModalFooter>
      </BaseModal>

      {/* Generate Shipment */}
      <ConfirmModal
        open={shipmentModal.isOpen}
        onClose={shipmentModal.close}
        onConfirm={handle(async () => {
          await new Promise((r) => setTimeout(r, 800))
          router.push(`/dashboard/shipment/new?paymentId=${pay.id}`)
        }, shipmentModal.close)}
        title="Generate Shipment"
        description={`Generate a shipment document from ${pay.docNumber}? This advances the workflow to the final Shipment stage.`}
        confirmLabel="Generate Shipment"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />
    </div>
  )
}
