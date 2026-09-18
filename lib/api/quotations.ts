// ═══════════════════════════════════════════════════════════════
// QUOTATION (QS) API LAYER
//
// Pure HTTP functions against the current backend's /quotations
// resource (ppmi-workflow-backend-2/src/quotations/*). No React
// Query, no UI logic, no toasts, no navigation, no cache mutation —
// each function makes one request and returns typed data.
//
// Endpoints implemented here are exactly what exists in
// quotations.controller.ts + the four sub-resource controllers +
// quotation-attachments.controller.ts today. Nothing invented.
// NOT implemented backend-side (so not present here): duplicate,
// print, email, versioning, real PDF generation, Policy/RFI/
// Insurance Voucher APIs.
// ═══════════════════════════════════════════════════════════════

import { get, post, patch, del } from './client'
import { fromWire } from './wireMapper'
import type {
  Quotation,
  QuotationListItem,
  QuotationDetail,
  QuotationApproval,
  QuotationHistoryEntry,
  QuotationObject,
  QuotationCoverage,
  QuotationTerm,
  QuotationWarranty,
  QuotationAttachment,
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
  QuotationExportPdfPlaceholder,
} from '@/types/quotation'

const BASE = '/quotations'

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

// ─── Queries ────────────────────────────────────────────────────

/** GET /quotations — no pagination/filter/search/sort support exists on the backend today. */
export async function fetchQuotations(): Promise<QuotationListItem[]> {
  const res = await get<Envelope<unknown[]>>(BASE)
  return fromWire<QuotationListItem[]>(res.data)
}

/** GET /quotations/:id */
export async function fetchQuotation(id: string): Promise<QuotationDetail> {
  const res = await get<Envelope<unknown>>(`${BASE}/${id}`)
  return fromWire<QuotationDetail>(res.data)
}

/** GET /quotations/:id/approvals */
export async function fetchQuotationApprovals(id: string): Promise<QuotationApproval[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/${id}/approvals`)
  return fromWire<QuotationApproval[]>(res.data)
}

/** GET /quotations/:id/history */
export async function fetchQuotationHistory(id: string): Promise<QuotationHistoryEntry[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/${id}/history`)
  return fromWire<QuotationHistoryEntry[]>(res.data)
}

// ─── Mutations — core CRUD ──────────────────────────────────────

/** POST /quotations */
export async function createQuotation(payload: CreateQuotationPayload): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(BASE, payload)
  return fromWire<Quotation>(res.data)
}

/** PATCH /quotations/:id — backend restricts this to DRAFT/REVISION status; enforced server-side. */
export async function updateQuotation(
  id: string,
  payload: UpdateQuotationPayload
): Promise<Quotation> {
  const res = await patch<Envelope<unknown>>(`${BASE}/${id}`, payload)
  return fromWire<Quotation>(res.data)
}

/** DELETE /quotations/:id — backend restricts this to DRAFT status; enforced server-side. */
export async function deleteQuotation(id: string): Promise<void> {
  await del<Envelope<unknown>>(`${BASE}/${id}`)
}

// ─── Mutations — workflow actions ───────────────────────────────
// Every action below requires `quotation:<action>` permission and,
// for approve/reject/request-revision, additionally requires the
// actor's organization unit to literally be "Supervisor Teknik" —
// both enforced server-side. The frontend's job is UX only (see
// lib/permissions.ts isSupervisorTeknik()) — never assume an action
// will succeed just because the button was shown.

/** POST /quotations/:id/submit — DRAFT→WAITING_APPROVAL, or REVISION→WAITING_APPROVAL (resubmission). */
export async function submitQuotation(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/submit`, payload)
  return fromWire<Quotation>(res.data)
}

/** POST /quotations/:id/approve — WAITING_APPROVAL→APPROVED. Supervisor Teknik only. */
export async function approveQuotation(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/approve`, payload)
  return fromWire<Quotation>(res.data)
}

/** POST /quotations/:id/reject — WAITING_APPROVAL→DRAFT. Supervisor Teknik only. */
export async function rejectQuotation(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/reject`, payload)
  return fromWire<Quotation>(res.data)
}

/** POST /quotations/:id/request-revision — WAITING_APPROVAL→DRAFT. Supervisor Teknik only. */
export async function requestQuotationRevision(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/request-revision`, payload)
  return fromWire<Quotation>(res.data)
}

/** POST /quotations/:id/send-to-insurance — APPROVED→SENT_TO_INSURANCE. Requires insuranceCompanyId. */
export async function sendQuotationToInsurance(
  id: string,
  payload: SendToInsurancePayload
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/send-to-insurance`, payload)
  return fromWire<Quotation>(res.data)
}

/** POST /quotations/:id/insurance-approve — SENT_TO_INSURANCE→INSURANCE_APPROVED (distinct from POLICY_ISSUED — no endpoint sets that status today). */
export async function insuranceApproveQuotation(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/insurance-approve`, payload)
  return fromWire<Quotation>(res.data)
}

