// FILE: components/quotations/QuotationDetailDispatcher.tsx
'use client'

import { PageSpinner } from '@/components/ui/Spinner'
import { QuotationDetailClient } from './QuotationDetailClient'
import { useQuotation } from '@/hooks/useQuotations'
import { usePniQuotation } from '@/hooks/usePni'
import { HmQuotationDetailClient } from '@/components/hm/HmQuotationDetailClient'
import { CargoQuotationDetailClient } from '@/components/cargo/CargoQuotationDetailClient'
import { PniQuotationDetailClient } from '@/components/pni/PniQuotationDetailClient'
import type { ApiError } from '@/types/api'

interface Props {
  id: string
}

/**
 * Single entry point for /dashboard/quotations/:id - decides which
 * detail view to render.
 *
 * H&M and Cargo are both detected directly from the ALREADY-FETCHED
 * base quotation (GET /quotations/:id embeds `hmQuotation` and
 * `cargoQuotation`, each `{...} | null` - see types/quotation.ts) - no
 * extra request needed for either, and no `InsuranceType.code`
 * convention to rely on either (hm.service.ts/cargo.service.ts do
 * check code === 'HM'/'CARGO' at CREATE time, but that's not surfaced
 * on the read side, so the embedded fields are still the correct
 * signal to use here, exactly like the list page already does).
 *
 * P&I has no equivalent embedded flag (GET /quotations/:id never
 * includes `pniQuotation` - see types/pni.ts), so it's still detected
 * by probing GET /pni/quotations/:id, same strategy as before. That
 * probe is only fired once we know the quotation is NEITHER H&M NOR
 * Cargo, to avoid firing it needlessly for those (more common) cases.
 *
 * None match -> existing generic QuotationDetailClient, unchanged.
 */
export function QuotationDetailDispatcher({ id }: Props) {
  const quotationQuery = useQuotation(id)
  const isHm = quotationQuery.data?.hmQuotation != null
  const isCargo = quotationQuery.data?.cargoQuotation != null
  const pniQuery = usePniQuotation(id, {
    retry:   false,
    enabled: quotationQuery.isSuccess && !isHm && !isCargo,
  })

  if (quotationQuery.isLoading) {
    return <div className="page-container"><PageSpinner label="Loading quotation…" /></div>
  }

  if (isHm) {
    return <HmQuotationDetailClient quotationId={id} />
  }

  if (isCargo) {
    return <CargoQuotationDetailClient quotationId={id} />
  }

  if (quotationQuery.isSuccess) {
    if (pniQuery.isLoading) {
      return <div className="page-container"><PageSpinner label="Loading quotation…" /></div>
    }
    if (pniQuery.data) {
      return <PniQuotationDetailClient quotationId={id} />
    }
    // 404 (no P&I detail attached either) -> generic detail. Any other
    // error probing /pni is swallowed the same way it was before this
    // phase; QuotationDetailClient performs its own independent
    // fetch/error handling for the base quotation regardless.
    const apiError = pniQuery.error as ApiError | undefined
    if (pniQuery.isError && apiError?.status !== 404) {
      // fall through to generic detail
    }
  }

  return <QuotationDetailClient id={id} />
}