'use client'

import {
  Pencil,
  Receipt,
  Archive,
  CheckCircle,
  RotateCcw,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import type { QSDocument } from '@/types/qs'
import { QSStatusBadge }  from './QSStatusBadge'
import { DivisionBadge }  from '@/components/ui/Badge'
import { Button }         from '@/components/ui/Button'
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper'

interface QSDetailSidebarProps {
  qs:          QSDocument
  canEdit:     boolean
  canVerify:   boolean
  canCreate:   boolean
  onEdit?:     () => void
  onApprove?:  () => void
  onRevision?: () => void
  onInvoice?:  () => void
  onArchive?:  () => void
}

export function QSDetailSidebar({
  qs,
  canEdit,
  canVerify,
  canCreate,
  onEdit,
  onApprove,
  onRevision,
  onInvoice,
  onArchive,
}: QSDetailSidebarProps) {

  const showApprove  = canVerify && qs.status === 'PENDING'
  const showRevision = canVerify && qs.status === 'PENDING'
  const showInvoice  = canCreate && qs.status === 'APPROVED' && !qs.invoiceId
  const showEdit     = canEdit   && (qs.status === 'DRAFT' || qs.status === 'REVISION')

  return (
    <aside className="flex flex-col gap-4 w-[264px] flex-shrink-0">

      {/* ── Status Card ─────────────────────────────────────── */}
      <div className="card card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
            Status
          </p>
          <QSStatusBadge status={qs.status} />
        </div>
        <div className="flex items-center gap-2">
          <DivisionBadge division={qs.division} />
          <span className="text-[11px] text-[#7a8fa3]">
            {qs.type === 'NEW' ? 'New Policy' : 'Renewal'}
          </span>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      {(showEdit || showApprove || showRevision || showInvoice || onArchive) && (
        <div className="card">
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid #f0f4f7' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
              Actions
            </p>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {showEdit && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil size={12} />}
                className="w-full justify-start"
                onClick={onEdit}
              >
                Edit QS
              </Button>
            )}
            {showApprove && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle size={12} />}
                className="w-full justify-start"
                onClick={onApprove}
              >
                Approve QS
              </Button>
            )}
            {showRevision && (
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw size={12} />}
                className="w-full justify-start text-[#7a5000]"
                onClick={onRevision}
              >
                Request Revision
              </Button>
            )}
            {showInvoice && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Receipt size={12} />}
                className="w-full justify-start text-[#123d6b]"
                onClick={onInvoice}
              >
                Generate Invoice
              </Button>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Archive size={12} />}
                className="w-full justify-start text-[#7a8fa3]"
                onClick={onArchive}
              >
                Archive
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Workflow Position ────────────────────────────────── */}
      <div className="card card-body">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">
          Workflow Position
        </p>
        <WorkflowStepper
          currentStage="QS"
          completedStages={
            qs.status === 'COMPLETED' || qs.invoiceId
              ? ['QS']
              : []
          }
          compact
        />
        <p className="text-[11px] text-[#7a8fa3] mt-3">
          {qs.invoiceId
            ? 'Advanced to Invoice stage'
            : 'QS stage — not yet invoiced'
          }
        </p>
      </div>

      {/* ── Linked Documents ─────────────────────────────────── */}
      {qs.invoiceId && (
        <div className="card card-body">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">
            Linked Documents
          </p>
          <a
            href={`/dashboard/invoice/${qs.invoiceId}`}
            className="flex items-center gap-2.5 p-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-[#eaf6f0] flex-shrink-0">
              <Receipt size={11} className="text-[#1a5c38]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#18273a]">
                {qs.invoiceNumber}
              </p>
              <p className="text-[10px] text-[#1a5c38]">Invoice · Active</p>
            </div>
            <ArrowRight size={11} className="text-[#7a8fa3]" />
          </a>
        </div>
      )}

      {/* ── Record Info ──────────────────────────────────────── */}
      <div className="card card-body flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
          Record
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <User size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#7a8fa3]">Created by</p>
              <p className="text-[12px] font-medium text-[#18273a]">{qs.createdBy}</p>
              <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(qs.createdAt)}</p>
            </div>
          </div>
          {qs.updatedBy && (
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#7a8fa3]">Last updated by</p>
                <p className="text-[12px] font-medium text-[#18273a]">{qs.updatedBy}</p>
                <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(qs.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  )
}
