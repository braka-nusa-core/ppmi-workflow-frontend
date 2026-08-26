/**
 * Raw backend Outgoing Payment (Accounts Payable) response/payload types.
 *
 * Modeled directly from the latest Finance API Specification (Source
 * of Truth) — Module 4, Outgoing Payment. No earlier contract exists
 * for this module (confirmed: zero prior implementation anywhere in
 * the codebase), so there is no "historical note" here the way there
 * is for Voucher/Invoice/Incoming Payment — this is built fresh
 * against the spec, following the same camelCase / { success, data,
 * pagination } envelope convention established in types/backend/policy.ts.
 *
 * Origin: invoiceId + insuranceCompanyId (NOT Incoming Payment — see
 * Phase 8 report for the architectural reasoning).
 *
 * Used ONLY in lib/adapters/outgoingPayment.ts — never imported by components.
 */

// ─── Status ────────────────────────────────────────────────────────
/**
 * Per the Workflow Specification (Stage 12 — Outgoing Payment),
 * distinct vocabulary from Incoming Payment's UNPAID/PARTIAL/PAID.
 */
export type BackendOutgoingPaymentStatus = 'WAITING_PAYMENT' | 'PARTIAL_PAYMENT' | 'FULLY_PAID'

// ─── List/detail item ──────────────────────────────────────────────
export interface BackendOutgoingPaymentItem {
  id:                 string
  invoiceId:          string
  insuranceCompanyId: string
  paymentDate:        string
  amount:             number
  bankReference?:     string
  status:             BackendOutgoingPaymentStatus
  createdBy:           string
  createdAt:           string
  updatedAt:           string
  invoice?: {
    id:             string
    invoiceNumber:  string
    amount:         number      // total invoice amount, for computing share ceilings
    insured?:       string
  }
  insuranceCompany?: {
    id:   string
    name: string
  }
}

export type BackendOutgoingPaymentDetail = BackendOutgoingPaymentItem

// ─── Envelopes ─────────────────────────────────────────────────────
export interface BackendOutgoingPaymentListEnvelope {
  success:    boolean
  data:       BackendOutgoingPaymentItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface BackendOutgoingPaymentDetailEnvelope {
  success:  boolean
  message?: string
  data:     BackendOutgoingPaymentDetail
}

export interface BackendOutgoingPaymentMutationEnvelope {
  success:  boolean
  message?: string
  data:     { id: string; status: BackendOutgoingPaymentStatus }
}

// ─── Create payload ──────────────────────────────────────────────
/**
 * Matches POST /finance/ap/payments per the latest Finance API
 * Specification exactly: { invoiceId, insuranceCompanyId,
 * paymentDate, amount, bankReference }.
 */
export interface BackendCreateOutgoingPaymentPayload {
  invoiceId:          string
  insuranceCompanyId: string
  paymentDate:        string
  amount:             number
  bankReference?:     string
}

export type BackendUpdateOutgoingPaymentPayload = Partial<BackendCreateOutgoingPaymentPayload>

// ─── Query params ──────────────────────────────────────────────────
export interface BackendOutgoingPaymentQueryParams {
  invoiceId?:          string
  insuranceCompanyId?: string
  status?:             string
  search?:             string
  page?:               string
  limit?:              string
}