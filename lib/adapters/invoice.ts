/**
 * Invoice adapters — map raw backend response fields to frontend
 * InvoiceListItem / InvoiceDocument shapes, and map frontend
 * CreateInvoicePayload to BackendCreateInvoicePayload.
 *
 * All transformation logic lives here. lib/api/invoice.ts calls these.
 * Components never import from this file.
 */

import type {
  InvoiceListItem,
  InvoiceDocument,
  InvoiceStatus,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceFilters,
} from '@/types/invoice'
import type {
  BackendInvoiceListItem,
  BackendInvoiceDetail,
  BackendInvoiceStatus,
  BackendInvoiceWritableStatus,
  BackendCreateInvoicePayload,
  BackendUpdateInvoicePayload,
  BackendInvoiceQueryParams,
} from '@/types/backend/invoice'

// ─── Date → ISO string (INBOUND: backend → frontend) ─────────────
// Used when mapping backend response fields to frontend display values.
// Passes strings through unchanged — backend already returns full ISO strings.
function toISO(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return value
}

// ─── Date → ISO-8601 DateTime (OUTBOUND: frontend → backend) ─────
// Prisma requires full ISO-8601 DateTime strings (e.g. "2026-07-03T00:00:00.000Z").
// HTML <input type="date"> produces "YYYY-MM-DD" — Prisma rejects this with
// PrismaClientValidationError: "Expected ISO-8601 DateTime".
// This function appends T00:00:00.000Z when a bare date string is detected.
// Already-valid ISO strings (containing 'T') are passed through unchanged.
// undefined/empty → undefined so optional fields are correctly omitted from PATCH body.
function toOutboundDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  // Already a full ISO-8601 DateTime — pass through unchanged
  if (value.includes('T')) return value
  // Bare "YYYY-MM-DD" from <input type="date"> — append midnight UTC
  return `${value}T00:00:00.000Z`
}

// ─── Currency: backend is free-text, frontend is a union ─────────
// Same situation as QS — backend `currency` field has no enum
// constraint in Prisma schema. Coerce to the closest match.
function toFrontendCurrency(value: string): 'IDR' | 'USD' {
  const upper = value.toUpperCase().trim()
  return upper === 'USD' ? 'USD' : 'IDR'
}

