// FILE: hooks/useCargo.ts

// ═══════════════════════════════════════════════════════════════
// CARGO REACT QUERY HOOKS
//
// Mirrors hooks/useHm.ts conventions exactly. Reuses the generic
// quotation-references hooks (useQuotationTemplate, useQuotationAdjusters,
// useQuotationSurveyors from hooks/useQuotationReferences.ts, Phase 1)
// for reference/master data instead of duplicating them here - see
// lib/api/cargo.ts's top comment for why.
//
// Cargo has no separate workflow endpoints - submit/approve/etc. reuse
// the existing hooks/useQuotations.ts hooks unchanged, exactly like
// P&I and H&M.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import * as api from '@/lib/api/cargo'
import { quotationKeys } from './useQuotations'
import type { CargoQuotationDetail, CreateCargoQuotationPayload, UpdateCargoQuotationPayload } from '@/types/cargo'

export const cargoKeys = {
  all:     ['cargo'] as const,
  details: () => [...cargoKeys.all, 'detail'] as const,
  detail:  (quotationId: string) => [...cargoKeys.details(), quotationId] as const,
}

export function useCargoQuotation(
  quotationId: string | undefined,
  options?: Partial<UseQueryOptions<CargoQuotationDetail>>
) {
  return useQuery({
    queryKey: cargoKeys.detail(quotationId ?? ''),
    queryFn:  () => api.fetchCargoQuotation(quotationId as string),
    enabled:  Boolean(quotationId),
    ...options,
  })
}

/**
 * Step 2 of the Cargo create flow (step 1 is useCreateQuotation() from
 * hooks/useQuotations.ts). Invalidates the Cargo detail, the base
 * quotation detail (its `cargoQuotation` field goes from null to
 * set), and both list views.
 */
export function useCreateCargoQuotation(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCargoQuotationPayload) => api.createCargoQuotation(quotationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cargoKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

export function useUpdateCargoQuotation(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCargoQuotationPayload) => api.updateCargoQuotation(quotationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cargoKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}