// ═══════════════════════════════════════════════════════════════
// QUOTATION (QS) REACT QUERY HOOKS
//
// UI → these hooks → lib/api/quotations.ts → centralized Axios →
// backend. No component should call lib/api/quotations.ts directly,
// and no component should reach into Axios directly.
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import * as api from '@/lib/api/quotations'
import type {
  QuotationDetail,
  QuotationObject,
  QuotationCoverage,
  QuotationTerm,
  QuotationWarranty,
  CreateQuotationPayload,
  UpdateQuotationPayload,
  ActionNotePayload,
  SendToInsurancePayload,
  CreateQuotationObjectPayload,
  UpdateQuotationObjectPayload,
  CreateQuotationCoveragePayload,
  UpdateQuotationCoveragePayload,
  CreateQuotationTermPayload,
  UpdateQuotationTermPayload,
  CreateQuotationWarrantyPayload,
  UpdateQuotationWarrantyPayload,
} from '@/types/quotation'

// ─── Centralized query keys ──────────────────────────────────────
// Single source of truth for quotation cache keys, so invalidation
// stays consistent instead of scattered raw arrays across components.
export const quotationKeys = {
  all:            ['quotations'] as const,
  lists:          () => [...quotationKeys.all, 'list'] as const,
  details:        () => [...quotationKeys.all, 'detail'] as const,
  detail:         (id: string) => [...quotationKeys.details(), id] as const,
  approvals:      (id: string) => [...quotationKeys.detail(id), 'approvals'] as const,
  history:        (id: string) => [...quotationKeys.detail(id), 'history'] as const,
  objects:        (id: string) => [...quotationKeys.detail(id), 'objects'] as const,
  coverages:      (id: string) => [...quotationKeys.detail(id), 'coverages'] as const,
  terms:          (id: string) => [...quotationKeys.detail(id), 'terms'] as const,
  warranties:     (id: string) => [...quotationKeys.detail(id), 'warranties'] as const,
  attachments:    (id: string) => [...quotationKeys.detail(id), 'attachments'] as const,
}

// ─── Queries ────────────────────────────────────────────────────

export function useQuotations() {
  return useQuery({
    queryKey: quotationKeys.lists(),
    queryFn:  api.fetchQuotations,
  })
}

export function useQuotation(
  id: string | undefined,
  options?: Partial<UseQueryOptions<QuotationDetail>>
) {
  return useQuery({
    queryKey: quotationKeys.detail(id ?? ''),
    queryFn:  () => api.fetchQuotation(id as string),
    enabled:  Boolean(id),
    ...options,
  })
}

export function useQuotationApprovals(id: string | undefined) {
  return useQuery({
    queryKey: quotationKeys.approvals(id ?? ''),
    queryFn:  () => api.fetchQuotationApprovals(id as string),
    enabled:  Boolean(id),
  })
}

export function useQuotationHistory(id: string | undefined) {
  return useQuery({
    queryKey: quotationKeys.history(id ?? ''),
    queryFn:  () => api.fetchQuotationHistory(id as string),
    enabled:  Boolean(id),
  })
}

// ─── Mutations — core CRUD ──────────────────────────────────────

export function useCreateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) => api.createQuotation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

export function useUpdateQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateQuotationPayload) => api.updateQuotation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.detail(id) })
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

export function useDeleteQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteQuotation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() })
    },
  })
}

// ─── Mutations — workflow actions ───────────────────────────────
// Approve/reject/request-revision additionally touch approvals +
// history; submit/send-to-insurance/insurance-* touch history (and,
// for insurance actions, the submissions embedded in the detail
// response) — invalidating detail covers that since submissions are
// nested inside GET /quotations/:id rather than their own endpoint.

function invalidateAfterWorkflowAction(qc: ReturnType<typeof useQueryClient>, id: string, touchesApprovals = false) {
  qc.invalidateQueries({ queryKey: quotationKeys.detail(id) })
  qc.invalidateQueries({ queryKey: quotationKeys.history(id) })
  qc.invalidateQueries({ queryKey: quotationKeys.lists() })
  if (touchesApprovals) {
    qc.invalidateQueries({ queryKey: quotationKeys.approvals(id) })
  }
}

