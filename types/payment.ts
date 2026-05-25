import type { Division } from './workflow'

// ─── Payment-specific status ─────────────────────────────────────
export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'

export type PaymentVerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'FLAGGED'

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'RTGS'
  | 'SWIFT'
  | 'CHEQUE'
  | 'CASH'

// ─── Installment record ──────────────────────────────────────────
export interface PaymentInstallment {
  id:                 string
  paymentId:          string
  installmentNumber:  number
  dueDate:            string
  amount:             number
  paidAmount:         number
  paidDate?:          string
  paymentMethod?:     PaymentMethod
  referenceNumber?:   string
  status:             PaymentStatus
  verifiedBy?:        string
  verifiedAt?:        string
  notes?:             string
}

// ─── Payment activity ────────────────────────────────────────────
export type PaymentActivityType =
  | 'created'
  | 'updated'
  | 'payment_received'
  | 'installment_recorded'
  | 'overdue_flagged'
  | 'verified'
  | 'flagged'
  | 'shipment_generated'
  | 'note_added'

export interface PaymentActivity {
  id:          string
  type:        PaymentActivityType
  description: string
  actor:       string
  timestamp:   string
  meta?: {
    amount?:            number
    currency?:          'IDR' | 'USD'
    installmentNumber?: number
    referenceNumber?:   string
    fromStatus?:        PaymentStatus
    toStatus?:          PaymentStatus
  }
}

// ─── Full Payment Document ───────────────────────────────────────
export interface PaymentDocument {
  id:                  string
  docNumber:           string
  division:            Division
  paymentStatus:       PaymentStatus
  verificationStatus:  PaymentVerificationStatus

  // Linked chain
  voucherId:           string
  voucherNumber:       string
  invoiceId:           string
  invoiceNumber:       string
  qsId:                string
  qsNumber:            string
  shipmentId?:         string
  shipmentNumber?:     string

  // Insured
  insuredName:         string
  vesselName?:         string

  // Financial
  currency:            'IDR' | 'USD'
  totalAmount:         number
  paidAmount:          number
  remainingAmount:     number

  // Dates
  dueDate:             string
  paidDate?:           string

  // Installments
  isInstallment:       boolean
  installmentCount?:   number
  installments?:       PaymentInstallment[]

  // Last payment
  lastPaymentDate?:    string
  lastPaymentAmount?:  number
  lastPaymentMethod?:  PaymentMethod
  lastReferenceNumber?:string

  // Finance verification
  verifiedBy?:         string
  verifiedAt?:         string
  verificationNotes?:  string
  flagReason?:         string

  // Notes
  internalNotes?:      string

  // Meta
  createdBy:           string
  createdAt:           string
  updatedBy?:          string
  updatedAt:           string
  activity?:           PaymentActivity[]
}

// ─── List item (table row) ───────────────────────────────────────
export interface PaymentListItem {
  id:                 string
  docNumber:          string
  division:           Division
  voucherNumber:      string
  invoiceNumber:      string
  insuredName:        string
  vesselName?:        string
  currency:           'IDR' | 'USD'
  totalAmount:        number
  paidAmount:         number
  remainingAmount:    number
  dueDate:            string
  paymentStatus:      PaymentStatus
  verificationStatus: PaymentVerificationStatus
  isInstallment:      boolean
  installmentCount?:  number
  hasShipment:        boolean
  shipmentNumber?:    string
  createdAt:          string
}

// ─── Record payment payload ──────────────────────────────────────
export interface RecordPaymentPayload {
  paymentId:       string
  paidAmount:      number
  paidDate:        string
  paymentMethod:   PaymentMethod
  referenceNumber?:string
  notes?:          string
}

// ─── Record installment payload ──────────────────────────────────
export interface RecordInstallmentPayload {
  installmentId:   string
  paidAmount:      number
  paidDate:        string
  paymentMethod:   PaymentMethod
  referenceNumber?:string
  notes?:          string
}

// ─── Create payment payload ──────────────────────────────────────
export interface CreatePaymentPayload {
  voucherId:        string
  division:         Division
  currency:         'IDR' | 'USD'
  totalAmount:      number
  dueDate:          string
  isInstallment:    boolean
  installmentCount?:number
  internalNotes?:   string
}

// ─── Filters ─────────────────────────────────────────────────────
export interface PaymentFilters {
  search?:            string
  paymentStatus?:     PaymentStatus | ''
  verificationStatus?:PaymentVerificationStatus | ''
  division?:          Division | ''
  isInstallment?:     'true' | 'false' | ''
  dueDateFrom?:       string
  dueDateTo?:         string
}
