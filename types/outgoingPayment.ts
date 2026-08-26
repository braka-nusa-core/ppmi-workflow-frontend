/**
 * Frontend Outgoing Payment (Accounts Payable) types.
 * Mirrors the latest Finance API Specification, Module 4.
 */

// ─── Status ────────────────────────────────────────────────────────
export type OutgoingPaymentStatus = 'WAITING_PAYMENT' | 'PARTIAL_PAYMENT' | 'FULLY_PAID'

// ─── List item ─────────────────────────────────────────────────────
export interface OutgoingPaymentListItem {
  id:                     string
  docNumber:              string
  invoiceId:              string
  invoiceNumber:          string
  insuredName:            string
  insuranceCompanyId:     string
  insuranceCompanyName:   string
  paymentDate:            string
  amount:                 number
  bankReference?:         string
  status:                 OutgoingPaymentStatus
  createdAt:              string
}

// ─── Full document ────────────────────────────────────────────────
export interface OutgoingPaymentDocument extends OutgoingPaymentListItem {
  createdBy: string
  updatedAt: string
}

// ─── Insurer obligation (computed client-side from Policy Placement
// share data, not returned directly by this module's own endpoints —
// see lib/api/outgoingPayment.ts for how this is assembled) ────────
export interface InsurerObligation {
  insuranceCompanyId:   string
  insuranceCompanyName: string
  role:                 'leader' | 'member'
  sharePercentage:      number
  obligationAmount:     number   // invoice.totalAmount * sharePercentage / 100
  paidAmount:           number   // sum of existing AP rows against this insurer for this invoice
  remainingAmount:      number
  status:                OutgoingPaymentStatus
}

// ─── Create payload ────────────────────────────────────────────────
export interface CreateOutgoingPaymentPayload {
  invoiceId:          string
  insuranceCompanyId: string
  paymentDate:        string
  amount:             number
  bankReference?:     string
}

// ─── Filters ───────────────────────────────────────────────────────
export interface OutgoingPaymentFilters {
  search?:              string
  status?:              OutgoingPaymentStatus
  invoiceId?:           string
  insuranceCompanyId?:  string
}
