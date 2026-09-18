'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { QuotationForm } from '@/components/quotations/QuotationForm'
import { useQuotation } from '@/hooks/useQuotations'
import { useAuth } from '@/context/AuthContext'
import { isQuotationEditableByUser, isStatusEditable, isTechnicalUnitOwner } from '@/lib/quotationEditability'
import { ROUTES } from '@/config/routes'
import { getQuotationStatusLabel } from '@/lib/quotationStatus'
import type { ApiError } from '@/types/api'

interface Props {
  id: string
}

export function QuotationEditClient({ id }: Props) {
  const router = useRouter()
  const { user, can, isLoading: authLoading } = useAuth()
  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id)

  if (authLoading || isLoading) {
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

  // Frontend UX checks mirroring the backend's own restrictions
  // (quotations.service.ts: update() requires DRAFT/REVISION status
  // and matching technicalUnitId). These are convenience only — the
  // backend independently re-checks and rejects on every PATCH
  // regardless of what this page shows. Uses the same granular checks
  // as isQuotationEditableByUser (lib/quotationEditability.ts) so the
  // "why can't I edit this" reason below can never disagree with the
  // actual editability decision.
  const isEditableStatus = isStatusEditable(quotation.status)
  const isOwnUnit = isTechnicalUnitOwner(quotation, user)
  const canEdit = can('quotation', 'update') && isQuotationEditableByUser(quotation, user)

  if (!canEdit) {
    const reason = !isEditableStatus
      ? `This quotation is ${getQuotationStatusLabel(quotation.status)} and can no longer be edited.`
      : !isOwnUnit
        ? "This quotation belongs to a different technical unit than yours."
        : "You don't have permission to edit quotations."

    return (
      <div className="page-container">
        <PageHeader
          title={`Edit ${quotation.quotationNumber}`}
          breadcrumbs={[
            { label: 'Quotations', href: ROUTES.quotations.list },
            { label: quotation.quotationNumber, href: ROUTES.quotations.detail(id) },
            { label: 'Edit' },
          ]}
        />
        <ErrorState message="Editing unavailable" description={reason} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push(ROUTES.quotations.detail(id))}>
            Back to quotation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Edit ${quotation.quotationNumber}`}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: quotation.quotationNumber, href: ROUTES.quotations.detail(id) },
          { label: 'Edit' },
        ]}
      />
      <QuotationForm mode="edit" quotation={quotation} />
    </div>
  )
}