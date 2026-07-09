/**
 * DEPRECATED — the backend's DocumentShipment model has no status column
 * at all (confirmed: only invoice_id, payment_id, courier, tracking_number,
 * shipping_date, shipping_proof_id exist). The previous ShipmentStatus
 * enum (DRAFT/IN_PROGRESS/DOCUMENTS_RECEIVED/DOCUMENTS_FORWARDED/
 * COMPLETED/CANCELLED) was entirely fictional and has been removed from
 * types/shipment.ts. This file is intentionally left empty (no exports)
 * rather than deleted, so any stale import elsewhere fails loudly at
 * compile time instead of silently rendering a badge for data that
 * doesn't exist on the backend.
 */
export {}