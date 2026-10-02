// FILE: components/pni/PniOrGenericQuotationDetail.tsx
'use client'

import { PageSpinner } from '@/components/ui/Spinner'
import { QuotationDetailClient } from '@/components/quotations/QuotationDetailClient'
import { PniQuotationDetailClient } from './PniQuotationDetailClient'
import { usePniQuotation } from '@/hooks/usePni'
import type { ApiError } from '@/types/api'

interface Props {
  id: string
}

/**
 * The base Quotation has no reliable "is this P&I" flag on its own —
 * `GET /quotations/:id` never includes `pniQuotation` (see
 * types/pni.ts), and unlike H&M/Cargo, pni.service.ts's create does
 * not enforce a fixed InsuranceType.code either. So this is decided
 * the only reliable way available: attempt GET /pni/quotations/:id
 * and render the P&I detail if it exists, otherwise fall back to the
 * existing generic detail page unchanged. H&M/Cargo detail branching
 * is out of scope here (not implemented yet) and continues to render
 * via the generic detail page exactly as before.
 */
export function PniOrGenericQuotationDetail({ id }: Props) {
  const pniQuery = usePniQuotation(id, { retry: false })

  if (pniQuery.isLoading) {
    return <div className="page-container"><PageSpinner label="Loading quotation…" /></div>
  }

  if (pniQuery.data) {
    return <PniQuotationDetailClient quotationId={id} />
  }

  // 404 (no P&I detail attached) → generic detail. Any other error is
  // swallowed here too; PniQuotationDetailClient is never reached in
  // that case, and QuotationDetailClient performs its own independent
  // fetch/error handling for the base quotation regardless.
  const apiError = pniQuery.error as ApiError | undefined
  if (pniQuery.isError && apiError?.status !== 404) {
    // Non-404 failure probing /pni — still fall back rather than
    // blocking the page; QuotationDetailClient will surface its own
    // error state if the base quotation itself can't be loaded either.
  }

  return <QuotationDetailClient id={id} />
}