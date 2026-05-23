'use client'

import { useState }               from 'react'
import { useRouter }              from 'next/navigation'
import type { VoucherDocument }   from '@/types/voucher'
import { VoucherDetailHeader }    from './VoucherDetailHeader'
import { VoucherDetailSidebar }   from './VoucherDetailSidebar'
import { VoucherActivityTimeline }from './VoucherActivityTimeline'
import { ApprovalPanel }          from './ApprovalPanel'
import {
  VoucherInfoPanel,
  PaymentInfoPanel,
  VoucherBankInfoPanel,
  LinkedInvoicePanel,
  LinkedQSMiniPanel,
  VoucherAttachmentsPanel,
  VoucherNotesPanel,
} from './VoucherDetailInfoPanels'
import { ConfirmModal, BaseModal, ModalHeader, ModalBody, ModalFooter } from '@/components/modal/BaseModal'
import { Button }     from '@/components/ui/Button'
import { FormField }  from '@/components/form/FormField'
import { Textarea }   from '@/components/ui/Input'
import { useModal }   from '@/hooks/useModal'
import { useRole }    from '@/hooks/useRole'

interface VoucherDetailClientProps {
  vch: VoucherDocument
}

export function VoucherDetailClient({ vch }: VoucherDetailClientProps) {
  const router = useRouter()
  const { canEdit, canVerify, canCreate } = useRole()

  const approveModal = useModal()
  const rejectModal  = useModal()
  const paymentModal = useModal()
  const cancelModal  = useModal()

  const [isProcessing, setProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handle = (action: () => Promise<void>, onClose: () => void) => async () => {
    setProcessing(true)
    try {
      await action()
      onClose()
      router.refresh()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <VoucherDetailHeader
        vch={vch}
        canEdit={canEdit}
        canVerify={canVerify}
        canCreate={canCreate}
        onApprove={() => approveModal.open()}
        onReject={()  => rejectModal.open()}
        onPayment={() => paymentModal.open()}
        onCancel={()  => cancelModal.open()}
        onDownload={() => { /* wire to downloadVoucherPDF */ }}
      />

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <VoucherInfoPanel     vch={vch} />
          <LinkedInvoicePanel   vch={vch} />
          <LinkedQSMiniPanel    vch={vch} />
          <PaymentInfoPanel     vch={vch} />
          <VoucherBankInfoPanel vch={vch} />
          <ApprovalPanel        voucher={vch} />
          <VoucherAttachmentsPanel vch={vch} />
          <VoucherNotesPanel    vch={vch} />
          <VoucherActivityTimeline activity={vch.activity ?? []} />
        </div>

        {/* Sidebar */}
        <VoucherDetailSidebar
          vch={vch}
          canEdit={canEdit}
          canVerify={canVerify}
          canCreate={canCreate}
          onEdit={()     => router.push(`/dashboard/voucher/${vch.id}/edit`)}
          onApprove={() => approveModal.open()}
          onReject={()  => rejectModal.open()}
          onPayment={() => paymentModal.open()}
          onCancel={()  => cancelModal.open()}
          onDownload={() => { /* wire */ }}
        />
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={handle(async () => { await new Promise((r) => setTimeout(r, 800)) }, approveModal.close)}
        title="Approve Voucher"
        description={`Approve ${vch.docNumber}? This will authorise the payment amount of ${vch.currency} ${vch.amount.toLocaleString()} to be processed.`}
        confirmLabel="Approve Voucher"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* Reject modal with reason input */}
      <BaseModal open={rejectModal.isOpen} onClose={rejectModal.close} size="sm">
        <ModalHeader title="Reject Voucher" onClose={rejectModal.close} />
        <ModalBody>
          <p className="text-[13px] text-[#3a5068] mb-4">
            Reject {vch.docNumber}? Please provide a reason for the rejection.
          </p>
          <FormField label="Rejection Reason" required>
            <Textarea
              rows={3}
              placeholder="Explain why this voucher is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={rejectModal.close} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={isProcessing}
            disabled={!rejectReason.trim()}
            onClick={handle(async () => { await new Promise((r) => setTimeout(r, 800)) }, rejectModal.close)}
          >
            Reject Voucher
          </Button>
        </ModalFooter>
      </BaseModal>

      <ConfirmModal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        onConfirm={handle(async () => {
          await new Promise((r) => setTimeout(r, 800))
          router.push(`/dashboard/payment/new?voucherId=${vch.id}`)
        }, paymentModal.close)}
        title="Generate Payment"
        description={`Generate a payment record from ${vch.docNumber}? This will advance the workflow to the Payment stage.`}
        confirmLabel="Generate Payment"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={handle(async () => {
          await new Promise((r) => setTimeout(r, 600))
          router.push('/dashboard/voucher')
        }, cancelModal.close)}
        title="Cancel Voucher"
        description={`Cancel ${vch.docNumber}? This cannot be undone.`}
        confirmLabel="Cancel Voucher"
        cancelLabel="Keep Voucher"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  )
}
