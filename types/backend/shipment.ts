/**
 * Raw backend Shipment response/payload types.
 * Confirmed from backend source:
 *   src/shipments/shipments.service.ts, src/shipments/shipments.controller.ts,
 *   src/shipments/shipments.validation.ts, prisma/schema.prisma
 *
 * Used ONLY in lib/adapters/shipment.ts — never imported by components.
 *
 * IMPORTANT: DocumentShipment has NO status column, NO document-tracking
 * fields (documentsReceived/Forwarded), and NO shipping-detail fields
 * (portOfLoading, blNumber, containerNumber, voyageNumber). Only 5 writable
 * scalar fields exist: invoice_id, payment_id, courier, tracking_number,
 * shipping_date (+ optional shipping_proof_id).
 */

// ─── Backend list/detail item ─────────────────────────────────────
/**
 * Shape returned by listShipments() and getShipment().
 * `include` returns all scalar columns of the DocumentShipment row
 * unmodified, plus two selected relations. There is NO `payment` relation
 * included in the response — only `payment_id` (raw string) is present.
 */
export interface BackendShipmentItem {
  id:                string          // uuid()
  invoice_id:        string | null
  payment_id:        string | null
  courier:           string
  tracking_number:   string
  shipping_date:     string | Date
  shipping_proof_id: string | null
  created_at:        string | Date
  updated_at:        string | Date
  deleted_at:        string | Date | null
  invoice?: {
    id:             string
    invoice_number: string
  } | null
  shipping_proof?: {
    id:        string
    file_name: string
    file_url:  string
  } | null
}

export type BackendShipmentDetail = BackendShipmentItem

// ─── List response envelope ───────────────────────────────────────
export interface BackendShipmentListData {
  items:        BackendShipmentItem[]
  total_pages:  number
  current_page: number
}

export interface BackendShipmentListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendShipmentListData
}

export interface BackendShipmentDetailEnvelope {
  success:     boolean
  status_code: number
  data:        BackendShipmentDetail
}

export interface BackendShipmentMutationEnvelope {
  success:     boolean
  status_code: number
  data:        BackendShipmentDetail
}

// ─── Create/update payload ────────────────────────────────────────
/**
 * Confirmed from createShipmentSchema in shipments.validation.ts:
 *   invoice_id       required, non-empty string
 *   courier          required, non-empty string
 *   tracking_number  required, non-empty string
 *   shipping_date    required, full ISO-8601 datetime (z.string().datetime())
 *   payment_id       optional — existence-checked only if provided;
 *                    NOT used to derive invoice_id or any other field
 *   shipping_proof_id optional — validated against FileAttachment if provided
 * All fields become optional on update (updateShipmentSchema).
 */
export interface BackendCreateShipmentPayload {
  invoice_id:         string
  payment_id?:        string
  courier:            string
  tracking_number:    string
  shipping_date:      string
  shipping_proof_id?: string
}

export type BackendUpdateShipmentPayload = Partial<BackendCreateShipmentPayload>

// ─── Query params ─────────────────────────────────────────────────
/**
 * Backend listShipments() accepts:
 *   invoice_id, payment_id, search, page, limit, sort_by, sort_order
 * search matches against: courier, tracking_number (case-insensitive contains)
 * sort_by accepts: id, courier, tracking_number, shipping_date, created_at, updated_at
 * Does NOT accept: division, status, documentsReceived/Forwarded filters
 */
export interface BackendShipmentQueryParams {
  invoice_id?: string
  payment_id?: string
  search?:     string
  page?:       string
  limit?:      string
  sort_by?:    string
  sort_order?: string
}