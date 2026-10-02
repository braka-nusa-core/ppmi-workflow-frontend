// FILE: components/pni/PniQuotationDetailClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner, Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useAuth } from '@/context/AuthContext'
import { useQuotation, useQuotationApprovals, useQuotationHistory, quotationKeys } from '@/hooks/useQuotations'
import { usePniQuotation, pniKeys } from '@/hooks/usePni'
import { isQuotationEditableByUser } from '@/lib/quotationEditability'
import { getQuotationStatusLabel, QUOTATION_STATUS_BADGE_VARIANT } from '@/lib/quotationStatus'
import { formatDateTime } from '@/lib/format'
import { ROUTES } from '@/config/routes'
import {
  QuotationOverviewPanel,
  QuotationClientPanel,
  QuotationFinancialPanel,
  QuotationSubmissionsPanel,
  QuotationAttachmentsPanel,
} from '@/components/quotations/QuotationDetailPanels'
import {
  PniOverviewPanel,
  PniVesselsPanel,
  PniInsuranceBlocksPanel,
  PniQuoteLevelPanel,
  PniInstallmentsPanel,
  PniAdminPanel,
} from './PniDetailPanels'
import { PniWorkflowActions } from './PniWorkflowActions'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
}

// Same lazy-load pattern as components/quotations/QuotationDetailClient.tsx
// (kept local rather than exported/shared, matching that file's own
// convention of not extracting this into a shared component).
function LazySection({ id, title }: { id: string; title: 'approvals' | 'history' }) {
  const [expanded, setExpanded] = useState(false)
  const approvalsQuery = useQuotationApprovals(title === 'approvals' && expanded ? id : undefined)
  const historyQuery   = useQuotationHistory(title === 'history' && expanded ? id : undefined)
  const query = title === 'approvals' ? approvalsQuery : historyQuery

  return (
    <Card noPadding>
      <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="text-[13px] font-semibold text-[#18273a]">{title === 'approvals' ? 'Approval Log' : 'Status History'}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {query.isLoading ? (
            <Spinner size="sm" label="Loading…" />
          ) : query.isError ? (
            <p className="text-[12px] text-[#9b2020]">{(query.error as ApiError | undefined)?.message ?? 'Failed to load'}</p>
          ) : title === 'approvals' ? (
            approvalsQuery.data && approvalsQuery.data.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {approvalsQuery.data.map((a) => (
                  <li key={a.id} className="text-[12px] text-[#18273a]">
                    <span className="font-medium">{a.action}</span>
                    {a.approver?.fullname && ` by ${a.approver.fullname}`} on {formatDateTime(a.createdAt)}
                    {a.note && ` — ${a.note}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#b5cede]">No approval actions recorded yet</p>
            )
          ) : historyQuery.data && historyQuery.data.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {historyQuery.data.map((h) => (
                <li key={h.id} className="text-[12px] text-[#18273a]">
                  {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `→ ${h.toStatus}`}
                  {h.actor?.fullname && ` by ${h.actor.fullname}`} on {formatDateTime(h.createdAt)}
                  {h.note && ` — ${h.note}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-[#b5cede]">No history recorded yet</p>
          )}
        </div>
      )}
    </Card>
  )
}

/**
 * P&I detail = GET /quotations/:id (status, client, financials, generic
 * nested resources, attachments, submissions, approvals/history) MERGED
 * with GET /pni/quotations/:id (vessels, insurance blocks, deductibles,
 * provisions, cover restrictions, installments, required documents,
 * organization roles). Neither endpoint alone has the full picture —
 * see types/pni.ts's top comment. Reuses the exact same generic panels
 * (Overview/Client/Financial/Submissions/Attachments) the base
 * QuotationDetailClient uses, rather than re-displaying that data from
 * the looser-typed `pni.quotation` sub-object.
 */
export function PniQuotationDetailClient({ quotationId }: Props) {
  const router = useRouter()
  const qc = useQueryClient()
  const { user, can, isLoading: authLoading } = useAuth()
  const quotationQuery = useQuotation(quotationId)
  const pniQuery = usePniQuotation(quotationId)

  if (authLoading || quotationQuery.isLoading || pniQuery.isLoading) {
    return <div className="page-container"><PageSpinner label="Loading P&I quotation…" /></div>
  }

  if (!can('quotation', 'read')) {
    return (
      <div className="page-container">
        <ErrorState message="You don't have access to view quotations" description="Contact your administrator if you believe this is incorrect." />
      </div>
    )
  }

  if (quotationQuery.isError || !quotationQuery.data || pniQuery.isError || !pniQuery.data) {
    const apiError = (quotationQuery.error ?? pniQuery.error) as ApiError | undefined
    return (
      <div className="page-container">
        <ErrorState
          message={apiError?.message ?? 'Failed to load P&I quotation'}
          description="An error occurred while loading this quotation. Please try again."
          onRetry={() => { quotationQuery.refetch(); pniQuery.refetch() }}
        />
      </div>
    )
  }

  const quotation = quotationQuery.data
  const pni = pniQuery.data
  const canEdit = can('quotation', 'update') && isQuotationEditableByUser(quotation, user)

  function invalidateBoth() {
    qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
    qc.invalidateQueries({ queryKey: pniKeys.detail(quotationId) })
  }

  return (
    <div className="page-container">
      <PageHeader
        title={quotation.quotationNumber}
        breadcrumbs={[{ label: 'Quotations', href: ROUTES.quotations.list }, { label: quotation.quotationNumber }]}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={() => router.push(ROUTES.quotations.list)}>
              Back to list
            </Button>
            {canEdit && (
              <Button variant="secondary" size="sm" icon={<Pencil size={13} />} onClick={() => router.push(ROUTES.quotations.pniEdit(quotationId))}>
                Edit
              </Button>
            )}
            <Badge variant={QUOTATION_STATUS_BADGE_VARIANT[quotation.status]} dot>
              {getQuotationStatusLabel(quotation.status)}
            </Badge>
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <PniWorkflowActions
          quotationId={quotationId}
          status={quotation.status}
          technicalUnit={quotation.technicalUnit}
          onActionSuccess={invalidateBoth}
        />

        <QuotationOverviewPanel quotation={quotation} />
        <QuotationClientPanel quotation={quotation} />
        <PniOverviewPanel pni={pni} />
        <QuotationFinancialPanel quotation={quotation} />
        <PniVesselsPanel vessels={pni.vessels} />
        <PniInsuranceBlocksPanel pni={pni} />
        <PniQuoteLevelPanel pni={pni} />
        <PniInstallmentsPanel pni={pni} />
        <PniAdminPanel pni={pni} />
        <QuotationSubmissionsPanel submissions={quotation.submissions} />
        <QuotationAttachmentsPanel attachments={quotation.attachments} />

        <LazySection id={quotationId} title="approvals" />
        <LazySection id={quotationId} title="history" />
      </div>
    </div>
  )
}