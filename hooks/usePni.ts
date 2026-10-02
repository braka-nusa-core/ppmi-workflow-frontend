// ═══════════════════════════════════════════════════════════════
// P&I REACT QUERY HOOKS
//
// UI → these hooks → lib/api/pni.ts → centralized Axios → backend.
// Mirrors hooks/useQuotations.ts conventions. P&I has no separate
// workflow endpoints (submit/approve/etc.) — those are the shared
// useSubmitQuotation()/useApproveQuotation()/... hooks in
// hooks/useQuotations.ts; a P&I quotation transitions status through
// exactly the same base /quotations/:id/* actions as any other.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import * as api from '@/lib/api/pni'
import { quotationKeys } from './useQuotations'
import type {
  PniQuotationDetail,
  CreatePniQuotationPayload,
  UpdatePniQuotationPayload,
} from '@/types/pni'

// ─── Centralized query keys ──────────────────────────────────────
export const pniKeys = {
  all:       ['pni'] as const,
  lists:     () => [...pniKeys.all, 'list'] as const,
  details:   () => [...pniKeys.all, 'detail'] as const,
  detail:    (quotationId: string) => [...pniKeys.details(), quotationId] as const,
  clubFormats: ['pni', 'club-formats'] as const,
  template:  (clubFormat: string) => ['pni', 'club-formats', clubFormat, 'template'] as const,
}

// ─── Reference data ─────────────────────────────────────────────

/** Used by the P&I create form's club-format selector (Phase 2B). */
export function usePniClubFormats() {
  return useQuery({
    queryKey: pniKeys.clubFormats,
    queryFn:  api.fetchPniClubFormats,
  })
}

/** Used once a club format is chosen, to load its standing template (Phase 2B). */
export function usePniClubFormatTemplate(clubFormat: string | undefined) {
  return useQuery({
    queryKey: pniKeys.template(clubFormat ?? ''),
    queryFn:  () => api.fetchPniClubFormatTemplate(clubFormat as string),
    enabled:  Boolean(clubFormat),
  })
}

// ─── Quotations ──────────────────────────────────────────────────

export function usePniQuotations() {
  return useQuery({
    queryKey: pniKeys.lists(),
    queryFn:  api.fetchPniQuotations,
  })
}

export function usePniQuotation(
  quotationId: string | undefined,
  options?: Partial<UseQueryOptions<PniQuotationDetail>>
) {
  return useQuery({
    queryKey: pniKeys.detail(quotationId ?? ''),
    queryFn:  () => api.fetchPniQuotation(quotationId as string),
    enabled:  Boolean(quotationId),
    ...options,
  })
}

/**
 * Creates the base Quotation AND the P&I detail together (the only
 * create path for P&I — see lib/api/pni.ts). Invalidates both the
 * P&I list and the generic quotation list, since the new row appears
 * in GET /quotations too.
 */
export function useCreatePniQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePniQuotationPayload) => api.createPniQuotation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pniKeys.lists() })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

/**
 * Upserts P&I nested children (and, when `quotation` is included in
 * the payload, base Quotation fields too). Invalidates the P&I
 * detail, the base quotation detail (base fields may have changed),
 * and both list views.
 */
export function useUpdatePniQuotation(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePniQuotationPayload) => api.updatePniQuotation(quotationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pniKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      qc.invalidateQueries({ queryKey: pniKeys.lists() })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}