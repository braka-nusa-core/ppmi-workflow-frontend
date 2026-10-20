// FILE: components/hm/HmQuotationEditClient.tsx
'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { HmQuotationForm } from '@/components/hm/HmQuotationForm'
import { useQuotation } from '@/hooks/useQuotations'
import { useHmQuotation } from '@/hooks/useHm'
import { useAuth } from '@/context/AuthContext'
import { isQuotationEditableByUser, isStatusEditable, isTechnicalUnitOwner } from '@/lib/quotationEditability'
import { getQuotationStatusLabel } from '@/lib/quotationStatus'
import { ROUTES } from '@/config/routes'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
}

/**
 * Same shape as components/pni/PniQuotationEditClient.tsx, but H&M
 * needs BOTH the base quotation (GET /quotations/:id, for generic
 * fields + status/technicalUnit) AND the H&M detail (GET /hm/
 * quotations/:id, for vesselType/tradingWarranty/installments/etc.) -
 * unlike P&I, neither endpoint alone has everything this form edits.
 */
export function HmQuotationEditClient({ quotationId }: Props) {
  const router = useRouter()
  const { user, can, isLoading: authLoading } = useAuth()
  const quotationQuery = useQuotation(quotationId)
  const hmQuery = useHmQuotation(quotationId)

  if (authLoading || quotationQuery.isLoading || hmQuery.isLoading) {
    return <div className="page-container"><PageSpinner label="Loading H&M quotation…" /></div>
  }

  if (quotationQuery.isError || !quotationQuery.data || hmQuery.isError || !hmQuery.data) {
    const apiError = (quotationQuery.error ?? hmQuery.error) as ApiError | undefined
    return (
      <div className="page-container">
        <ErrorState
          message={apiError?.message ?? 'Failed to load H&M quotation'}
          description="An error occurred while loading this quotation. Please try again."
          onRetry={() => { quotationQuery.refetch(); hmQuery.refetch() }}
        />
      </div>
    )
  }

  const quotation = quotationQuery.data
  const hm = hmQuery.data
  const isEditableStatus = isStatusEditable(quotation.status)
  const isOwnUnit = isTechnicalUnitOwner(quotation, user)
  const canEdit = can('quotation', 'update') && isQuotationEditableByUser(quotation, user)

  if (!canEdit) {
    const reason = !isEditableStatus
      ? `This quotation is ${getQuotationStatusLabel(quotation.status)} and can no longer be edited.`
      : !isOwnUnit
        ? 'This quotation belongs to a different technical unit than yours.'
        : "You don't have permission to edit quotations."

    return (
      <div className="page-container">
        <PageHeader
          title={`Edit ${quotation.quotationNumber}`}
          breadcrumbs={[
            { label: 'Quotations', href: ROUTES.quotations.list },
            { label: quotation.quotationNumber, href: ROUTES.quotations.detail(quotationId) },
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
        title={`Edit ${quotation.quotationNumber} (H&M)`}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: quotation.quotationNumber, href: ROUTES.quotations.detail(quotationId) },
          { label: 'Edit' },
        ]}
      />
      <HmQuotationForm mode="edit" quotation={quotation} hm={hm} />
    </div>
  )
}