/**
 * Raw backend Invoice response types.
 * Historical note: previously confirmed from backend source
 * (src/invoices/invoices.service.ts, invoices.validation.ts,
 * prisma/schema.prisma) against the earlier contract, where Invoice
 * originated directly from a QS document (qs_id).
 *
 * Per the latest Finance API Specification, Invoice now originates
 * from a Voucher Invoice (voucherInvoiceId), not a QS — qs_id has
 * been renamed to voucher_invoice_id accordingly (Phase 6), and the
 * status enum has been aligned to the spec's documented values
 * (DRAFT → ISSUED → UNPAID → PARTIAL → PAID).
 *
 * Used ONLY in lib/adapters/invoice.ts — never imported by components.
 */

// ─── Backend enums ────────────────────────────────────────────────

/**
 * Per the latest Finance API Specification's documented Invoice Status
 * flow: DRAFT → ISSUED → UNPAID → PARTIAL → PAID.
 * The earlier contract's PENDING/VOUCHER/SHIPPED/CLOSED values are
 * retired — VOUCHER in particular no longer makes sense as an Invoice
 * status now that Voucher precedes Invoice instead of following it.
 */
export type BackendInvoiceStatus = 'DRAFT' | 'ISSUED' | 'UNPAID' | 'PARTIAL' | 'PAID'

/** Cancelled is only allowed before the first payment — handled as a separate action, not a writable create/update status. */
export type BackendInvoiceWritableStatus = 'DRAFT' | 'ISSUED'

// ─── List / detail item shape ─────────────────────────────────────
/**
 * Shape returned by listInvoices() and getInvoice().
 * `id` is auto-generated document number e.g. "INV-20250115-001".
 * Includes nested `voucher_invoice: { id, voucher_invoice_number }`
 * relation (was `qs: { id, policy_number }`).
 * Dates are Prisma DateTime — may arrive as Date or ISO string.
 */
export interface BackendInvoiceListItem {
  id:                  string
  voucher_invoice_id:  string          // was qs_id — Invoice now originates from Voucher Invoice
  invoice_number:      string
  invoice_date:        string | Date
  due_date:            string | Date
  insured:             string
  amount:              number          // integer
  currency:            string
  status:              BackendInvoiceStatus
  remarks:             string
  is_deleted:          boolean
  created_at:          string | Date
  updated_at:          string | Date
  deleted_at:          string | Date | null
  voucher_invoice?: {
    id:                     string
    voucher_invoice_number: string
    // Auto-fill technical fields, per the latest Finance API
    // Specification's "System Auto Fill" section — sourced from the
    // Voucher Invoice's own RFI/Policy chain, not entered manually.
    // Optional: population depends on the backend including these on
    // the joined relation, which is not yet confirmed.
    policy_number?:         string
    premium?:               number
    insurance_company_name?: string
    leader_name?:           string
    member_names?:          string[]
  }
}

export type BackendInvoiceDetail = BackendInvoiceListItem

// ─── List response envelope ───────────────────────────────────────
/**
 * client.ts get<T>() returns res.data = full Axios response body.
 * So adapters access envelope.data.items / .total_pages / .current_page.
 */
export interface BackendInvoiceListData {
  items:        BackendInvoiceListItem[]
  total_pages:  number
  current_page: number
}

export interface BackendInvoiceListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendInvoiceListData
}

export interface BackendInvoiceDetailEnvelope {
  success:     boolean
  status_code: number
  data:        BackendInvoiceDetail
}

export interface BackendInvoiceMutationEnvelope {
  success:     boolean
  status_code: number
  data:        BackendInvoiceDetail
}

// ─── Create payload ───────────────────────────────────────────────
/** Confirmed from createInvoiceSchema against the earlier contract — all required except the renamed origin field. */
export interface BackendCreateInvoicePayload {
  voucher_invoice_id: string          // was qs_id
  invoice_number:     string
  invoice_date:       string
  due_date:           string
  insured:            string
  amount:             number
  currency:           string
  status:             BackendInvoiceWritableStatus
  remarks:            string
}

/** Confirmed from updateInvoiceSchema — all optional. Backend: PATCH /invoices/:id */
export type BackendUpdateInvoicePayload = Partial<BackendCreateInvoicePayload>

// ─── Query params ─────────────────────────────────────────────────
/**
 * Backend listInvoices() accepts these params (from @ApiQuery decorators):
 *   'limit' (not 'pageSize'), 'sort_by', 'sort_order',
 *   'voucher_invoice_id' (filter by linked Voucher Invoice — was 'qs_id')
 */
export interface BackendInvoiceQueryParams {
  status?:             string
  voucher_invoice_id?: string
  search?:             string
  page?:               string
  limit?:              string
  sort_by?:            string
  sort_order?:         string
}