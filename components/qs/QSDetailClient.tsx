'use client'

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchQSDetail, approveQS, rejectQS, deleteQS } from '@/lib/api/qs'
import { QSDetailHeader }        from './QSDetailHeader'
import { QSDetailSidebar }       from './QSDetailSidebar'
import { QSActivityTimeline }    from './QSActivityTimeline'
import {
  PolicyInfoPanel,
  VesselInfoPanel,
  InsuranceInfoPanel,
  PremiumInfoPanel,
  AttachmentsPanel,
  NotesPanel,
} from './QSDetailInfoPanels'
import { ConfirmModal }          from '@/components/modal/BaseModal'
import { LoadingSkeleton }       from '@/components/feedback/LoadingSkeleton'
import { ErrorState }            from '@/components/feedback/ErrorState'
import { useModal }              from '@/hooks/useModal'
import { useRole }               from '@/hooks/useRole'
import { useToast }              from '@/context/ToastContext'

interface QSDetailClientProps {
  id: string
}

export function QSDetailClient({ id }: QSDetailClientProps) {
  const router       = useRouter()
  const queryClient  = useQueryClient()
  const { canEdit, canVerify, canCreate } = useRole()
  const { success, error: toastError } = useToast()

  const approveModal  = useModal()
  const revisionModal = useModal()
  const invoiceModal  = useModal()
  const archiveModal  = useModal()

  const [isApproving,  setApproving]  = useState(false)
  const [isRejecting,  setRejecting]  = useState(false)
  const [isGenerating, setGenerating] = useState(false)
  const [isArchiving,  setArchiving]  = useState(false)

  // ── Fetch detail ──────────────────────────────────────────────
  const { data: qs, isLoading, isError, refetch } = useQuery({
    queryKey: ['qs-detail', id],
    queryFn:  () => fetchQSDetail(id),
  })

  console.log(qs)

  // ── Mutations ─────────────────────────────────────────────────
  // After any mutation, invalidate both the list and this detail cache so
  // the list page reflects the change when the user navigates back.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['qs-list'] })
    queryClient.invalidateQueries({ queryKey: ['qs-detail', id] })
  }

  const approveMutation = useMutation({
    mutationFn: () => approveQS(id),
    onSuccess: () => {
      invalidate()
      setApproving(false)
      success('QS Approved', `${qs?.docNumber} has been approved successfully.`)
      approveModal.close()
    },
    onError: () => {
      toastError('Approval failed', 'Could not approve the QS. Please try again.')
      setApproving(false)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectQS(id),
    onSuccess: () => {
      invalidate()
      setRejecting(false)
      success('Revision Requested', `${qs?.docNumber} has been returned for revision.`)
      revisionModal.close()
    },
    onError: () => {
      toastError('Action failed', 'Could not request revision. Please try again.')
      setRejecting(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteQS(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qs-list'] })
      success('QS Archived', `${qs?.docNumber} has been archived.`)
      router.push('/dashboard/qs')
    },
    onError: () => {
      toastError('Archive failed', 'Could not archive the QS. Please try again.')
      setArchiving(false)
    },
  })

  // ── Handlers ─────────────────────────────────────────────────
  const handleApprove = async () => {
    setApproving(true)
    approveMutation.mutate()
  }

  const handleRevision = async () => {
    setRejecting(true)
    rejectMutation.mutate()
  }

  const handleGenerateInvoice = async () => {
    setGenerating(true)
    invoiceModal.close()
    router.push(`/dashboard/invoice/new?qsId=${id}`)
    // Reset after a tick — if navigation fails or user navigates back,
    // the button won't be stuck in a loading state.
    setTimeout(() => setGenerating(false), 500)
  }

  const handleArchive = async () => {
    setArchiving(true)
    deleteMutation.mutate()
  }

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────
  if (isError || !qs) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load quotation sheet"
          description="The QS document could not be loaded. It may have been deleted or you may not have access."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky Detail Header */}
      <QSDetailHeader
        qs={qs}
        canEdit={canEdit}
        canVerify={canVerify}
        canCreate={canCreate}
        onApprove={() => approveModal.open()}
        onRevision={() => revisionModal.open()}
        onInvoice={() => invoiceModal.open()}
        onArchive={() => archiveModal.open()}
      />

      {/* Body: main content + sidebar */}
      <div className="flex gap-5 px-7 py-6 flex-1 min-h-0">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PolicyInfoPanel    qs={qs} />
          <VesselInfoPanel    qs={qs} />
          <InsuranceInfoPanel qs={qs} />
          <PremiumInfoPanel   qs={qs} />
          <AttachmentsPanel   attachments={qs.attachments} />
          <NotesPanel         notes={qs.internalNotes} />
          <QSActivityTimeline activity={qs.activity ?? []} />
        </div>

        {/* Sidebar */}
        <QSDetailSidebar
          qs={qs}
          canEdit={canEdit}
          canVerify={canVerify}
          canCreate={canCreate}
          onEdit={() => router.push(`/dashboard/qs/${qs.id}/edit`)}
          onApprove={() => approveModal.open()}
          onRevision={() => revisionModal.open()}
          onInvoice={() => invoiceModal.open()}
          onArchive={() => archiveModal.open()}
        />
      </div>

      {/* Modals */}
      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={handleApprove}
        title="Approve Quotation Sheet"
        description={`Approve ${qs.docNumber}? This will mark the QS as approved and allow invoice generation.`}
        confirmLabel="Approve QS"
        cancelLabel="Cancel"
        variant="primary"
        loading={isApproving}
      />

      <ConfirmModal
        open={revisionModal.isOpen}
        onClose={revisionModal.close}
        onConfirm={handleRevision}
        title="Request Revision"
        description={`Return ${qs.docNumber} to the editor for revision? The status will change to Rejected.`}
        confirmLabel="Request Revision"
        cancelLabel="Cancel"
        variant="primary"
        loading={isRejecting}
      />

      <ConfirmModal
        open={invoiceModal.isOpen}
        onClose={invoiceModal.close}
        onConfirm={handleGenerateInvoice}
        title="Generate Invoice"
        description={`Generate an invoice from ${qs.docNumber}? This will advance the workflow to the Invoice stage.`}
        confirmLabel="Generate Invoice"
        cancelLabel="Cancel"
        variant="primary"
        loading={isGenerating}
      />

      <ConfirmModal
        open={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={handleArchive}
        title="Archive Quotation Sheet"
        description={`Archive ${qs.docNumber}? It will be removed from the active list but can be restored later.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="primary"
        loading={isArchiving}
      />
    </div>
  )
}