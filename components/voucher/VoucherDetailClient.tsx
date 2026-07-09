'use client'

import { useState }               from 'react'
import { useRouter }              from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVoucherDetail,
  updateVoucher,
  cancelVoucher,
} from '@/lib/api/voucher'
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
import {
  ConfirmModal,
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/modal/BaseModal'
import { LoadingSkeleton }  from '@/components/feedback/LoadingSkeleton'
import { ErrorState }       from '@/components/feedback/ErrorState'
import { Button }           from '@/components/ui/Button'
import { FormField }        from '@/components/form/FormField'
import { Textarea }         from '@/components/ui/Input'
import { useModal }         from '@/hooks/useModal'
import { useRole }          from '@/hooks/useRole'
import { useToast }         from '@/context/ToastContext'

interface VoucherDetailClientProps {
  id: string
}

export function VoucherDetailClient({ id }: VoucherDetailClientProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { canEdit, canVerify, canCreate } = useRole()
  const { success, error: toastError }   = useToast()

  const approveModal = useModal()
  const rejectModal  = useModal()
  const cancelModal  = useModal()

  const [rejectReason, setRejectReason] = useState('')

  // ── Fetch ─────────────────────────────────────────────────────
  const { data: vch, isLoading, isError, refetch } = useQuery({
    queryKey: ['voucher-detail', id],
    queryFn:  () => fetchVoucherDetail(id).then((r) => r.data),
  })

  // ── Shared invalidation ───────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
    queryClient.invalidateQueries({ queryKey: ['voucher-detail', id] })
  }

  // ── Approve ───────────────────────────────────────────────────
  // No dedicated /approve endpoint exists on the backend — use the
  // generic PATCH /vouchers/:id, same pattern as QS's approveQS().
  const approveMutation = useMutation({
    mutationFn: () => updateVoucher(id, { status: 'CLOSED' }),
    onSuccess: () => {
      invalidate()
      success('Voucher Approved', `${vch?.docNumber} has been approved.`)
      approveModal.close()
    },
    onError: () => {
      toastError('Approval failed', 'Could not approve the voucher. Please try again.')
    },
  })

  // ── Reject ────────────────────────────────────────────────────
  // No dedicated /reject endpoint exists on the backend — return the
  // voucher to DRAFT via the generic PATCH /vouchers/:id.
  const rejectMutation = useMutation({
    mutationFn: () => updateVoucher(id, { status: 'DRAFT' }),
    onSuccess: () => {
      invalidate()
      success('Voucher Rejected', `${vch?.docNumber} has been returned for revision.`)
      setRejectReason('')
      rejectModal.close()
    },
    onError: () => {
      toastError('Rejection failed', 'Could not reject the voucher. Please try again.')
    },
  })

  // ── Cancel ────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => cancelVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      success('Voucher Cancelled', `${vch?.docNumber} has been cancelled.`)
      router.push('/dashboard/voucher')
    },
    onError: () => {
      toastError('Cancellation failed', 'Could not cancel the voucher. Please try again.')
    },
  })

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (isError || !vch) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load voucher"
          description="The voucher document could not be loaded. It may have been deleted or you may not have access."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">

      <VoucherDetailHeader
        vch={vch}
        canEdit={canEdit}
        canVerify={canVerify}
        canCreate={canCreate}
        onApprove={() => approveModal.open()}
        onReject={()  => rejectModal.open()}
        onPayment={() => router.push(`/dashboard/payment/new?voucherId=${id}`)}
        onCancel={()  => cancelModal.open()}
        onDownload={() => { /* PDF download — handled separately */ }}
      />

      <div className="flex gap-5 px-7 py-6 flex-1">
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

        <VoucherDetailSidebar
          vch={vch}
          canEdit={canEdit}
          canVerify={canVerify}
          canCreate={canCreate}
          onEdit={()     => router.push(`/dashboard/voucher/${vch.id}/edit`)}
          onApprove={() => approveModal.open()}
          onReject={()  => rejectModal.open()}
          onPayment={() => router.push(`/dashboard/payment/new?voucherId=${id}`)}
          onCancel={()  => cancelModal.open()}
          onDownload={() => { /* PDF download */ }}
        />
      </div>

      {/* Approve */}
      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={() => approveMutation.mutate()}
        title="Approve Voucher"
        description={`Approve ${vch.docNumber}? This will authorise the payment amount of ${vch.currency} ${vch.amount.toLocaleString()} to be processed.`}
        confirmLabel="Approve Voucher"
        cancelLabel="Cancel"
        variant="primary"
        loading={approveMutation.isPending}
      />

      {/* Reject — custom modal with reason input */}
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
          <Button variant="secondary" onClick={rejectModal.close} disabled={rejectMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={rejectMutation.isPending}
            disabled={!rejectReason.trim()}
            onClick={() => rejectMutation.mutate()}
          >
            Reject Voucher
          </Button>
        </ModalFooter>
      </BaseModal>

      {/* Cancel */}
      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Voucher"
        description={`Cancel ${vch.docNumber}? This cannot be undone.`}
        confirmLabel="Cancel Voucher"
        cancelLabel="Keep Voucher"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </div>
  )
}