/**
 * POST /quotations/:id/insurance-revision — SENT_TO_INSURANCE→REVISION.
 * Backend currently routes REVISION back through WAITING_APPROVAL on
 * next submit (see quotations.constants.ts), gated by
 * REQUIRES_SUPERVISOR_APPROVAL_AFTER_INSURER_REVISION, which the
 * backend itself labels a temporary rule pending stakeholder
 * confirmation — do not treat this transition graph as permanently
 * settled business logic.
 */
export async function insuranceRevisionQuotation(
  id: string,
  payload: ActionNotePayload = {}
): Promise<Quotation> {
  const res = await post<Envelope<unknown>>(`${BASE}/${id}/insurance-revision`, payload)
  return fromWire<Quotation>(res.data)
}

/**
 * GET /quotations/:id/export-pdf — PLACEHOLDER. Returns
 * { message, quotationId, quotationNumber }, not a file. Do not build
 * download/print behavior around this call until the backend actually
 * generates a PDF.
 */
export async function exportQuotationPdf(id: string): Promise<QuotationExportPdfPlaceholder> {
  const res = await get<Envelope<QuotationExportPdfPlaceholder>>(`${BASE}/${id}/export-pdf`)
  return res.data
}

// ─── Sub-resources ───────────────────────────────────────────────
// Full CRUD exists on the backend for objects/coverages/terms/
// warranties. Attachments only support list/get/upload/delete (no
// update — the backend has no PATCH route for attachments).

function subResource<TEntity, TCreate, TUpdate>(path: 'objects' | 'coverages' | 'terms' | 'warranties') {
  return {
    list: async (quotationId: string): Promise<TEntity[]> => {
      const res = await get<Envelope<unknown[]>>(`${BASE}/${quotationId}/${path}`)
      return fromWire<TEntity[]>(res.data)
    },
    get: async (quotationId: string, id: string): Promise<TEntity> => {
      const res = await get<Envelope<unknown>>(`${BASE}/${quotationId}/${path}/${id}`)
      return fromWire<TEntity>(res.data)
    },
    create: async (quotationId: string, payload: TCreate): Promise<TEntity> => {
      const res = await post<Envelope<unknown>>(`${BASE}/${quotationId}/${path}`, payload)
      return fromWire<TEntity>(res.data)
    },
    update: async (quotationId: string, id: string, payload: TUpdate): Promise<TEntity> => {
      const res = await patch<Envelope<unknown>>(`${BASE}/${quotationId}/${path}/${id}`, payload)
      return fromWire<TEntity>(res.data)
    },
    remove: async (quotationId: string, id: string): Promise<void> => {
      await del<Envelope<unknown>>(`${BASE}/${quotationId}/${path}/${id}`)
    },
  }
}

export const quotationObjectsApi = subResource<
  QuotationObject,
  CreateQuotationObjectPayload,
  UpdateQuotationObjectPayload
>('objects')

export const quotationCoveragesApi = subResource<
  QuotationCoverage,
  CreateQuotationCoveragePayload,
  UpdateQuotationCoveragePayload
>('coverages')

export const quotationTermsApi = subResource<
  QuotationTerm,
  CreateQuotationTermPayload,
  UpdateQuotationTermPayload
>('terms')

export const quotationWarrantiesApi = subResource<
  QuotationWarranty,
  CreateQuotationWarrantyPayload,
  UpdateQuotationWarrantyPayload
>('warranties')

// ─── Attachments ─────────────────────────────────────────────────
// Field name is `file` (multipart), 50MB max, PDF/image/Office mime
// whitelist — all enforced server-side; these are just the requests.

export async function fetchQuotationAttachments(quotationId: string): Promise<QuotationAttachment[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/${quotationId}/attachments`)
  return fromWire<QuotationAttachment[]>(res.data)
}

export async function fetchQuotationAttachment(
  quotationId: string,
  id: string
): Promise<QuotationAttachment> {
  const res = await get<Envelope<unknown>>(`${BASE}/${quotationId}/attachments/${id}`)
  return fromWire<QuotationAttachment>(res.data)
}

export async function uploadQuotationAttachment(
  quotationId: string,
  file: File
): Promise<QuotationAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await post<Envelope<unknown>>(
    `${BASE}/${quotationId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return fromWire<QuotationAttachment>(res.data)
}

export async function deleteQuotationAttachment(quotationId: string, id: string): Promise<void> {
  await del<Envelope<unknown>>(`${BASE}/${quotationId}/attachments/${id}`)
}