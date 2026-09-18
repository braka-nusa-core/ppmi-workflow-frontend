'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner, Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useQuotation, useQuotationApprovals, useQuotationHistory } from '@/hooks/useQuotations'
import { useAuth } from '@/context/AuthContext'
import { isQuotationEditableByUser } from '@/lib/quotationEditability'
import { getQuotationStatusLabel, QUOTATION_STATUS_BADGE_VARIANT } from '@/lib/quotationStatus'
import { formatDateTime } from '@/lib/format'
import { ROUTES } from '@/config/routes'
import type { ApiError } from '@/types/api'
import {
  QuotationOverviewPanel,
  QuotationClientPanel,
  QuotationFinancialPanel,
  QuotationSubmissionsPanel,
  QuotationAttachmentsPanel,
} from './QuotationDetailPanels'
import { QuotationObjectsSection } from './nested/QuotationObjectsSection'
import { QuotationCoveragesSection } from './nested/QuotationCoveragesSection'
import { QuotationTermsSection } from './nested/QuotationTermsSection'
import { QuotationWarrantiesSection } from './nested/QuotationWarrantiesSection'

interface Props {
  id: string
}

// ─── Lazily-loaded Approvals / History section ───────────────────
// Read-only for this phase — no approve/reject/history-writing action
// here (Phase 4). Data is only fetched once the section is expanded,
// to avoid loading it on every detail page visit.
function LazySection({
  id,
  title,
}: {
  id: string
  title: 'approvals' | 'history'
}) {
  const [expanded, setExpanded] = useState(false)

  const approvalsQuery = useQuotationApprovals(title === 'approvals' && expanded ? id : undefined)
  const historyQuery   = useQuotationHistory(title === 'history' && expanded ? id : undefined)
  const query = title === 'approvals' ? approvalsQuery : historyQuery

  return (
    <Card noPadding>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[13px] font-semibold text-[#18273a]">
          {title === 'approvals' ? 'Approval Log' : 'Status History'}
        </span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {query.isLoading ? (
            <Spinner size="sm" label="Loading…" />
          ) : query.isError ? (
            <p className="text-[12px] text-[#9b2020]">
              {(query.error as ApiError | undefined)?.message ?? 'Failed to load'}
            </p>
          ) : title === 'approvals' ? (
            approvalsQuery.data && approvalsQuery.data.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {approvalsQuery.data.map((a) => (
                  <li key={a.id} className="text-[12px] text-[#18273a]">
                    <span className="font-medium">{a.action}</span>
                    {a.approver?.fullname && ` by ${a.approver.fullname}`}
                    {' '}on {formatDateTime(a.createdAt)}
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
                  {h.actor?.fullname && ` by ${h.actor.fullname}`}
                  {' '}on {formatDateTime(h.createdAt)}
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

export function QuotationDetailClient({ id }: Props) {
  const router = useRouter()
  const { user, can, isLoading: authLoading } = useAuth()
  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id)

  // Auth must finish resolving (GET /profile) before we can trust
  // can('quotation','read') — otherwise a legitimately authorized user
  // sees a flash of "access denied" on every direct load/refresh,
  // since `user` is briefly null while the profile request is in
  // flight. Found during the Phase 3D integration audit.
  if (authLoading) {
    return (
      <div className="page-container">
        <PageSpinner label="Loading quotation…" />
      </div>
    )
  }

  // quotation:read gate — UX only. The backend independently enforces
  // this on every request; this just avoids rendering a page shell
  // for a user who will get a 403 from the API anyway.
  if (!can('quotation', 'read')) {
    return (
      <div className="page-container">
        <ErrorState
          message="You don't have access to view quotations"
          description="Contact your administrator if you believe this is incorrect."
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <PageSpinner label="Loading quotation…" />
      </div>
    )
  }

  if (isError || !quotation) {
    const apiError = error as ApiError | undefined
    return (
      <div className="page-container">
        <ErrorState
          message={apiError?.message ?? 'Failed to load quotation'}
          description="An error occurred while loading this quotation. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const canEdit = can('quotation', 'update') && isQuotationEditableByUser(quotation, user)

  return (
    <div className="page-container">
      <PageHeader
        title={quotation.quotationNumber}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: quotation.quotationNumber },
        ]}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={13} />}
              onClick={() => router.push(ROUTES.quotations.list)}
            >
              Back to list
            </Button>
            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil size={13} />}
                onClick={() => router.push(ROUTES.quotations.edit(id))}
              >
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
        <QuotationOverviewPanel quotation={quotation} />
        <QuotationClientPanel quotation={quotation} />
        <QuotationFinancialPanel quotation={quotation} />
        <QuotationObjectsSection quotationId={id} objects={quotation.objects} editable={canEdit} />
        <QuotationCoveragesSection quotationId={id} coverages={quotation.coverages} editable={canEdit} />
        <QuotationTermsSection quotationId={id} terms={quotation.terms} editable={canEdit} />
        <QuotationWarrantiesSection quotationId={id} warranties={quotation.warranties} editable={canEdit} />
        <QuotationSubmissionsPanel submissions={quotation.submissions} />
        <QuotationAttachmentsPanel attachments={quotation.attachments} />

        <LazySection id={id} title="approvals" />
        <LazySection id={id} title="history" />
      </div>
    </div>
  )
}