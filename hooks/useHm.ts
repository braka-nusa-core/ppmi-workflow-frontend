// FILE: hooks/useHm.ts

// ═══════════════════════════════════════════════════════════════
// H&M REACT QUERY HOOKS
//
// Mirrors hooks/usePni.ts conventions. Reuses the generic
// quotation-references hooks (useQuotationTemplate, useQuotationAdjusters,
// useQuotationSurveyors from hooks/useQuotationReferences.ts, Phase 1)
// for reference/master data instead of duplicating them here - see
// lib/api/hm.ts's top comment for why.
//
// H&M has no separate workflow endpoints - submit/approve/etc. reuse
// the existing hooks/useQuotations.ts hooks unchanged, exactly like P&I.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import * as api from '@/lib/api/hm'
import { quotationKeys } from './useQuotations'
import type { HmQuotationDetail, CreateHmQuotationPayload, UpdateHmQuotationPayload } from '@/types/hm'

export const hmKeys = {
  all:     ['hm'] as const,
  details: () => [...hmKeys.all, 'detail'] as const,
  detail:  (quotationId: string) => [...hmKeys.details(), quotationId] as const,
}

export function useHmQuotation(
  quotationId: string | undefined,
  options?: Partial<UseQueryOptions<HmQuotationDetail>>
) {
  return useQuery({
    queryKey: hmKeys.detail(quotationId ?? ''),
    queryFn:  () => api.fetchHmQuotation(quotationId as string),
    enabled:  Boolean(quotationId),
    ...options,
  })
}

/**
 * Step 2 of the H&M create flow (step 1 is useCreateQuotation() from
 * hooks/useQuotations.ts). Invalidates the H&M detail, the base
 * quotation detail (its `hmQuotation` field goes from null to set),
 * and both list views.
 */
export function useCreateHmQuotation(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHmQuotationPayload) => api.createHmQuotation(quotationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hmKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

export function useUpdateHmQuotation(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateHmQuotationPayload) => api.updateHmQuotation(quotationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hmKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}