'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Pencil, ArrowLeft, Send, XCircle } from 'lucide-react'
import { fetchRfiDetail, fetchRfiHistory, submitRfi, cancelRfi } from '@/lib/api/rfi'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ConfirmModal } from '@/components/modal/BaseModal'
import { useModal } from '@/hooks/useModal'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/context/ToastContext'
import { RfiStatusBadge } from './RfiStatusBadge'
import { RfiChecklistPanel } from './RfiChecklistPanel'
import { RfiAttachmentPanel } from './RfiAttachmentPanel'
import { RfiActivityTimeline } from './RfiActivityTimeline'
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper'
import { ROUTES } from '@/config/routes'

interface RfiDetailClientProps {
  id: string
}

export function RfiDetailClient({ id }: RfiDetailClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { canEdit } = useRole()
  const { success, error: toastError } = useToast()
  const cancelModal = useModal()

  const { data: rfi, isLoading, isError, refetch } = useQuery({
    queryKey: ['rfi-detail', id],
    queryFn:  () => fetchRfiDetail(id),
  })

  const { data: history = [] } = useQuery({
    queryKey: ['rfi-history', id],
    queryFn:  () => fetchRfiHistory(id),
    enabled:  !!rfi,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['rfi-detail', id] })
    queryClient.invalidateQueries({ queryKey: ['rfi-history', id] })
    queryClient.invalidateQueries({ queryKey: ['rfi-list'] })
  }

  const submitMutation = useMutation({
    mutationFn: () => submitRfi(id),
    onSuccess: () => {
      invalidate()
      success('Submitted to Finance', 'The RFI has been submitted and Finance has been notified.')
    },
    onError: () => {
      toastError('Submit failed', 'Could not submit. Ensure the placement is complete, share totals 100%, and all required checklist items and attachments are provided.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelRfi(id),
    onSuccess: () => {
      invalidate()
      success('RFI Cancelled', 'The request has been cancelled.')
      cancelModal.close()
    },
    onError: () => toastError('Cancel failed', 'Could not cancel the RFI. Please try again.'),
  })

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !rfi) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState message="Failed to load RFI" description="The request record could not be loaded." onRetry={() => refetch()} />
      </div>
    )
  }

  const requiredIncomplete = rfi.checklist.filter((c) => c.isRequired && !c.isCompleted)
  const canSubmit =
    canEdit &&
    rfi.status === 'DRAFT' &&
    !!rfi.leader &&
    rfi.totalShare === 100 &&
    requiredIncomplete.length === 0

  const canCancel = canEdit && rfi.status === 'WAITING_FINANCE'
  const canEditDoc = canEdit && rfi.status === 'DRAFT'

  return (
    <div className="page-container">
      <PageHeader
        title={`RFI ${rfi.id}`}
        description="Request For Invoice"
        breadcrumbs={[
          { label: 'Request For Invoice', href: ROUTES.rfi.list },
          { label: rfi.id },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={() => router.push(ROUTES.rfi.list)}>
              Back
            </Button>
            {canEditDoc && (
              <Button variant="secondary" size="sm" icon={<Pencil size={13} />} onClick={() => router.push(ROUTES.rfi.edit(id))}>
                Edit
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" size="sm" icon={<XCircle size={13} />} onClick={() => cancelModal.open()}>
                Cancel RFI
              </Button>
            )}
            {canSubmit && (
              <Button
                variant="primary" size="sm" icon={<Send size={13} />}
                loading={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                Submit to Finance
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e8f3fb]">
          <ClipboardList size={16} className="text-[#123d6b]" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">RFI {rfi.id}</h1>
          <p className="text-[12px] text-[#7a8fa3]">Policy: {rfi.policyNumber ?? rfi.policyId}</p>
        </div>
        <RfiStatusBadge status={rfi.status} className="ml-auto" />
      </div>

      <div className="mb-6">
        <WorkflowStepper currentStage="RFI" compact />
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h3 className="text-[13px] font-semibold text-[#18273a]">Request Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Policy</p>
              <p className="text-[13px] text-[#18273a] font-mono">{rfi.policyNumber ?? rfi.policyId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Insured</p>
              <p className="text-[13px] text-[#18273a]">{rfi.insured ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Leader</p>
              <p className="text-[13px] text-[#18273a]">
                {rfi.leader ? `${rfi.leader.insuranceCompanyName ?? rfi.leader.insuranceCompanyId} (${rfi.leader.sharePercentage}%)` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Total Share</p>
              <p className={rfi.totalShare === 100 ? 'text-[13px] font-mono font-semibold text-[#1a6b3a]' : 'text-[13px] font-mono font-semibold text-[#9b2020]'}>
                {rfi.totalShare}%
              </p>
            </div>
          </div>
        </div>

        <RfiChecklistPanel rfiId={id} checklist={rfi.checklist} canEdit={canEditDoc} />

        <RfiAttachmentPanel rfiId={id} attachments={rfi.attachments} canEdit={canEditDoc} />

        <RfiActivityTimeline history={history} />
      </div>

      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel RFI"
        description="Cancel this request? This action cannot be undone."
        confirmLabel="Cancel RFI"
        cancelLabel="Keep RFI"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </div>
  )
}