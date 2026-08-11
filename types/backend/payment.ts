/**
 * Raw backend Incoming Payment (AR) response/payload types.
 *
 * Modeled directly from the latest Finance API Specification (Source
 * of Truth), following the same camelCase / { success, data,
 * pagination } envelope convention established in types/backend/policy.ts,
 * rfi.ts (Phase 3/4). Per Phase 7's explicit workflow requirement,
 * Incoming Payment now originates from Invoice — invoiceId, not
 * voucherId (the earlier contract's origin field).
 *
 * Historical note: the previous version of this file was confirmed
 * against an earlier backend contract (voucher_id origin, snake_case,
 * due_date/remaining_amount/installment_number as required create
 * fields, no paymentMethod/bankAccount/referenceNumber). Per project
 * ruling, that contract is treated as historical only — the latest
 * API Specification is authoritative.
 *
 * Used ONLY in lib/adapters/payment.ts — never imported by components.
 */

// ─── Status ────────────────────────────────────────────────────────
/**
 * Per the latest Finance API Specification's documented Incoming
 * Payment status flow: UNPAID → PARTIAL → PAID (system-derived from
 * Total Invoice - Total Payment = Remaining Balance).
 */
export type BackendPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

// ─── List/detail item ──────────────────────────────────────────────
export interface BackendPaymentItem {
  id:               string
  invoiceId:        string          // was voucher_id — Payment now originates from Invoice
  paymentDate:      string
  amount:           number
  paymentMethod:    string
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
  status:           BackendPaymentStatus
  remainingBalance: number          // system-computed: Total Invoice - Total Payment
  createdBy:        string
  createdAt:        string
  updatedAt:        string
  invoice?: {
    id:             string
    invoiceNumber:  string
    amount:         number          // total invoice amount, for computing paid/remaining on the frontend
    insured?:       string
  }
}

export type BackendPaymentDetail = BackendPaymentItem

// ─── Envelopes ─────────────────────────────────────────────────────
export interface BackendPaymentListEnvelope {
  success:    boolean
  data:       BackendPaymentItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface BackendPaymentDetailEnvelope {
  success:  boolean
  message?: string
  data:     BackendPaymentDetail
}

export interface BackendPaymentMutationEnvelope {
  success:  boolean
  message?: string
  data:     { id: string; status: BackendPaymentStatus; remainingBalance: number }
}

// ─── Create payload ──────────────────────────────────────────────
/**
 * Matches POST /finance/ar/payments per the latest Finance API
 * Specification exactly: { invoiceId, paymentDate, amount,
 * paymentMethod, bankAccount, referenceNumber, notes }.
 * due_date, remaining_amount, and installment_number — all required
 * on the earlier contract's create payload — are NOT part of the
 * documented request body: remaining balance is computed server-side
 * and returned in the response only; installments are implicit
 * (each POST is one payment entry against the same invoice, sequenced
 * by the backend, not by a client-supplied number).
 */
export interface BackendCreatePaymentPayload {
  invoiceId:        string
  paymentDate:      string
  amount:           number
  paymentMethod:    string
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
}

export type BackendUpdatePaymentPayload = Partial<BackendCreatePaymentPayload>

// ─── Query params ──────────────────────────────────────────────────
export interface BackendPaymentQueryParams {
  invoiceId?: string
  status?:    string
  search?:    string
  page?:      string
  limit?:     string
}