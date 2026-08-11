/**
 * lib/api/invoice.ts
 *
 * Invoice API layer — aligned with confirmed backend contract:
 *   GET    /invoices       → list with pagination + filters
 *   GET    /invoices/:id   → single invoice detail
 *   POST   /invoices       → create (from a Voucher Invoice, per Phase 6)
 *   PATCH  /invoices/:id   → update (NOT PUT)
 *   DELETE /invoices/:id   → soft delete
 *
 * Non-existent endpoints REMOVED:
 *   POST  /invoices/from-qs/:id    (no backend equivalent, and no longer
 *                                   the correct origin — Invoice now
 *                                   originates from Voucher Invoice)
 *   PATCH /invoices/:id/status     (status is updated via PATCH /invoices/:id body)
 *   GET   /invoices/:id/pdf        (no backend equivalent yet — per the
 *                                   latest Finance API Specification this
 *                                   endpoint should exist; not implemented
 *                                   here until confirmed)
 *
 * Status transitions are performed by calling updateInvoice() with
 * { status: 'ISSUED' }. UNPAID/PARTIAL/PAID are payment-derived (set
 * once Incoming Payment records exist against this invoice) — never
 * sent by the client.
 */

import { get, post, patch, del } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { InvoiceListItem, InvoiceDocument, CreateInvoicePayload, UpdateInvoicePayload, InvoiceFilters } from '@/types/invoice'
import type {
  BackendInvoiceListEnvelope,
  BackendInvoiceDetailEnvelope,
  BackendInvoiceMutationEnvelope,
} from '@/types/backend/invoice'
import {
  mapInvoiceListItem,
  mapInvoiceDetail,
  mapCreateInvoicePayload,
  mapUpdateInvoicePayload,
  mapInvoiceQueryParams,
  mapInvoiceListPagination,
} from '@/lib/adapters/invoice'

const BASE = '/invoices'

// ─── List ─────────────────────────────────────────────────────────
/**
 * GET /invoices
 * Returns a paginated list of invoice records.
 * Adapts backend { items, total_pages, current_page } →
 * frontend PaginatedResponse<InvoiceListItem> shape.
 */
export async function fetchInvoiceList(
  filters: InvoiceFilters & {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  } = {}
): Promise<PaginatedResponse<InvoiceListItem>> {
  const params = mapInvoiceQueryParams(filters)
  const envelope = await get<BackendInvoiceListEnvelope>(BASE, { params })

  const items = envelope.data.items.map(mapInvoiceListItem)
  const pageSize = filters.pageSize ?? 10

  return mapInvoiceListPagination(
    items,
    envelope.data.total_pages,
    envelope.data.current_page,
    pageSize
  )
}

// ─── Detail ───────────────────────────────────────────────────────
/**
 * GET /invoices/:id
 * Returns a single invoice document.
 */
export async function fetchInvoiceDetail(id: string): Promise<InvoiceDocument> {
  const envelope = await get<BackendInvoiceDetailEnvelope>(`${BASE}/${id}`)
  return mapInvoiceDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /invoices
 * Creates a new invoice record linked to a QS document.
 */
export async function createInvoice(payload: CreateInvoicePayload): Promise<InvoiceDocument> {
  const backendPayload = mapCreateInvoicePayload(payload)
  const envelope = await post<BackendInvoiceMutationEnvelope>(BASE, backendPayload)
  return mapInvoiceDetail(envelope.data)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /invoices/:id  (NOT PUT — backend uses PATCH for updates)
 * Updates one or more fields on an existing invoice record.
 * Also used for status transitions: pass { status: 'ISSUED' } etc.
 */
export async function updateInvoice(
  id: string,
  payload: UpdateInvoicePayload
): Promise<InvoiceDocument> {
  const backendPayload = mapUpdateInvoicePayload(payload)
  const envelope = await patch<BackendInvoiceMutationEnvelope>(`${BASE}/${id}`, backendPayload)
  return mapInvoiceDetail(envelope.data)
}

// ─── Delete ───────────────────────────────────────────────────────
/**
 * DELETE /invoices/:id
 * Soft-deletes the invoice record (sets is_deleted = true in DB).
 */
export async function deleteInvoice(id: string): Promise<void> {
  await del<{ success: boolean; status_code: number }>(`${BASE}/${id}`)
}

// ─── Convenience wrappers ─────────────────────────────────────────

/** Issue an invoice (status: DRAFT → ISSUED) */
export async function issueInvoice(id: string): Promise<InvoiceDocument> {
  return updateInvoice(id, { status: 'ISSUED' })
}