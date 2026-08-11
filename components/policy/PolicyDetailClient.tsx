'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Pencil, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { fetchPolicyDetail, fetchPolicyHistory, completePlacement } from '@/lib/api/policy'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/context/ToastContext'
import { PolicyStatusBadge } from './PolicyStatusBadge'
import { ParticipantsPanel } from './ParticipantsPanel'
import { PolicyActivityTimeline } from './PolicyActivityTimeline'
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper'
import { ROUTES } from '@/config/routes'

interface PolicyDetailClientProps {
  id: string
}

export function PolicyDetailClient({ id }: PolicyDetailClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { canEdit } = useRole()
  const { success, error: toastError } = useToast()

  const { data: policy, isLoading, isError, refetch } = useQuery({
    queryKey: ['policy-detail', id],
    queryFn:  () => fetchPolicyDetail(id),
  })

  const { data: history = [] } = useQuery({
    queryKey: ['policy-history', id],
    queryFn:  () => fetchPolicyHistory(id),
    enabled:  !!policy,
  })

  const completeMutation = useMutation({
    mutationFn: () => completePlacement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['policy-history', id] })
      queryClient.invalidateQueries({ queryKey: ['policy-list'] })
      success('Placement Completed', 'The placement has been marked complete.')
    },
    onError: () => {
      toastError('Complete failed', 'Could not complete the placement. Ensure the leader and share total (100%) are set.')
    },
  })

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !policy) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load policy"
          description="The policy record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const canComplete =
    canEdit &&
    policy.status === 'PLACEMENT_IN_PROGRESS' &&
    !!policy.leader &&
    (policy.totalShare ?? 0) === 100

  return (
    <div className="page-container">
      <PageHeader
        title={policy.policyNumber}
        description="Policy placement details"
        breadcrumbs={[
          { label: 'Policy Placement', href: ROUTES.policy.list },
          { label: policy.policyNumber },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={() => router.push(ROUTES.policy.list)}>
              Back
            </Button>
            {canEdit && policy.status !== 'READY_FOR_RFI' && (
              <Button variant="secondary" size="sm" icon={<Pencil size={13} />} onClick={() => router.push(ROUTES.policy.edit(id))}>
                Edit
              </Button>
            )}
            {canComplete && (
              <Button
                variant="primary" size="sm" icon={<CheckCircle2 size={13} />}
                loading={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                Complete Placement
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e8f3fb]">
          <Shield size={16} className="text-[#123d6b]" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">{policy.policyNumber}</h1>
          <p className="text-[12px] text-[#7a8fa3]">Quotation: {policy.quotationNumber ?? policy.quotationId}</p>
        </div>
        <PolicyStatusBadge status={policy.status} className="ml-auto" />
      </div>

      <div className="mb-6">
        <WorkflowStepper currentStage="POLICY" compact />
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h3 className="text-[13px] font-semibold text-[#18273a]">Policy Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Policy Number</p>
              <p className="text-[13px] text-[#18273a] font-mono">{policy.policyNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Policy Date</p>
              <p className="text-[13px] text-[#18273a]">{policy.policyDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Insured</p>
              <p className="text-[13px] text-[#18273a]">{policy.insured ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Quotation</p>
              <p className="text-[13px] text-[#18273a] font-mono">{policy.quotationNumber ?? policy.quotationId}</p>
            </div>
          </div>
        </div>

        <ParticipantsPanel policy={policy} canEdit={canEdit} />

        <PolicyActivityTimeline history={history} />
      </div>
    </div>
  )
}