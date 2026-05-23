'use client'

import { Check, FileText, Receipt, Wallet, CreditCard, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Workflow Stage Config ───────────────────────────────────────
export type WorkflowStage = 'QS' | 'INVOICE' | 'VOUCHER' | 'PAYMENT' | 'SHIPMENT'

const STAGES: {
  key: WorkflowStage
  label: string
  shortLabel: string
  icon: React.ElementType
}[] = [
  { key: 'QS',       label: 'Quotation Sheet', shortLabel: 'QS',       icon: FileText  },
  { key: 'INVOICE',  label: 'Invoice',          shortLabel: 'Invoice',  icon: Receipt   },
  { key: 'VOUCHER',  label: 'Voucher',           shortLabel: 'Voucher',  icon: Wallet    },
  { key: 'PAYMENT',  label: 'Payment',           shortLabel: 'Payment',  icon: CreditCard },
  { key: 'SHIPMENT', label: 'Shipment',          shortLabel: 'Shipment', icon: Package   },
]

type StageState = 'completed' | 'current' | 'upcoming'

function getStageState(
  stageKey: WorkflowStage,
  currentStage: WorkflowStage
): StageState {
  const stageIdx = STAGES.findIndex((s) => s.key === stageKey)
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage)

  if (stageIdx < currentIdx)  return 'completed'
  if (stageIdx === currentIdx) return 'current'
  return 'upcoming'
}

// ─── WorkflowStepper Props ───────────────────────────────────────
interface WorkflowStepperProps {
  currentStage: WorkflowStage
  completedStages?: WorkflowStage[]
  onStageClick?: (stage: WorkflowStage) => void
  compact?: boolean
  className?: string
}

export function WorkflowStepper({
  currentStage,
  completedStages,
  onStageClick,
  compact = false,
  className,
}: WorkflowStepperProps) {
  return (
    <div className={cn(
      'flex items-center w-full',
      compact ? 'gap-0' : 'gap-0',
      className
    )}>
      {STAGES.map((stage, idx) => {
        const state = completedStages
          ? completedStages.includes(stage.key)
            ? 'completed'
            : stage.key === currentStage
              ? 'current'
              : 'upcoming'
          : getStageState(stage.key, currentStage)

        const isLast = idx === STAGES.length - 1
        const isClickable = !!onStageClick

        return (
          <div key={stage.key} className="flex items-center flex-1">
            {/* Stage node */}
            <div
              className={cn(
                'flex flex-col items-center flex-shrink-0',
                isClickable && 'cursor-pointer group',
                compact ? 'gap-1' : 'gap-1.5'
              )}
              onClick={isClickable ? () => onStageClick?.(stage.key) : undefined}
            >
              {/* Icon circle */}
              <div className={cn(
                'flex items-center justify-center rounded-full border-2 transition-all duration-150',
                compact ? 'w-7 h-7' : 'w-8 h-8',
                state === 'completed' && [
                  'bg-[#1a6b3a] border-[#1a6b3a] text-white',
                ],
                state === 'current' && [
                  'bg-[#1e4a70] border-[#1e4a70] text-white',
                  isClickable && 'group-hover:bg-[#163858]',
                ],
                state === 'upcoming' && [
                  'bg-white border-[#ced3d9] text-[#9aa3ad]',
                  isClickable && 'group-hover:border-[#9aa3ad]',
                ]
              )}>
                {state === 'completed' ? (
                  <Check size={compact ? 12 : 14} strokeWidth={2.5} />
                ) : (
                  <stage.icon size={compact ? 12 : 14} />
                )}
              </div>

              {/* Label */}
              {!compact && (
                <span className={cn(
                  'text-[10px] font-medium whitespace-nowrap',
                  state === 'completed' && 'text-[#1a6b3a]',
                  state === 'current'   && 'text-[#1e4a70]',
                  state === 'upcoming'  && 'text-[#9aa3ad]',
                )}>
                  {stage.shortLabel}
                </span>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                'flex-1 h-0.5 mx-1',
                state === 'completed'
                  ? 'bg-[#1a6b3a]'
                  : 'bg-[#e2e5e9]'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Compact stage badge (for table cells) ───────────────────────
interface StageBadgeProps {
  stage: WorkflowStage
  className?: string
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const stageConfig = STAGES.find((s) => s.key === stage)
  if (!stageConfig) return null

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium',
      'bg-[#e8f4fd] text-[#1e4a70] border border-[#b3c9df]',
      className
    )}>
      <stageConfig.icon size={10} />
      {stageConfig.shortLabel}
    </span>
  )
}
