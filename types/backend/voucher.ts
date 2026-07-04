/**
 * Raw backend Voucher payload types.
 * Confirmed from backend ZodError: invoice_id, voucher_number, voucher_date,
 * payment_type, status, remarks are required fields.
 * All other fields follow the same snake_case convention as the QS backend.
 *
 * Used ONLY in lib/adapters/voucher.ts — never imported by components.
 */

// ─── Backend enums ────────────────────────────────────────────────
export type BackendVoucherStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSED'
  | 'CANCELLED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSED'
  | 'CANCELLED'

export type BackendVoucherPaymentType =
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'RTGS'
  | 'SWIFT'
  | 'CASH'

// ─── Create payload ───────────────────────────────────────────────
/**
 * Confirmed required fields from backend ZodError response:
 *   invoice_id, voucher_number, voucher_date, payment_type, status, remarks
 *
 * voucher_number: sent as '' — backend auto-generates the real number.
 * voucher_date:   sent as today's ISO DateTime — backend may override.
 * remarks:        maps from frontend internalNotes; required, defaults to '-'.
 */
export interface BackendCreateVoucherPayload {
  // Required
  invoice_id:      string                      // UUID of linked invoice
  voucher_number:  string                      // '' — backend auto-generates
  voucher_date:    string                      // ISO DateTime
  payment_type:    BackendVoucherPaymentType
  status:          BackendVoucherStatus
  remarks:         string                      // maps from internalNotes

  // Optional — bank & payment
  currency?:         string
  amount?:           number
  bank_name?:        string
  bank_branch?:      string
  account_number?:   string
  account_name?:     string
  swift_code?:       string
  processing_date?:  string                    // ISO DateTime

  // Optional — approval
  approval_pic?:     string
  approval_notes?:   string
}

/** Backend PATCH /vouchers/:id — all fields optional */
export type BackendUpdateVoucherPayload = Partial<BackendCreateVoucherPayload>