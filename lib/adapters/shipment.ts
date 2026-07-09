/**
 * Shipment adapters — map raw backend DocumentShipment records to
 * frontend ShipmentListItem/ShipmentDocument shapes, and map frontend
 * create/update payloads to BackendCreateShipmentPayload.
 *
 * Same pattern as lib/adapters/qs.ts / voucher.ts / payment.ts.
 */

import type {
  ShipmentDocument,
  ShipmentListItem,
  CreateShipmentPayload,
  UpdateShipmentPayload,
  ShipmentFilters,
} from '@/types/shipment'
import type {
  BackendShipmentItem,
  BackendShipmentDetail,
  BackendCreateShipmentPayload,
  BackendUpdateShipmentPayload,
  BackendShipmentQueryParams,
} from '@/types/backend/shipment'

// ─── Helpers ──────────────────────────────────────────────────────
function toISO(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return value
}

/**
 * Convert a date-input value ("YYYY-MM-DD") to a full ISO-8601 DateTime
 * string required by Prisma ("YYYY-MM-DDTHH:mm:ss.sssZ").
 *
 * Same convention as qs.ts/voucher.ts's dateInputToISO, invoice.ts's
 * toOutboundDate, and payment.ts's dateInputToISO. shipping_date is
 * validated by the backend with z.string().datetime(), which is even
 * stricter than the other modules' bare z.string().min(1) — it requires
 * a genuine full ISO-8601 datetime, so this conversion is mandatory here,
 * not just good practice.
 */
function dateInputToISO(dateStr: string | undefined | null): string | undefined {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr   // already a full DateTime — pass through
  return `${dateStr}T00:00:00.000Z`
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapShipmentListItem(item: BackendShipmentItem): ShipmentListItem {
  return {
    id:             item.id,
    docNumber:      item.id,
    invoiceId:      item.invoice_id ?? '',
    invoiceNumber:  item.invoice?.invoice_number ?? '',
    paymentId:      item.payment_id ?? undefined,
    courier:        item.courier,
    trackingNumber: item.tracking_number,
    shippingDate:   toISO(item.shipping_date),
    createdAt:      toISO(item.created_at),
  }
}

export function mapShipmentDetail(item: BackendShipmentDetail): ShipmentDocument {
  return {
    id:                     item.id,
    docNumber:              item.id,

    invoiceId:              item.invoice_id ?? '',
    invoiceNumber:          item.invoice?.invoice_number ?? '',
    paymentId:              item.payment_id ?? undefined,

    courier:                item.courier,
    trackingNumber:         item.tracking_number,
    shippingDate:           toISO(item.shipping_date),

    shippingProofId:        item.shipping_proof?.id ?? item.shipping_proof_id ?? undefined,
    shippingProofFileName:  item.shipping_proof?.file_name ?? undefined,
    shippingProofFileUrl:   item.shipping_proof?.file_url ?? undefined,

    division:               undefined,   // not in backend response — no division relation on Shipment

    createdAt:              toISO(item.created_at),
    updatedAt:              toISO(item.updated_at),
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

/**
 * Map frontend CreateShipmentFormData → BackendCreateShipmentPayload.
 */
export function mapCreateShipmentPayload(payload: CreateShipmentPayload): BackendCreateShipmentPayload {
  return {
    invoice_id:      payload.invoiceId,
    courier:         payload.courier,
    tracking_number: payload.trackingNumber,
    shipping_date:   dateInputToISO(payload.shippingDate) ?? payload.shippingDate,
    ...(payload.paymentId       ? { payment_id: payload.paymentId }             : {}),
    ...(payload.shippingProofId ? { shipping_proof_id: payload.shippingProofId } : {}),
  }
}

/**
 * Map partial update fields → BackendUpdateShipmentPayload (all optional).
 */
export function mapUpdateShipmentPayload(payload: UpdateShipmentPayload): BackendUpdateShipmentPayload {
  const result: BackendUpdateShipmentPayload = {}
  if (payload.invoiceId)        result.invoice_id         = payload.invoiceId
  if (payload.paymentId)        result.payment_id         = payload.paymentId
  if (payload.courier)          result.courier            = payload.courier
  if (payload.trackingNumber)   result.tracking_number    = payload.trackingNumber
  if (payload.shippingDate)     result.shipping_date      = dateInputToISO(payload.shippingDate)
  if (payload.shippingProofId)  result.shipping_proof_id  = payload.shippingProofId
  return result
}

/**
 * Map frontend ShipmentFilters → BackendShipmentQueryParams.
 */
export function mapShipmentQueryParams(
  filters: ShipmentFilters & {
    page?:     number
    pageSize?: number
    sortBy?:   string
    sortDir?:  'asc' | 'desc'
  }
): BackendShipmentQueryParams {
  const SORT_FIELD_MAP: Record<string, string> = {
    docNumber:      'id',
    courier:        'courier',
    trackingNumber: 'tracking_number',
    shippingDate:   'shipping_date',
    createdAt:      'created_at',
    updatedAt:      'updated_at',
  }

  const params: BackendShipmentQueryParams = {}

  if (filters.search)    params.search      = filters.search
  if (filters.invoiceId) params.invoice_id  = filters.invoiceId
  if (filters.paymentId) params.payment_id  = filters.paymentId
  if (filters.page)      params.page        = String(filters.page)
  if (filters.pageSize)  params.limit       = String(filters.pageSize)
  if (filters.sortDir)   params.sort_order  = filters.sortDir
  if (filters.sortBy && SORT_FIELD_MAP[filters.sortBy]) {
    params.sort_by = SORT_FIELD_MAP[filters.sortBy]
  }

  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapShipmentListPagination(
  items: ShipmentListItem[],
  totalPages: number,
  currentPage: number,
  pageSize: number
) {
  return {
    success: true,
    data:    items,
    pagination: {
      page:       currentPage,
      pageSize,
      total:      totalPages * pageSize,
      totalPages,
    },
  }
}