/**
 * Frontend Shipment types.
 *
 * IMPORTANT: The backend DocumentShipment model has only 5 writable
 * scalar fields (invoice_id, payment_id, courier, tracking_number,
 * shipping_date) plus an optional shipping_proof_id. There is NO status
 * column, NO document-tracking fields, and NO shipping-detail fields
 * (port of loading/discharge, BL number, container/voyage number) on the
 * backend — earlier versions of this file modeled a status-driven
 * workflow (DRAFT/IN_PROGRESS/DOCUMENTS_RECEIVED/.../COMPLETED/CANCELLED)
 * and shipping-detail fields that do not exist anywhere in the backend.
 * Those have been removed here to match the real contract. If a status-like
 * workflow is needed later, it must be decided and modeled explicitly —
 * not assumed — the same way Voucher's fictional `approvalStatus` was
 * removed rather than patched around.
 */

import type { Division } from './workflow'

// ─── Full Shipment Document ──────────────────────────────────────
export interface ShipmentDocument {
  id:                     string   // uuid(), also serves as the doc identifier
  docNumber:              string   // = id (no separate human-readable sequence like QS/Invoice/Voucher/Payment)

  // Linked documents
  invoiceId:              string
  invoiceNumber:          string
  paymentId?:             string   // optional — not always linked

  // Shipment details (the only real fields on the backend)
  courier:                string
  trackingNumber:         string
  shippingDate:           string

  // Shipping proof attachment (optional)
  shippingProofId?:       string
  shippingProofFileName?: string
  shippingProofFileUrl?:  string

  // Not in backend response — stubbed for display consistency with
  // other modules until a real division/insured lookup path exists.
  division?:              Division

  createdAt:              string
  updatedAt:              string
}

// ─── List item (table row) ───────────────────────────────────────
export interface ShipmentListItem {
  id:              string
  docNumber:       string
  invoiceId:       string
  invoiceNumber:   string
  paymentId?:      string
  courier:         string
  trackingNumber:  string
  shippingDate:    string
  createdAt:       string
}

// ─── Create payload ──────────────────────────────────────────────
export interface CreateShipmentPayload {
  invoiceId:         string
  courier:           string
  trackingNumber:    string
  shippingDate:      string
  paymentId?:        string
  shippingProofId?:  string
}

export type UpdateShipmentPayload = Partial<CreateShipmentPayload>

// ─── Filters ─────────────────────────────────────────────────────
/**
 * Only invoiceId/paymentId/search are supported by the backend's
 * listShipments(). division/status/documentsReceived/documentsForwarded
 * filters from the previous version have no backend support and were
 * removed.
 */
export interface ShipmentFilters {
  search?:    string
  invoiceId?: string
  paymentId?: string
}