/**
 * DEPRECATED — the backend has no exposed activity/audit-log endpoint
 * for Shipment (GET /shipments/:id returns only the DocumentShipment row
 * + invoice/shipping_proof relations, no activity history). The previous
 * ShipmentDocument.activity field was frontend-only fictional data and
 * has been removed from types/shipment.ts. Left as an empty module
 * (no exports) rather than deleted, so any stale import fails loudly at
 * compile time.
 */
export {}