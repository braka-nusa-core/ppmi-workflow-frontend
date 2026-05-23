import {
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  Package,
  ChevronRight,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkflowStage } from '@/types/workflow'

// ─── Stage config ────────────────────────────────────────────────
const STAGE_CONFIG: Record<WorkflowStage, {
  label: string
  icon:  React.ElementType
}> = {
  QS:       { label: 'Quotation Sheet', icon: FileText   },
  INVOICE:  { label: 'Invoice',          icon: Receipt    },
  VOUCHER:  { label: 'Voucher',           icon: Wallet     },
  PAYMENT:  { label: 'Payment',           icon: CreditCard },
  SHIPMENT: { label: 'Shipment',          icon: Package    },
}

const STAGE_ORDER: WorkflowStage[] = ['QS', 'INVOICE', 'VOUCHER', 'PAYMENT', 'SHIPMENT']

// ─── Linked document node ────────────────────────────────────────
interface LinkedDoc {
  stage:     WorkflowStage
  docNumber: string
  href:      string
  status?:   string
  isActive:  boolean   // current page stage
  isDone:    boolean   // stage completed / document exists
}

interface LinkedWorkflowNavigatorProps {
  links: LinkedDoc[]
  className?: string
}

export function LinkedWorkflowNavigator({ links, className }: LinkedWorkflowNavigatorProps) {
  const stagesInOrder = STAGE_ORDER.map((stage) =>
    links.find((l) => l.stage === stage) ?? null
  )

  return (
    <div
      className={cn(
        'flex items-center px-5 py-3 overflow-x-auto no-scrollbar',
        className
      )}
      style={{ background: '#f7f9fb', borderBottom: '1px solid #edf1f5' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mr-4 flex-shrink-0">
        Workflow
      </p>

      <div className="flex items-center gap-0">
        {stagesInOrder.map((doc, idx) => {
          const stage  = STAGE_ORDER[idx]
          const cfg    = STAGE_CONFIG[stage]
          const Icon   = cfg.icon
          const isLast = idx === STAGE_ORDER.length - 1

          // State
          const isActive  = doc?.isActive ?? false
          const isDone    = doc?.isDone   ?? false
          const hasDoc    = !!doc

          return (
            <div key={stage} className="flex items-center">
              {/* Node */}
              {hasDoc && doc?.href ? (
                <Link
                  href={doc.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
                    'transition-all duration-100',
                    isActive
                      ? 'bg-[#123d6b] text-white'
                      : isDone
                        ? 'bg-[#eaf6f0] text-[#1a5c38] hover:bg-[#d8f0e4]'
                        : 'bg-[#e8f3fb] text-[#123d6b] hover:bg-[#d5eaf7]'
                  )}
                >
                  {isDone && !isActive ? (
                    <Check size={11} strokeWidth={2.5} />
                  ) : (
                    <Icon size={11} strokeWidth={1.8} />
                  )}
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-semibold whitespace-nowrap">
                      {cfg.label}
                    </span>
                    <span className={cn(
                      'text-[9px] font-mono mt-0.5',
                      isActive ? 'text-white/70' : isDone ? 'text-[#1a5c38]/70' : 'text-[#123d6b]/70'
                    )}>
                      {doc.docNumber}
                    </span>
                  </div>
                </Link>
              ) : (
                /* Upcoming — no document yet */
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
                  'opacity-40 cursor-not-allowed select-none'
                )}>
                  <Icon size={11} className="text-[#7a8fa3]" strokeWidth={1.8} />
                  <span className="text-[10px] font-medium text-[#7a8fa3] whitespace-nowrap">
                    {cfg.label}
                  </span>
                </div>
              )}

              {/* Connector */}
              {!isLast && (
                <ChevronRight
                  size={12}
                  className={cn(
                    'mx-1 flex-shrink-0',
                    isDone ? 'text-[#1a5c38]' : 'text-[#b5cede]'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
