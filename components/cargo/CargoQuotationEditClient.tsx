// FILE: components/cargo/CargoQuotationEditClient.tsx
'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { CargoQuotationForm } from '@/components/cargo/CargoQuotationForm'
import { useQuotation } from '@/hooks/useQuotations'
import { useCargoQuotation } from '@/hooks/useCargo'
import { useAuth } from '@/context/AuthContext'
import { isQuotationEditableByUser, isStatusEditable, isTechnicalUnitOwner } from '@/lib/quotationEditability'
import { getQuotationStatusLabel } from '@/lib/quotationStatus'
import { ROUTES } from '@/config/routes'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
}

/**
 * Same shape as components/hm/HmQuotationEditClient.tsx - Cargo needs
 * BOTH the base quotation (GET /quotations/:id) AND the Cargo detail
 * (GET /cargo/quotations/:id), same reason as H&M: neither endpoint
 * alone has everything this form edits.
 */
export function CargoQuotationEditClient({ quotationId }: Props) {
  const router = useRouter()
  const { user, can, isLoading: authLoading } = useAuth()
  const quotationQuery = useQuotation(quotationId)
  const cargoQuery = useCargoQuotation(quotationId)

  if (authLoading || quotationQuery.isLoading || cargoQuery.isLoading) {
    return <div className="page-container"><PageSpinner label="Loading Cargo quotation…" /></div>
  }

  if (quotationQuery.isError || !quotationQuery.data || cargoQuery.isError || !cargoQuery.data) {
    const apiError = (quotationQuery.error ?? cargoQuery.error) as ApiError | undefined
    return (
      <div className="page-container">
        <ErrorState
          message={apiError?.message ?? 'Failed to load Cargo quotation'}
          description="An error occurred while loading this quotation. Please try again."
          onRetry={() => { quotationQuery.refetch(); cargoQuery.refetch() }}
        />
      </div>
    )
  }

  const quotation = quotationQuery.data
  const cargo = cargoQuery.data
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
        title={`Edit ${quotation.quotationNumber} (Cargo)`}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: quotation.quotationNumber, href: ROUTES.quotations.detail(quotationId) },
          { label: 'Edit' },
        ]}
      />
      <CargoQuotationForm mode="edit" quotation={quotation} cargo={cargo} />
    </div>
  )
}