export function useSubmitQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.submitQuotation(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id),
  })
}

export function useApproveQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.approveQuotation(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id, true),
  })
}

export function useRejectQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.rejectQuotation(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id, true),
  })
}

export function useRequestQuotationRevision(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.requestQuotationRevision(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id, true),
  })
}

export function useSendQuotationToInsurance(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendToInsurancePayload) => api.sendQuotationToInsurance(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id),
  })
}

export function useInsuranceApproveQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.insuranceApproveQuotation(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id),
  })
}

export function useInsuranceRevisionQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload?: ActionNotePayload) => api.insuranceRevisionQuotation(id, payload),
    onSuccess: () => invalidateAfterWorkflowAction(qc, id),
  })
}

// ─── Sub-resource hooks ──────────────────────────────────────────
// One factory shared across objects/coverages/terms/warranties —
// they're structurally identical CRUD sub-resources. Each still
// invalidates the parent quotation detail, since GET /quotations/:id
// embeds all of these collections.

function makeSubResourceHooks<TEntity, TCreate, TUpdate>(
  queryKeyFn: (quotationId: string) => readonly unknown[],
  resourceApi: {
    list:   (quotationId: string) => Promise<TEntity[]>
    create: (quotationId: string, payload: TCreate) => Promise<TEntity>
    update: (quotationId: string, id: string, payload: TUpdate) => Promise<TEntity>
    remove: (quotationId: string, id: string) => Promise<void>
  }
) {
  function useList(quotationId: string | undefined) {
    return useQuery({
      queryKey: queryKeyFn(quotationId ?? ''),
      queryFn:  () => resourceApi.list(quotationId as string),
      enabled:  Boolean(quotationId),
    })
  }

  function useCreate(quotationId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (payload: TCreate) => resourceApi.create(quotationId, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeyFn(quotationId) })
        qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      },
    })
  }

  function useUpdate(quotationId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TUpdate }) =>
        resourceApi.update(quotationId, id, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeyFn(quotationId) })
        qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      },
    })
  }

  function useRemove(quotationId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => resourceApi.remove(quotationId, id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeyFn(quotationId) })
        qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
      },
    })
  }

  return { useList, useCreate, useUpdate, useRemove }
}

export const quotationObjectHooks = makeSubResourceHooks<
  QuotationObject,
  CreateQuotationObjectPayload,
  UpdateQuotationObjectPayload
>(quotationKeys.objects, api.quotationObjectsApi)

export const quotationCoverageHooks = makeSubResourceHooks<
  QuotationCoverage,
  CreateQuotationCoveragePayload,
  UpdateQuotationCoveragePayload
>(quotationKeys.coverages, api.quotationCoveragesApi)

export const quotationTermHooks = makeSubResourceHooks<
  QuotationTerm,
  CreateQuotationTermPayload,
  UpdateQuotationTermPayload
>(quotationKeys.terms, api.quotationTermsApi)

export const quotationWarrantyHooks = makeSubResourceHooks<
  QuotationWarranty,
  CreateQuotationWarrantyPayload,
  UpdateQuotationWarrantyPayload
>(quotationKeys.warranties, api.quotationWarrantiesApi)

// ─── Attachments ─────────────────────────────────────────────────
// Not folded into makeSubResourceHooks: upload takes a File (multipart)
// rather than a JSON payload, and there is no update/PATCH endpoint.

export function useQuotationAttachments(quotationId: string | undefined) {
  return useQuery({
    queryKey: quotationKeys.attachments(quotationId ?? ''),
    queryFn:  () => api.fetchQuotationAttachments(quotationId as string),
    enabled:  Boolean(quotationId),
  })
}

export function useUploadQuotationAttachment(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => api.uploadQuotationAttachment(quotationId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.attachments(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
    },
  })
}

export function useDeleteQuotationAttachment(quotationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteQuotationAttachment(quotationId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.attachments(quotationId) })
      qc.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) })
    },
  })
}