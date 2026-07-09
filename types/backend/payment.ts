/**
 * Raw backend Payment response types.
 * Confirmed from backend source:
 *   src/payments/payments.service.ts, src/payments/payments.validation.ts,
 *   prisma/schema.prisma, PPMI Backend Integration Reference.md
 *
 * Used ONLY in lib/adapters/payment.ts — never imported by components.
 *
 * IMPORTANT: The backend Payment model is a FLAT installment record —
 * each Payment row IS one installment. There is no parent "payment document"
 * with a child installments array. The frontend PaymentDocument model (with
 * sub-installments, verificationStatus, etc.) is a frontend abstraction that
 * does not match the real backend shape.
 */

// ─── Backend enums ────────────────────────────────────────────────
/**
 * prisma: enum PaymentStatus { UNPAID  INSTALLMENT  PAID }
 *
 * Frontend has UNPAID | PARTIAL | PAID | OVERDUE — mismatched.
 * Mapping applied in adapter:
 *   UNPAID      → UNPAID      (direct)
 *   INSTALLMENT → INSTALLMENT (partially paid installment)
 *   PAID        → PAID        (direct)
 *   PARTIAL     does NOT exist in backend — legacy frontend only
 *   OVERDUE     does NOT exist in backend — computed from dueDate client-side
 */
export type BackendPaymentStatus = 'UNPAID' | 'INSTALLMENT' | 'PAID'

// ─── Backend list/detail item ─────────────────────────────────────
/**
 * Each row returned by GET /payments and GET /payments/:id.
 * The `id` field is auto-generated PAY-YYYYMMDD-NNN.
 * The backend Payment model has NO: division, insuredName, vesselName,
 * verificationStatus, isInstallment flag, installments array, lastPaymentDate,
 * lastPaymentMethod, lastReferenceNumber, activity log.
 * Those are frontend-only abstractions or belong to linked Voucher/Invoice.
 */
export interface BackendPaymentItem {
  id:                 string         // PAY-YYYYMMDD-NNN
  voucher_id:         string         // linked voucher doc number
  installment_number: number
  payment_date:       string | Date | null
  due_date:           string | Date
  paid_amount:        number
  remaining_amount:   number
  payment_status:     BackendPaymentStatus
  remarks:            string
  created_at:         string | Date
  updated_at:         string | Date
  // Nested relation — present in list and detail responses
  voucher?: {
    id:             string
    voucher_number: string
    invoice_id:     string
  }
}

export type BackendPaymentDetail = BackendPaymentItem

// ─── List response envelope ───────────────────────────────────────
export interface BackendPaymentListData {
  items:        BackendPaymentItem[]
  total_pages:  number
  current_page: number
}

export interface BackendPaymentListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendPaymentListData
}

export interface BackendPaymentDetailEnvelope {
  success:     boolean
  status_code: number
  data:        BackendPaymentDetail
}

export interface BackendPaymentMutationEnvelope {
  success:     boolean
  status_code: number
  data:        BackendPaymentDetail
}

// ─── Create/update payload ────────────────────────────────────────
/**
 * Confirmed from createPaymentSchema in payments.validation.ts:
 *   voucher_id, installment_number, payment_date, due_date,
 *   paid_amount, remaining_amount, payment_status, remarks (all required)
 *   payment_proof (optional)
 * NOTE: payment_proof is accepted by the Zod schema and passed into
 * prisma.payment.create() by the backend service, but the Prisma
 * `Payment` model has no matching column — a known backend-side
 * inconsistency (see PPMI Backend Integration Reference.md). Sending it
 * matches the documented request contract; whether the backend persists
 * it is outside the frontend's control.
 */
export interface BackendCreatePaymentPayload {
  voucher_id:         string
  installment_number: number
  payment_date:       string | null
  due_date:           string
  paid_amount:        number
  remaining_amount:   number
  payment_status:     BackendPaymentStatus
  remarks:            string
  payment_proof?:     string
}

export type BackendUpdatePaymentPayload = Partial<BackendCreatePaymentPayload>

// ─── Query params ─────────────────────────────────────────────────
/**
 * Backend listPayments() accepts:
 *   voucher_id, payment_status, search, page, limit, sort_by, sort_order
 * Does NOT accept: division, isInstallment, dueDate range filters
 */
export interface BackendPaymentQueryParams {
  voucher_id?:     string
  payment_status?: string
  search?:         string
  page?:           string
  limit?:          string
  sort_by?:        string
  sort_order?:     string
}