// ─── Backend InvoiceStatus ↔ frontend InvoiceStatus ──────────────
// Identical value sets now (both DRAFT/PENDING/VOUCHER/SHIPPED/CLOSED).
// Kept as explicit pass-through functions so any future divergence
// is isolated to this one place.
function toFrontendStatus(status: BackendInvoiceStatus): InvoiceStatus {
  return status as InvoiceStatus
}
function toBackendStatus(
  status: InvoiceStatus | undefined
): BackendInvoiceWritableStatus | undefined {
  // SHIPPED is server-derived (set by POST /shipments) — never sent by the
  // client. If a caller somehow passes it, drop it rather than send an
  // invalid status to the create/update endpoints.
  if (!status || status === 'SHIPPED') return undefined
  return status as BackendInvoiceWritableStatus
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

/** Map a single BackendInvoiceListItem → InvoiceListItem (one table row) */
export function mapInvoiceListItem(item: BackendInvoiceListItem): InvoiceListItem {
  return {
    id:              item.id,
    docNumber:       item.invoice_number,
    qsNumber:        item.qs?.id ?? item.qs_id,
    insuredName:     item.insured,
    currency:        toFrontendCurrency(item.currency),
    totalAmount:     item.amount,
    paidAmount:       0,          // not in Invoice response — derive later via Payment module
    remainingAmount:  item.amount, // not in Invoice response — derive later via Payment module
    dueDate:         toISO(item.due_date),
    status:          toFrontendStatus(item.status),
    paymentStatus:   'UNPAID',    // not in Invoice response — derive later via Payment module
    hasVoucher:      false,       // not in Invoice response — derive later via Voucher module
    voucherNumber:   undefined,
    createdAt:       toISO(item.created_at),
    // division is not present on the backend Invoice model — left
    // undefined; components already type this field as optional-safe
    // via Division union, so this is a known gap (see invoice adapter
    // notes). Cast kept minimal to avoid widening InvoiceListItem here.
    division:        undefined as unknown as InvoiceListItem['division'],
  }
}

/** Map BackendInvoiceDetail → InvoiceDocument (detail page) */
export function mapInvoiceDetail(item: BackendInvoiceDetail): InvoiceDocument {
  return {
    id:              item.id,
    docNumber:       item.invoice_number,
    division:        undefined as unknown as InvoiceDocument['division'],
    status:          toFrontendStatus(item.status),
    paymentStatus:   'UNPAID',

    qsId:            item.qs_id,
    qsNumber:        item.qs?.id ?? item.qs_id,
    voucherId:       undefined,
    voucherNumber:   undefined,

    insuredName:     item.insured,
    vesselName:      undefined,
    billingAddress:  undefined,
    billingContact:  undefined,

    currency:        toFrontendCurrency(item.currency),
    subtotal:        item.amount,
    totalAmount:     item.amount,
    paidAmount:      0,
    remainingAmount: item.amount,

    issueDate:       toISO(item.invoice_date),
    dueDate:         toISO(item.due_date),

    internalNotes:   item.remarks,
    attachments:     [],

    createdBy:       '', // not in backend Invoice response — known gap, see adapter notes
    createdAt:       toISO(item.created_at),
    updatedBy:       undefined,
    updatedAt:       toISO(item.updated_at),
    activity:        [],
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

/**
 * Map frontend CreateInvoicePayload → BackendCreateInvoicePayload.
 *
 * Fields with no backend equivalent are dropped silently:
 *   division, vesselName, billingAddress, billingContact, taxRate,
 *   discount, paymentTerms, bankInfo (none exist in the Prisma
 *   Invoice model).
 *
 * `invoice_number` is required by the backend but has no source field
 * on CreateInvoicePayload yet — falls back to a generated placeholder
 * until the Create form is updated to collect it (Phase 2/3).
 */
export function mapCreateInvoicePayload(
  payload: CreateInvoicePayload
): BackendCreateInvoicePayload {
  return {
    qs_id:          payload.qsId,
    invoice_number: `INV-${Date.now()}`, // placeholder — replace once form collects this
    invoice_date:   toOutboundDate(payload.issueDate)!, // YYYY-MM-DD → ISO-8601 DateTime
    due_date:       toOutboundDate(payload.dueDate)!,   // YYYY-MM-DD → ISO-8601 DateTime
    insured:        payload.insuredName,
    amount:         Math.round(payload.subtotal), // backend expects integer
    currency:       payload.currency,
    status:         'DRAFT',
    remarks:        payload.internalNotes || '-',  // backend requires min(1)
  }
}

/**
 * Map frontend UpdateInvoicePayload → BackendUpdateInvoicePayload.
 * Only includes fields that are actually present (undefined = omit from PATCH body).
 */
export function mapUpdateInvoicePayload(
  payload: UpdateInvoicePayload
): BackendUpdateInvoicePayload {
  const result: BackendUpdateInvoicePayload = {}

  if (payload.status)              result.status       = toBackendStatus(payload.status)
  if (payload.insuredName)         result.insured      = payload.insuredName
  if (payload.currency)            result.currency     = payload.currency
  if (payload.issueDate)           result.invoice_date = toOutboundDate(payload.issueDate) // YYYY-MM-DD → ISO-8601
  if (payload.dueDate)             result.due_date     = toOutboundDate(payload.dueDate)     // YYYY-MM-DD → ISO-8601
  if (payload.internalNotes)       result.remarks      = payload.internalNotes
  if (payload.subtotal != null)    result.amount       = Math.round(payload.subtotal)

  return result
}

/**
 * Map frontend InvoiceFilters (+ pagination/sort) → BackendInvoiceQueryParams.
 * Conversions: pageSize→limit, sortDir→sort_order, sortBy→sort_by
 * (validated against backend's allowed sort fields).
 */
export function mapInvoiceQueryParams(
  filters: InvoiceFilters & {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  }
): BackendInvoiceQueryParams {
  const SORT_FIELD_MAP: Record<string, string> = {
    docNumber:    'invoice_number',
    insuredName:  'insured',
    totalAmount:  'amount',
    dueDate:      'due_date',
    createdAt:    'created_at',
    updatedAt:    'updated_at',
  }

  const params: BackendInvoiceQueryParams = {}

  if (filters.search)   params.search     = filters.search
  if (filters.status)   params.status     = filters.status
  if (filters.page)     params.page       = String(filters.page)
  if (filters.pageSize) params.limit      = String(filters.pageSize)
  if (filters.sortDir)  params.sort_order = filters.sortDir
  if (filters.sortBy && SORT_FIELD_MAP[filters.sortBy]) {
    params.sort_by = SORT_FIELD_MAP[filters.sortBy]
  }

  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
/**
 * Convert backend pagination (items + total_pages + current_page) to
 * frontend PaginatedResponse shape (page/pageSize/total/totalPages).
 * Backend does not return a total item count — estimated as
 * totalPages * pageSize (may be slightly high on the last page).
 */
export function mapInvoiceListPagination(
  items: InvoiceListItem[],
  totalPages: number,
  currentPage: number,
  pageSize: number
) {
  return {
    success: true,
    data:    items,
    pagination: {
      page:       currentPage,
      pageSize,
      total:      totalPages * pageSize,
      totalPages,
    },
  }
}