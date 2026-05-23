import { CheckCircle, XCircle, Clock, User, AlertTriangle } from 'lucide-react'
import { cn }              from '@/lib/utils'
import { formatDateTime }  from '@/lib/format'
import type { VoucherDocument } from '@/types/voucher'

// ─── Approval step config ────────────────────────────────────────
interface ApprovalStep {
  label:     string
  status:    'done' | 'active' | 'waiting' | 'rejected'
  actor?:    string
  timestamp?:string
  notes?:    string
}

function resolveSteps(voucher: VoucherDocument): ApprovalStep[] {
  return [
    {
      label:     'Voucher Submitted',
      status:    voucher.status !== 'DRAFT' ? 'done' : 'active',
      actor:     voucher.createdBy,
      timestamp: voucher.createdAt,
    },
    {
      label:     'Pending Finance Approval',
      status:
        voucher.approvalStatus === 'APPROVED' ? 'done' :
        voucher.approvalStatus === 'REJECTED' ? 'rejected' :
        voucher.status === 'PENDING_APPROVAL' ? 'active' : 'waiting',
      actor:     voucher.approvalStatus !== 'WAITING' ? (voucher.approvedBy ?? voucher.rejectedBy) : voucher.approvalPIC,
      timestamp: voucher.approvedAt ?? voucher.rejectedAt,
      notes:     voucher.rejectionReason,
    },
    {
      label:  'Ready for Processing',
      status: voucher.status === 'APPROVED' || voucher.status === 'PROCESSED' ? 'done' : 'waiting',
      actor:  voucher.processedBy,
      timestamp: voucher.processedDate,
    },
    {
      label:  'Payment Generated',
      status: voucher.paymentId ? 'done' : 'waiting',
      actor:  voucher.processedBy,
    },
  ]
}

const STEP_ICON = {
  done:     { icon: CheckCircle, bg: 'bg-[#eaf6f0]', color: 'text-[#1a5c38]', line: 'bg-[#1a5c38]' },
  active:   { icon: Clock,       bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]', line: 'bg-[#d5e3ef]' },
  waiting:  { icon: Clock,       bg: 'bg-[#f0f4f7]', color: 'text-[#7a8fa3]', line: 'bg-[#edf1f5]' },
  rejected: { icon: XCircle,     bg: 'bg-[#fdecea]', color: 'text-[#8c1f1f]', line: 'bg-[#f0a0a0]' },
}

interface ApprovalPanelProps {
  voucher: VoucherDocument
}

export function ApprovalPanel({ voucher }: ApprovalPanelProps) {
  const steps = resolveSteps(voucher)

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <CheckCircle size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">Approval Progress</h3>
        </div>
        {/* Overall status */}
        <span className={cn(
          'text-[11px] font-semibold px-2 py-0.5 rounded border',
          voucher.approvalStatus === 'APPROVED' ? 'bg-[#eaf6f0] text-[#1a5c38] border-[#96d6b4]' :
          voucher.approvalStatus === 'REJECTED' ? 'bg-[#fdecea] text-[#8c1f1f] border-[#f0a0a0]' :
                                                  'bg-[#fdf7ed] text-[#7a5000] border-[#f0cd7a]'
        )}>
          {voucher.approvalStatus === 'APPROVED' ? 'Approved' :
           voucher.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
        </span>
      </div>

      <div className="px-5 py-4">
        {/* Approval PIC info */}
        {voucher.approvalPIC && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-[#f7f9fb] border border-[#edf1f5]">
            <User size={13} className="text-[#7a8fa3] flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#7a8fa3]">Assigned to</p>
              <p className="text-[12px] font-semibold text-[#18273a]">{voucher.approvalPIC}</p>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex flex-col">
          {steps.map((step, idx) => {
            const cfg    = STEP_ICON[step.status]
            const Icon   = cfg.icon
            const isLast = idx === steps.length - 1

            return (
              <div key={idx} className="flex gap-3">
                {/* Icon + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn('flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0', cfg.bg)}>
                    <Icon size={13} className={cfg.color} strokeWidth={1.8} />
                  </div>
                  {!isLast && (
                    <div
                      className={cn('w-px flex-1 my-1', cfg.line)}
                      style={{ minHeight: 16 }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn('flex flex-col pb-4', isLast && 'pb-0')}>
                  <p className={cn(
                    'text-[12px] font-semibold leading-tight',
                    step.status === 'waiting' ? 'text-[#7a8fa3]' : 'text-[#18273a]'
                  )}>
                    {step.label}
                  </p>
                  {step.actor && (
                    <p className="text-[11px] text-[#3a5068] mt-0.5">{step.actor}</p>
                  )}
                  {step.timestamp && (
                    <p className="text-[10px] text-[#7a8fa3] mt-0.5">{formatDateTime(step.timestamp)}</p>
                  )}
                  {step.status === 'rejected' && step.notes && (
                    <div className="flex items-start gap-1.5 mt-1.5 px-2 py-1.5 rounded bg-[#fdecea] border border-[#f0a0a0]">
                      <AlertTriangle size={11} className="text-[#8c1f1f] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#8c1f1f]">{step.notes}</p>
                    </div>
                  )}
                  {step.status === 'waiting' && (
                    <p className="text-[10px] text-[#b5cede] mt-0.5 italic">Waiting</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Approval notes if present */}
        {voucher.approvalNotes && (
          <div className="mt-4 pt-4 border-t border-[#f0f4f7]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1.5">
              Approval Instructions
            </p>
            <p className="text-[12px] text-[#18273a] bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-2 leading-relaxed">
              {voucher.approvalNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
