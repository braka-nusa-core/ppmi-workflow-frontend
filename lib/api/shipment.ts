import { get, post, patch, del } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
  ShipmentDocument,
  ShipmentListItem,
  CreateShipmentPayload,
  UpdateShipmentPayload,
  ShipmentFilters,
} from '@/types/shipment'
import type {
  BackendShipmentListEnvelope,
  BackendShipmentDetailEnvelope,
  BackendShipmentMutationEnvelope,
} from '@/types/backend/shipment'
import {
  mapShipmentListItem,
  mapShipmentDetail,
  mapCreateShipmentPayload,
  mapUpdateShipmentPayload,
  mapShipmentQueryParams,
  mapShipmentListPagination,
} from '@/lib/adapters/shipment'

const BASE = '/shipments'

// ─── List ─────────────────────────────────────────────────────────
/**
 * GET /shipments
 * Supports: invoice_id, payment_id, search, page, limit, sort_by, sort_order
 */
export async function fetchShipmentList(
  filters: ShipmentFilters & {
    page?:     number
    pageSize?: number
    sortBy?:   string
    sortDir?:  'asc' | 'desc'
  } = {}
): Promise<PaginatedResponse<ShipmentListItem>> {
  const params = mapShipmentQueryParams(filters)
  const envelope = await get<BackendShipmentListEnvelope>(BASE, { params })
  const items    = envelope.data.items.map(mapShipmentListItem)
  const pageSize = filters.pageSize ?? 25
  return mapShipmentListPagination(items, envelope.data.total_pages, envelope.data.current_page, pageSize)
}

// ─── Detail ───────────────────────────────────────────────────────
/**
 * GET /shipments/:id
 */
export async function fetchShipmentDetail(id: string): Promise<ShipmentDocument> {
  const envelope = await get<BackendShipmentDetailEnvelope>(`${BASE}/${id}`)
  return mapShipmentDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /shipments
 * Required: invoice_id, courier, tracking_number, shipping_date.
 * Optional: payment_id, shipping_proof_id.
 * Creating a shipment has the side effect of setting the linked
 * Invoice's status to SHIPPED (backend behavior, not controlled here).
 *
 * @param payload  Frontend form data (camelCase) — mapped to the
 *                 backend's snake_case contract via mapCreateShipmentPayload,
 *                 same pattern as createQS()/createVoucher()/createPayment().
 */
export async function createShipment(payload: CreateShipmentPayload): Promise<ShipmentDocument> {
  const envelope = await post<BackendShipmentMutationEnvelope>(BASE, mapCreateShipmentPayload(payload))
  return mapShipmentDetail(envelope.data)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /shipments/:id  (NOT PUT — confirmed backend route)
 *
 * @param payload  Frontend camelCase fields — mapped to the backend's
 *                 snake_case contract via mapUpdateShipmentPayload, same
 *                 pattern as updateQS()/updateVoucher()/updatePayment().
 */
export async function updateShipment(
  id: string,
  payload: UpdateShipmentPayload
): Promise<ShipmentDocument> {
  const envelope = await patch<BackendShipmentMutationEnvelope>(`${BASE}/${id}`, mapUpdateShipmentPayload(payload))
  return mapShipmentDetail(envelope.data)
}

// ─── Delete ───────────────────────────────────────────────────────
/**
 * DELETE /shipments/:id  (soft delete — sets deleted_at)
 */
export async function deleteShipment(id: string): Promise<void> {
  await del<{ success: boolean; status_code: number }>(`${BASE}/${id}`)
}