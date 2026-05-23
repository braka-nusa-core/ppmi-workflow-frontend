'use client'

import { ArrowLeft, Pencil, Receipt, CheckCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn }        from '@/lib/utils'
import { Button }    from '@/components/ui/Button'
import { QSStatusBadge, QSTypeBadge } from './QSStatusBadge'
import { DivisionBadge } from '@/components/ui/Badge'
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper'
import type { QSDocument } from '@/types/qs'

interface QSDetailHeaderProps {
  qs:          QSDocument
  canEdit:     boolean
  canVerify:   boolean
  canCreate:   boolean
  onApprove?:  () => void
  onRevision?: () => void
  onInvoice?:  () => void
  onArchive?:  () => void
}

export function QSDetailHeader({
  qs,
  canEdit,
  canVerify,
  canCreate,
  onApprove,
  onRevision,
  onInvoice,
}: QSDetailHeaderProps) {
  const router = useRouter()

  const showApprove  = canVerify && qs.status === 'PENDING'
  const showRevision = canVerify && qs.status === 'PENDING'
  const showInvoice  = canCreate && qs.status === 'APPROVED' && !qs.invoiceId
  const showEdit     = canEdit   && (qs.status === 'DRAFT' || qs.status === 'REVISION')

  return (
    <div
      className="sticky top-[56px] z-30 bg-white"
      style={{ borderBottom: '1px solid #d5e3ef', boxShadow: '0 1px 4px rgba(7,25,52,0.06)' }}
    >
      {/* ── Top row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-7 py-4">

        {/* Left: back + identifiers */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/qs')}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md',
              'text-[#7a8fa3] hover:text-[#18273a] hover:bg-[#f0f4f7]',
              'transition-colors duration-100 flex-shrink-0'
            )}
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">
              {qs.docNumber}
            </h1>
            <QSStatusBadge status={qs.status} />
            <DivisionBadge division={qs.division} />
            <QSTypeBadge   type={qs.type} />
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          {showRevision && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={12} />}
              onClick={onRevision}
              className="text-[#7a5000]"
            >
              Request Revision
            </Button>
          )}
          {showApprove && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle size={12} />}
              onClick={onApprove}
            >
              Approve
            </Button>
          )}
          {showInvoice && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Receipt size={12} />}
              onClick={onInvoice}
              className="text-[#123d6b]"
            >
              Generate Invoice
            </Button>
          )}
          {showEdit && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil size={12} />}
              onClick={() => router.push(`/dashboard/qs/${qs.id}/edit`)}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* ── Workflow stepper strip ───────────────────────────── */}
      <div
        className="px-7 py-3 flex items-center gap-4"
        style={{ background: '#f7f9fb', borderTop: '1px solid #edf1f5' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] flex-shrink-0">
          Stage
        </span>
        <WorkflowStepper
          currentStage="QS"
          completedStages={qs.status === 'COMPLETED' || qs.invoiceId ? ['QS'] : []}
        />
        {qs.invoiceId && (
          <a
            href={`/dashboard/invoice/${qs.invoiceId}`}
            className="flex-shrink-0 text-[11px] font-medium text-[#1a5c38] hover:underline transition-colors"
          >
            → {qs.invoiceNumber}
          </a>
        )}
      </div>
    </div>
  )
}
