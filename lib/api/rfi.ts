import { get, post, put, del } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
  RfiDocument,
  RfiListItem,
  RfiChecklistItem,
  RfiAttachment,
  CreateRfiPayload,
  UpdateRfiPayload,
  UpdateChecklistPayload,
  RfiHistoryEvent,
  RfiFilters,
} from '@/types/rfi'
import type {
  BackendRfiListEnvelope,
  BackendRfiDetailEnvelope,
  BackendRfiMutationEnvelope,
  BackendRfiChecklistEnvelope,
  BackendRfiAttachmentListEnvelope,
  BackendRfiAttachmentEnvelope,
  BackendRfiHistoryEnvelope,
} from '@/types/backend/rfi'
import {
  mapRfiListItem,
  mapRfiDetail,
  mapChecklist,
  mapAttachment,
  mapRfiHistoryEvent,
  mapCreateRfiPayload,
  mapUpdateRfiPayload,
  mapUpdateChecklistPayload,
  mapRfiQueryParams,
  mapRfiListPagination,
} from '@/lib/adapters/rfi'

const BASE = '/api/v1/request-for-invoices'

// ─── List ─────────────────────────────────────────────────────────
/** GET /api/v1/request-for-invoices — Permission: rfi.read */
export async function fetchRfiList(
  filters: RfiFilters & { page?: number } = {}
): Promise<PaginatedResponse<RfiListItem>> {
  const params   = mapRfiQueryParams(filters)
  const envelope = await get<BackendRfiListEnvelope>(BASE, { params })
  const items    = envelope.data.map(mapRfiListItem)
  return mapRfiListPagination(items, envelope.pagination)
}

// ─── Detail ───────────────────────────────────────────────────────
/** GET /api/v1/request-for-invoices/:id — Permission: rfi.read */
export async function fetchRfiDetail(id: string): Promise<RfiDocument> {
  const envelope = await get<BackendRfiDetailEnvelope>(`${BASE}/${id}`)
  return mapRfiDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /api/v1/request-for-invoices — Permission: rfi.create
 * Business rules: policy must be PLACEMENT_COMPLETED; one active
 * RFI (DRAFT/WAITING_FINANCE) per policy; status starts DRAFT.
 */
export async function createRfi(payload: CreateRfiPayload): Promise<{ id: string }> {
  const envelope = await post<BackendRfiMutationEnvelope>(BASE, mapCreateRfiPayload(payload))
  return { id: envelope.data.id }
}

// ─── Update ───────────────────────────────────────────────────────
/** PUT /api/v1/request-for-invoices/:id — only while status is DRAFT */
export async function updateRfi(id: string, payload: UpdateRfiPayload): Promise<void> {
  await put<BackendRfiMutationEnvelope>(`${BASE}/${id}`, mapUpdateRfiPayload(payload))
}

// ─── Checklist ────────────────────────────────────────────────────
/** GET /api/v1/request-for-invoices/:id/checklist */
export async function fetchRfiChecklist(id: string): Promise<RfiChecklistItem[]> {
  const envelope = await get<BackendRfiChecklistEnvelope>(`${BASE}/${id}/checklist`)
  return mapChecklist(envelope.data)
}

/**
 * PUT /api/v1/request-for-invoices/:id/checklist
 * The endpoint replaces the whole checklist object, so `current` (the
 * checklist state already on hand) is merged with the toggled field(s)
 * before sending — same pattern as Policy's updateMember, applied to a
 * whole-object-replace endpoint instead of a single-field one.
 */
export async function updateRfiChecklist(
  id: string,
  current: RfiChecklistItem[],
  updates: UpdateChecklistPayload
): Promise<RfiChecklistItem[]> {
  const payload  = mapUpdateChecklistPayload(current, updates)
  const envelope = await put<BackendRfiChecklistEnvelope>(`${BASE}/${id}/checklist`, payload)
  return mapChecklist(envelope.data)
}

// ─── Attachments ──────────────────────────────────────────────────
/** POST /api/v1/request-for-invoices/:id/attachments — multipart/form-data */
export async function uploadRfiAttachment(id: string, file: File): Promise<RfiAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const envelope = await post<BackendRfiAttachmentEnvelope>(
    `${BASE}/${id}/attachments`,
    formData
  )
  return mapAttachment(envelope.data)
}

/** GET /api/v1/request-for-invoices/:id/attachments */
export async function fetchRfiAttachments(id: string): Promise<RfiAttachment[]> {
  const envelope = await get<BackendRfiAttachmentListEnvelope>(`${BASE}/${id}/attachments`)
  return envelope.data.map(mapAttachment)
}

/** DELETE /api/v1/request-for-invoices/:id/attachments/:attachmentId */
export async function deleteRfiAttachment(id: string, attachmentId: string): Promise<void> {
  await del<{ success: boolean }>(`${BASE}/${id}/attachments/${attachmentId}`)
}

// ─── Submit ───────────────────────────────────────────────────────
/**
 * POST /api/v1/request-for-invoices/:id/submit — Permission: rfi.submit
 * Backend validates: policy number, placement completed, leader,
 * share = 100%, checklist complete, attachment (if required).
 * Status DRAFT → WAITING_FINANCE.
 */
export async function submitRfi(id: string): Promise<void> {
  await post<BackendRfiMutationEnvelope>(`${BASE}/${id}/submit`)
}

// ─── Cancel ───────────────────────────────────────────────────────
/**
 * POST /api/v1/request-for-invoices/:id/cancel — Permission: rfi.cancel
 * Status WAITING_FINANCE → CANCELLED. Only Administrator or the RFI's
 * creator, and only before Finance has processed it.
 */
export async function cancelRfi(id: string): Promise<void> {
  await post<BackendRfiMutationEnvelope>(`${BASE}/${id}/cancel`)
}

// NOTE: POST /:id/processed is intentionally NOT exposed here. Per the
// RFI API Specification: "Endpoint ini sebaiknya hanya dipanggil oleh
// sistem atau oleh modul Voucher Invoice, bukan secara manual oleh
// pengguna." No RFI-module UI action should call it — it belongs to
// the Voucher Invoice module (Phase 5), which is out of scope here.

// ─── History ──────────────────────────────────────────────────────
/** GET /api/v1/request-for-invoices/:id/history */
export async function fetchRfiHistory(id: string): Promise<RfiHistoryEvent[]> {
  const envelope = await get<BackendRfiHistoryEnvelope>(`${BASE}/${id}/history`)
  return envelope.data.map(mapRfiHistoryEvent)
}