import {
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowStageCount } from '@/types/overview'
import type { WorkflowStage } from '@/types/workflow'
import type { ElementType } from 'react'

const STAGE_CONFIG: Record<WorkflowStage, {
  label: string
  icon:  ElementType
  color: string
}> = {
  QS:       { label: 'Quotation Sheet', icon: FileText,   color: '#123d6b' },
  INVOICE:  { label: 'Invoice',          icon: Receipt,    color: '#2d6495' },
  VOUCHER:  { label: 'Voucher',           icon: Wallet,     color: '#3d7baf' },
  PAYMENT:  { label: 'Payment',           icon: CreditCard, color: '#174e87' },
  SHIPMENT: { label: 'Shipment',          icon: Package,    color: '#1a5c38' },
}

interface StatusPillProps {
  count:   number
  label:   string
  variant: 'pending' | 'inProgress' | 'completed' | 'overdue'
}

const PILL_STYLES = {
  pending:    { bg: 'bg-[#f0f4f7]',  text: 'text-[#3a5068]',  dot: 'bg-[#7a8fa3]'  },
  inProgress: { bg: 'bg-[#e8f3fb]',  text: 'text-[#123d6b]',  dot: 'bg-[#123d6b]'  },
  completed:  { bg: 'bg-[#eaf6f0]',  text: 'text-[#1a5c38]',  dot: 'bg-[#1a5c38]'  },
  overdue:    { bg: 'bg-[#fdecea]',  text: 'text-[#8c1f1f]',  dot: 'bg-[#8c1f1f]'  },
}

function StatusPill({ count, label, variant }: StatusPillProps) {
  const s = PILL_STYLES[variant]
  if (count === 0 && variant !== 'completed') return null

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded', s.bg)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
      <span className={cn('text-[11px] font-medium', s.text)}>
        {count} {label}
      </span>
    </div>
  )
}

interface WorkflowPipelineStatusProps {
  data: WorkflowStageCount[]
}

export function WorkflowPipelineStatus({ data }: WorkflowPipelineStatusProps) {
  const stages: WorkflowStage[] = ['QS', 'INVOICE', 'VOUCHER', 'PAYMENT', 'SHIPMENT']

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h3 className="text-[14px] font-semibold text-[#18273a]">
            Workflow Pipeline
          </h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">
            QS → Invoice → Voucher → Payment → Shipment
          </p>
        </div>
        <a
          href="/dashboard/pi/qs"
          className="text-[11px] font-medium text-[#123d6b] hover:text-[#0d2d50] hover:underline transition-colors duration-100"
        >
          View all
        </a>
      </div>

      {/* Pipeline stages */}
      <div className="divide-y divide-[#f0f4f7]">
        {stages.map((stageKey, idx) => {
          const config    = STAGE_CONFIG[stageKey]
          const stageData = data.find((d) => d.stage === stageKey)
          const Icon      = config.icon

          // Progress bar width: completed / total
          const pct = stageData && stageData.total > 0
            ? Math.round((stageData.completed / stageData.total) * 100)
            : 0

          return (
            <div key={stageKey} className="px-5 py-4">
              <div className="flex items-start gap-4">

                {/* Stage icon + connector */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ background: config.color + '14', border: `1px solid ${config.color}28` }}
                  >
                    <Icon size={14} style={{ color: config.color }} strokeWidth={1.8} />
                  </div>
                  {idx < stages.length - 1 && (
                    <div
                      className="w-px mt-1 flex-1"
                      style={{ background: '#edf1f5', minHeight: 8 }}
                    />
                  )}
                </div>

                {/* Stage body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#18273a]">
                        {config.label}
                      </span>
                      {(stageData?.overdue ?? 0) > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#fdecea] text-[#8c1f1f] border border-[#f0a0a0]">
                          {stageData?.overdue ?? 0} overdue
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-[#7a8fa3]">
                      {stageData?.completed ?? 0} / {stageData?.total ?? 0} completed
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-[#edf1f5] rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width:      `${pct}%`,
                        background: config.color,
                        opacity:    0.85,
                      }}
                    />
                  </div>

                  {/* Status pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusPill
                      count={stageData?.inProgress ?? 0}
                      label="in progress"
                      variant="inProgress"
                    />
                    <StatusPill
                      count={stageData?.pending ?? 0}
                      label="pending"
                      variant="pending"
                    />
                    <StatusPill
                      count={stageData?.completed ?? 0}
                      label="completed"
                      variant="completed"
                    />
                    {(stageData?.overdue ?? 0) > 0 && (
                      <StatusPill
                        count={stageData?.overdue ?? 0}
                        label="overdue"
                        variant="overdue"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
