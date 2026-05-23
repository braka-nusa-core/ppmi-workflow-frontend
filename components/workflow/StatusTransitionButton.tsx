'use client'

import { ArrowRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { DocumentStatus, WorkflowStage } from '@/types/workflow'
import { getNextStage, isLastStage } from '@/hooks/useWorkflow'

// ─── Advance to Next Stage ───────────────────────────────────────
interface AdvanceStageButtonProps {
  currentStage: WorkflowStage
  onAdvance:    () => void
  loading?:     boolean
  disabled?:    boolean
  canAdvance?:  boolean
}

export function AdvanceStageButton({
  currentStage,
  onAdvance,
  loading,
  disabled,
  canAdvance = true,
}: AdvanceStageButtonProps) {
  const nextStage = getNextStage(currentStage)

  if (!nextStage || isLastStage(currentStage)) return null
  if (!canAdvance) return null

  const STAGE_LABELS: Record<WorkflowStage, string> = {
    QS:       'Quotation Sheet',
    INVOICE:  'Invoice',
    VOUCHER:  'Voucher',
    PAYMENT:  'Payment',
    SHIPMENT: 'Shipment',
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      disabled={disabled}
      icon={<ArrowRight size={13} />}
      onClick={onAdvance}
    >
      Advance to {STAGE_LABELS[nextStage]}
    </Button>
  )
}

// ─── Status Action Buttons ───────────────────────────────────────
interface StatusActionButtonsProps {
  currentStatus: DocumentStatus
  onApprove?:   () => void
  onReject?:    () => void
  loading?:     boolean
  disabled?:    boolean
}

export function StatusActionButtons({
  currentStatus,
  onApprove,
  onReject,
  loading,
  disabled,
}: StatusActionButtonsProps) {
  if (currentStatus !== 'PENDING' && currentStatus !== 'IN_PROGRESS') return null

  return (
    <div className="flex items-center gap-2">
      {onReject && (
        <Button
          variant="secondary"
          size="sm"
          icon={<X size={13} />}
          onClick={onReject}
          disabled={disabled || loading}
          className="text-[#9b2020] border-[#f5b4b4] hover:bg-[#fdecea]"
        >
          Reject
        </Button>
      )}
      {onApprove && (
        <Button
          variant="primary"
          size="sm"
          icon={<Check size={13} />}
          onClick={onApprove}
          loading={loading}
          disabled={disabled}
        >
          Approve
        </Button>
      )}
    </div>
  )
}
