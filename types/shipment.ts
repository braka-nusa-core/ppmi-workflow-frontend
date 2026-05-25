import type { Division } from './workflow'

// ─── Shipment-specific status ────────────────────────────────────
export type ShipmentStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'DOCUMENTS_RECEIVED'
  | 'DOCUMENTS_FORWARDED'
  | 'COMPLETED'
  | 'CANCELLED'

// ─── Activity ────────────────────────────────────────────────────
export type ShipmentActivityType =
  | 'created'
  | 'updated'
  | 'documents_received'
  | 'documents_forwarded'
  | 'completed'
  | 'cancelled'
  | 'note_added'

export interface ShipmentActivity {
  id:          string
  type:        ShipmentActivityType
  description: string
  actor:       string
  timestamp:   string
  meta?: {
    fromStatus?: ShipmentStatus
    toStatus?:   ShipmentStatus
    notes?:      string
  }
}

// ─── Full Shipment Document ──────────────────────────────────────
export interface ShipmentDocument {
  id:                       string
  docNumber:                string
  division:                 Division
  status:                   ShipmentStatus

  // Linked chain
  paymentId:                string
  paymentNumber:            string
  voucherId:                string
  voucherNumber:            string
  invoiceId:                string
  invoiceNumber:            string
  qsId:                     string
  qsNumber:                 string

  // Insured / vessel
  insuredName:              string
  vesselName?:              string
  vesselFlag?:              string

  // Shipment details
  shipmentDate?:            string
  portOfLoading?:           string
  portOfDischarge?:         string
  blNumber?:                string   // Bill of Lading
  containerNumber?:         string
  voyageNumber?:            string

  // Document tracking
  documentsReceived:        boolean
  documentsReceivedDate?:   string
  documentsReceivedBy?:     string
  documentsForwarded:       boolean
  documentsForwardedDate?:  string
  documentsForwardedTo?:    string
  documentsForwardedBy?:    string

  // Coverage summary (from QS)
  insuranceType?:           string
  currency?:                'IDR' | 'USD'
  premiumAmount?:           number

  // Notes
  internalNotes?:           string

  // Meta
  createdBy:                string
  createdAt:                string
  updatedBy?:               string
  updatedAt:                string
  activity?:                ShipmentActivity[]
}

// ─── List item (table row) ───────────────────────────────────────
export interface ShipmentListItem {
  id:                   string
  docNumber:            string
  division:             Division
  paymentNumber:        string
  invoiceNumber:        string
  insuredName:          string
  vesselName?:          string
  status:               ShipmentStatus
  shipmentDate?:        string
  blNumber?:            string
  documentsReceived:    boolean
  documentsForwarded:   boolean
  createdAt:            string
}

// ─── Create payload ──────────────────────────────────────────────
export interface CreateShipmentPayload {
  paymentId:             string
  division:              Division
  shipmentDate?:         string
  portOfLoading?:        string
  portOfDischarge?:      string
  blNumber?:             string
  containerNumber?:      string
  voyageNumber?:         string
  internalNotes?:        string
}

export type UpdateShipmentPayload = Partial<CreateShipmentPayload> & {
  status?:               ShipmentStatus
  documentsReceived?:    boolean
  documentsReceivedDate?:string
  documentsReceivedBy?:  string
  documentsForwarded?:   boolean
  documentsForwardedDate?:string
  documentsForwardedTo?: string
  documentsForwardedBy?: string
}

// ─── Filters ─────────────────────────────────────────────────────
export interface ShipmentFilters {
  search?:            string
  status?:            ShipmentStatus | ''
  division?:          Division | ''
  documentsReceived?: 'true' | 'false' | ''
  documentsForwarded?:'true' | 'false' | ''
}
