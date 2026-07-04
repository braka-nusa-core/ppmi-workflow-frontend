/**
 * lib/api/qs.ts
 *
 * QS API layer — aligned with confirmed backend contract:
 *   GET    /qs           → list with pagination + filters
 *   GET    /qs/:id       → single QS detail
 *   POST   /qs           → create
 *   PATCH  /qs/:id       → update (NOT PUT)
 *   DELETE /qs/:id       → soft delete
 *
 * Non-existent endpoints REMOVED:
 *   POST /qs/:id/advance     (no backend equivalent)
 *   GET  /qs/preview-number  (no backend equivalent)
 *   PATCH /qs/:id/status     (status is updated via PATCH /qs/:id body)
 *
 * Status transitions (approve / reject / submit) are performed by
 * calling updateQS() with { status: 'APPROVED' | 'REJECTED' | 'SUBMITTED' }.
 *
 * Division UUID resolution:
 *   POST /qs requires division_id (UUID). The createQS() function accepts
 *   a divisionId parameter that must be resolved by the caller before
 *   invoking — typically by calling GET /divisions and matching by name.
 *   See lib/api/divisions.ts (to be created in Divisions integration phase).
 */

import { get, post, patch, del } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { QSListItem, QSDocument, CreateQSPayload, UpdateQSPayload } from '@/types/qs'
import type {
  BackendQSListEnvelope,
  BackendQSDetailEnvelope,
  BackendQSMutationEnvelope,
} from '@/types/backend/qs'
import {
  mapQSListItem,
  mapQSDetail,
  mapCreateQSPayload,
  mapUpdateQSPayload,
  mapQSQueryParams,
  mapQSListPagination,
} from '@/lib/adapters/qs'
import type { QSFilters } from '@/types/qs'

const BASE = '/qs'

// ─── List ─────────────────────────────────────────────────────────
/**
 * GET /qs
 * Returns a paginated list of QS records.
 * Adapts backend { items, total_pages, current_page } →
 * frontend PaginatedResponse<QSListItem> shape.
 */
export async function fetchQSList(
  filters: QSFilters & {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  } = {}
): Promise<PaginatedResponse<QSListItem>> {
  const params = mapQSQueryParams(filters)
  const envelope = await get<BackendQSListEnvelope>(BASE, { params })

  const items = envelope.data.items.map(mapQSListItem)
  const pageSize = filters.pageSize ?? 10

  return mapQSListPagination(
    items,
    envelope.data.total_pages,
    envelope.data.current_page,
    pageSize
  )
}

// ─── Detail ───────────────────────────────────────────────────────
/**
 * GET /qs/:id
 * Returns a single QS document.
 */
export async function fetchQSDetail(id: string): Promise<QSDocument> {
  const envelope = await get<BackendQSDetailEnvelope>(`${BASE}/${id}`)
  return mapQSDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /qs
 * Creates a new QS record.
 *
 * @param payload  Frontend form data (CreateQSPayload)
 * @param divisionId  Division UUID — must be resolved before calling.
 *                    Obtain from GET /divisions, match by name ('P&I'/'H&M').
 *                    Temporary workaround until GET /divisions is integrated:
 *                    pass a hardcoded UUID from the seeded divisions table.
 */
export async function createQS(
  payload: CreateQSPayload,
  divisionId: string
): Promise<QSDocument> {
  const backendPayload = mapCreateQSPayload(payload, divisionId)
  const envelope = await post<BackendQSMutationEnvelope>(BASE, backendPayload)
  return mapQSDetail(envelope.data)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /qs/:id  (NOT PUT — backend uses PATCH for updates)
 * Updates one or more fields on an existing QS record.
 * Also used for status transitions: pass { status: 'APPROVED' } etc.
 *
 * @param divisionId  Optional — only needed if changing division.
 */
export async function updateQS(
  id: string,
  payload: UpdateQSPayload,
  divisionId?: string
): Promise<QSDocument> {
  const backendPayload = mapUpdateQSPayload(payload, divisionId)
  const envelope = await patch<BackendQSMutationEnvelope>(`${BASE}/${id}`, backendPayload)
  return mapQSDetail(envelope.data)
}

// ─── Delete ───────────────────────────────────────────────────────
/**
 * DELETE /qs/:id
 * Soft-deletes the QS record (sets is_deleted = true in DB).
 */
export async function deleteQS(id: string): Promise<void> {
  await del<{ success: boolean; status_code: number }>(`${BASE}/${id}`)
}

// ─── Convenience wrappers ─────────────────────────────────────────

/** Submit a DRAFT QS for approval (status: DRAFT → SUBMITTED) */
export async function submitQS(id: string): Promise<QSDocument> {
  return updateQS(id, { status: 'SUBMITTED' })
}

/** Approve a SUBMITTED QS (status: SUBMITTED → APPROVED) */
export async function approveQS(id: string): Promise<QSDocument> {
  return updateQS(id, { status: 'APPROVED' })
}

/** Reject a SUBMITTED QS (status: SUBMITTED → REJECTED) */
export async function rejectQS(id: string): Promise<QSDocument> {
  return updateQS(id, { status: 'REJECTED' })
}
