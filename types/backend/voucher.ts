/**
 * Raw backend Voucher payload types.
 * Historical note: previously confirmed from backend ZodError against the
 * earlier contract (invoice_id, voucher_number, voucher_date, payment_type,
 * status, remarks required). Per the latest Finance API Specification,
 * Voucher Invoice now originates from an RFI, not an Invoice — invoice_id
 * has been renamed to rfi_id below accordingly (Phase 5).
 * All other fields follow the same snake_case convention as the QS backend.
 *
 * Used ONLY in lib/adapters/voucher.ts — never imported by components.
 */

// ─── Backend enums ────────────────────────────────────────────────
// Confirmed from vouchers.validation.ts createVoucherSchema/updateVoucherSchema:
// status: z.enum(['DRAFT', 'PENDING', 'CLOSED'])
export type BackendVoucherStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CLOSED'

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
  rfi_id:          string                      // UUID of the source RFI (was invoice_id — Voucher now originates from RFI, not Invoice, per the latest Finance API Specification)
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

// ─── List / detail item shape ─────────────────────────────────────
/**
 * Shape returned by listVouchers() and getVoucher().
 * Confirmed from src/vouchers/vouchers.service.ts — `include` returns all
 * scalar columns of the Voucher row unmodified, plus two selected relations.
 * No `select` is applied at the top level, so every Voucher scalar column
 * is present. There is no `qs`, `payments`, or `division` relation included
 * at all — those do not exist on this response.
 */
export interface BackendVoucherListItem {
  id:             string          // app-generated doc number, e.g. "VCH-20260705-001"
  rfi_id:         string          // UUID — was invoice_id (Voucher now originates from RFI)
  voucher_number: string
  voucher_date:   string | Date
  payment_type:   BackendVoucherPaymentType
  bank_id:        string | null
  amount:         number          // integer
  currency:       string
  status:         BackendVoucherStatus
  remarks:        string
  is_deleted:     boolean
  created_at:     string | Date
  updated_at:     string | Date
  deleted_at:     string | Date | null
  rfi: {
    id:             string
    request_number: string
  } | null
  bank: {
    id:   string
    name: string
  } | null
}

export type BackendVoucherDetail = BackendVoucherListItem

// ─── List response envelope ───────────────────────────────────────
export interface BackendVoucherListData {
  items:        BackendVoucherListItem[]
  total_pages:  number
  current_page: number
}

export interface BackendVoucherListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendVoucherListData
}

export interface BackendVoucherDetailEnvelope {
  success:     boolean
  status_code: number
  data:        BackendVoucherDetail
}