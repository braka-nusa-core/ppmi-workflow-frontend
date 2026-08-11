import type { Division } from './workflow'

// ─── Payment method ───────────────────────────────────────────────
export type PaymentMethod = 'BANK_TRANSFER' | 'RTGS' | 'SWIFT' | 'CHEQUE' | 'CASH'

// ─── Verification status (frontend-only concept — not part of the
// documented Incoming Payment API) ─────────────────────────────────
export type PaymentVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'FLAGGED'

// ─── Payment-specific status ─────────────────────────────────────
// Aligned with the latest Finance API Specification's documented
// Incoming Payment status flow: UNPAID → PARTIAL → PAID.
export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  // Frontend-computed convenience (not part of the backend contract):
  | 'OVERDUE'   // UNPAID/PARTIAL + dueDate < today

// ─── Installment (frontend-side grouping concept — see
// lib/adapters/payment.ts header note: the backend Payment model is
// flat, this sub-array is always empty from the adapter today) ────
export interface PaymentInstallment {
  id:               string
  installmentNumber: number
  dueDate:          string
  paidDate?:        string
  amount:           number
  paidAmount?:      number
  status:           PaymentStatus
  paymentMethod?:   PaymentMethod
  referenceNumber?: string
}

// ─── Activity log entry (frontend-only concept — always empty from
// the adapter, no history endpoint documented) ─────────────────────
export interface PaymentActivity {
  id:          string
  action:      string
  description?: string
  performedBy: string
  createdAt:   string
  meta?: {
    fromStatus?:        string
    toStatus?:          string
    installmentNumber?: number
  }
}

// ─── List item (table row) ────────────────────────────────────────
export interface PaymentListItem {
  id:                 string
  docNumber:          string
  division:           Division
  invoiceId:          string
  invoiceNumber:      string
  voucherNumber?:     string
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

// ─── Full document ────────────────────────────────────────────────
export interface PaymentDocument {
  id:                  string
  docNumber:           string
  division:            Division
  paymentStatus:       PaymentStatus
  verificationStatus:  PaymentVerificationStatus

  // Origin (required) — Payment now originates from Invoice, per the
  // latest Finance API Specification (was voucherId under the earlier
  // contract).
  invoiceId:           string
  invoiceNumber:       string

  // Upstream context (optional display-only — not guaranteed present
  // on the Payment response; sourced transitively via Invoice if needed)
  voucherId?:          string
  voucherNumber?:      string
  qsId?:               string
  qsNumber?:           string
  shipmentId?:         string
  shipmentNumber?:     string

  insuredName:         string
  vesselName?:         string
  currency:            'IDR' | 'USD'

  totalAmount:         number
  paidAmount:          number
  remainingAmount:     number

  dueDate:             string
  paidDate?:           string

  isInstallment:       boolean
  installments?:       PaymentInstallment[]

  lastPaymentDate?:    string
  lastPaymentAmount?:  number
  lastPaymentMethod?:  PaymentMethod
  lastReferenceNumber?: string

  internalNotes?:      string

  createdBy:           string
  createdAt:           string
  updatedAt:           string
  activity:            PaymentActivity[]
}

// ─── Record payment payload ──────────────────────────────────────
// Matches POST /finance/ar/payments per the latest Finance API
// Specification: { invoiceId, paymentDate, amount, paymentMethod,
// bankAccount, referenceNumber, notes }.
export interface RecordPaymentPayload {
  invoiceId:        string
  paidAmount:       number
  paidDate:         string
  paymentMethod:    PaymentMethod
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
}

// ─── Create payment payload ──────────────────────────────────────
// Same shape as RecordPaymentPayload — a "payment" IS one record
// against an invoice (no parent/child installment structure on the
// backend). installmentNumber/dueDate/remainingAmount are no longer
// client-supplied: remaining balance is computed server-side, and
// installments are implicit (sequenced by repeated POSTs against the
// same invoiceId), per the latest spec.
export type CreatePaymentPayload = RecordPaymentPayload

// ─── Filters ───────────────────────────────────────────────────────
export interface PaymentFilters {
  search?:              string
  paymentStatus?:       PaymentStatus
  verificationStatus?:  PaymentVerificationStatus
  division?:            Division
  isInstallment?:       boolean
  dueDate?:             string
} 