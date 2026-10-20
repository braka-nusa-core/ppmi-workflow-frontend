// FILE: components/pni/PniQuotationEditClient.tsx
'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { PniQuotationForm } from '@/components/pni/PniQuotationForm'
import { usePniQuotation } from '@/hooks/usePni'
import { useAuth } from '@/context/AuthContext'
import { isQuotationEditableByUser, isStatusEditable, isTechnicalUnitOwner } from '@/lib/quotationEditability'
import { getQuotationStatusLabel } from '@/lib/quotationStatus'
import { ROUTES } from '@/config/routes'
import type { QuotationStatus } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
}

/**
 * Same shape as components/quotations/QuotationEditClient.tsx, but
 * fetching from GET /pni/quotations/:quotationId (the base
 * /quotations endpoint never includes pniQuotation — see
 * types/pni.ts). Editability reuses the exact same UX-only checks;
 * `pni.quotation.status`/`technicalUnit` come back as loosely-typed
 * fields on PniQuotationDetail (see its comment), so they're narrowed
 * here rather than in the shared helper.
 */
export function PniQuotationEditClient({ quotationId }: Props) {
  const router = useRouter()
  const { user, can, isLoading: authLoading } = useAuth()
  const { data: pni, isLoading, isError, error, refetch } = usePniQuotation(quotationId)

  if (authLoading || isLoading) {
    return <div className="page-container"><PageSpinner label="Loading P&I quotation…" /></div>
  }

  if (isError || !pni) {
    const apiError = error as ApiError | undefined
    return (
      <div className="page-container">
        <ErrorState
          message={apiError?.message ?? 'Failed to load P&I quotation'}
          description="An error occurred while loading this quotation. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const status = pni.quotation.status as QuotationStatus
  const technicalUnit = pni.quotation.technicalUnit
  const isEditableStatus = isStatusEditable(status)
  const isOwnUnit = isTechnicalUnitOwner({ technicalUnit }, user)
  const canEdit = can('quotation', 'update') && isQuotationEditableByUser({ status, technicalUnit }, user)

  if (!canEdit) {
    const reason = !isEditableStatus
      ? `This quotation is ${getQuotationStatusLabel(status)} and can no longer be edited.`
      : !isOwnUnit
        ? 'This quotation belongs to a different technical unit than yours.'
        : "You don't have permission to edit quotations."

    return (
      <div className="page-container">
        <PageHeader
          title={`Edit ${pni.quotation.quotationNumber}`}
          breadcrumbs={[
            { label: 'Quotations', href: ROUTES.quotations.list },
            { label: pni.quotation.quotationNumber, href: ROUTES.quotations.detail(quotationId) },
            { label: 'Edit' },
          ]}
        />
        <ErrorState message="Editing unavailable" description={reason} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push(ROUTES.quotations.detail(quotationId))}>
            Back to quotation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Edit ${pni.quotation.quotationNumber} (P&I)`}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: pni.quotation.quotationNumber, href: ROUTES.quotations.detail(quotationId) },
          { label: 'Edit' },
        ]}
      />
      <PniQuotationForm mode="edit" pni={pni} />
    </div>
  )
}