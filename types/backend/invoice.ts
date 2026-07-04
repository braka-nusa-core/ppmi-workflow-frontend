/**
 * Raw backend Invoice response types.
 * Confirmed from backend source:
 *   src/invoices/invoices.service.ts, src/invoices/invoices.validation.ts,
 *   prisma/schema.prisma
 *
 * Used ONLY in lib/adapters/invoice.ts — never imported by components.
 */

// ─── Backend enums ────────────────────────────────────────────────

/**
 * prisma: enum InvoiceStatus { DRAFT  PENDING  VOUCHER  SHIPPED  CLOSED }
 * Frontend had ISSUED/SENT/PAID/OVERDUE/CANCELLED — none exist in backend.
 * Note: SHIPPED is set automatically by POST /shipments — never sent by
 * the client on create/update. Not included in the create-payload enum.
 */
export type BackendInvoiceStatus = 'DRAFT' | 'PENDING' | 'VOUCHER' | 'SHIPPED' | 'CLOSED'

/** Allowed values when creating/updating an invoice (SHIPPED is read-only/derived). */
export type BackendInvoiceWritableStatus = 'DRAFT' | 'PENDING' | 'VOUCHER' | 'CLOSED'

// ─── List / detail item shape ─────────────────────────────────────
/**
 * Shape returned by listInvoices() and getInvoice().
 * `id` is auto-generated document number e.g. "INV-20250115-001".
 * Includes nested `qs: { id, policy_number }` relation.
 * Dates are Prisma DateTime — may arrive as Date or ISO string.
 */
export interface BackendInvoiceListItem {
  id:             string
  qs_id:          string
  invoice_number: string
  invoice_date:   string | Date
  due_date:       string | Date
  insured:        string
  amount:         number          // integer
  currency:       string
  status:         BackendInvoiceStatus
  remarks:        string
  is_deleted:     boolean
  created_at:     string | Date
  updated_at:     string | Date
  deleted_at:     string | Date | null
  qs?: {
    id:            string
    policy_number: string
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
/** Confirmed from createInvoiceSchema — all required. */
export interface BackendCreateInvoicePayload {
  qs_id:          string
  invoice_number: string
  invoice_date:   string
  due_date:       string
  insured:        string
  amount:         number
  currency:       string
  status:         BackendInvoiceWritableStatus
  remarks:        string
}

/** Confirmed from updateInvoiceSchema — all optional. Backend: PATCH /invoices/:id */
export type BackendUpdateInvoicePayload = Partial<BackendCreateInvoicePayload>

// ─── Query params ─────────────────────────────────────────────────
/**
 * Backend listInvoices() accepts these params (from @ApiQuery decorators):
 *   'limit' (not 'pageSize'), 'sort_by', 'sort_order',
 *   'qs_id' (filter by linked QS document id)
 */
export interface BackendInvoiceQueryParams {
  status?:     string
  qs_id?:      string
  search?:     string
  page?:       string
  limit?:      string
  sort_by?:    string
  sort_order?: string
}