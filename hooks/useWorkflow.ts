import { useCallback }   from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast }       from '@/context/ToastContext'
import { useRole }        from './useRole'
import type { WorkflowStage, DocumentStatus } from '@/types/workflow'
import type { ApiError }  from '@/types/api'

// ─── Stage transition rules ──────────────────────────────────────
const NEXT_STAGE: Partial<Record<WorkflowStage, WorkflowStage>> = {
  QS:      'INVOICE',
  INVOICE: 'VOUCHER',
  VOUCHER: 'PAYMENT',
  PAYMENT: 'SHIPMENT',
}

export function getNextStage(current: WorkflowStage): WorkflowStage | null {
  return NEXT_STAGE[current] ?? null
}

export function getPreviousStage(current: WorkflowStage): WorkflowStage | null {
  const entries = Object.entries(NEXT_STAGE) as [WorkflowStage, WorkflowStage][]
  const found = entries.find(([, next]) => next === current)
  return found ? found[0] : null
}

export function isLastStage(stage: WorkflowStage): boolean {
  return stage === 'SHIPMENT'
}

// ─── Status transition rules ─────────────────────────────────────
export const ALLOWED_STATUS_TRANSITIONS: Partial<Record<DocumentStatus, DocumentStatus[]>> = {
  DRAFT:       ['PENDING'],
  PENDING:     ['APPROVED', 'REJECTED'],
  APPROVED:    ['COMPLETED'],
  REJECTED:    ['DRAFT'],
  IN_PROGRESS: ['APPROVED', 'REJECTED'],
}

export function canTransitionStatus(
  from: DocumentStatus,
  to: DocumentStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

// ─── useWorkflowMutation ─────────────────────────────────────────
// Wraps a workflow transition API call with toast + query invalidation
interface WorkflowMutationOptions<TPayload> {
  mutationFn: (payload: TPayload) => Promise<unknown>
  successMessage: string
  invalidateKeys: string[][]
}

export function useWorkflowMutation<TPayload>({
  mutationFn,
  successMessage,
  invalidateKeys,
}: WorkflowMutationOptions<TPayload>) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      success(successMessage)
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (err: ApiError) => {
      error('Action failed', err.message)
    },
  })
}
