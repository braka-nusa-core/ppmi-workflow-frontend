/**
 * Incoming Payment adapters — map raw backend Payment records to
 * frontend PaymentListItem/PaymentDocument shapes, and map frontend
 * create payloads to BackendCreatePaymentPayload.
 *
 * Same pattern as lib/adapters/policy.ts / rfi.ts (Phase 3/4).
 *
 * STRUCTURAL NOTE (unchanged from the module's original design):
 * the backend Payment model is a flat record — each row IS one
 * payment/installment entry against an invoice. There is no parent
 * "payment document" with a child installments array on the backend.
 * The frontend's richer PaymentDocument (with an installments array,
 * verificationStatus, activity log) remains a frontend-side grouping
 * convenience, not a 1:1 backend mirror — same acknowledgment as the
 * previous version of this file, just re-targeted to originate from
 * Invoice instead of Voucher.
 */

import type { PaymentListItem, PaymentDocument, PaymentFilters } from '@/types/payment'
import type {
  BackendPaymentItem,
  BackendPaymentStatus,
  BackendCreatePaymentPayload,
  BackendUpdatePaymentPayload,
  BackendPaymentQueryParams,
} from '@/types/backend/payment'

// ─── Helpers ──────────────────────────────────────────────────────
function toISO(v: string | Date | null | undefined): string {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString()
  return v
}

function isOverdue(dueDate: string | Date | undefined): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

/** HTML <input type="date"> → full ISO-8601 DateTime, same convention as policy.ts/rfi.ts. */
function dateInputToISO(dateStr: string | undefined | null): string | undefined {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr
  return `${dateStr}T00:00:00.000Z`
}

/**
 * Derive frontend PaymentStatus from backend status + due date.
 * OVERDUE is a frontend-only derived state for UNPAID/PARTIAL payments
 * whose invoice due date has passed. Due date isn't on the Payment
 * record itself under the invoice-origin model — callers pass the
 * linked invoice's due date in explicitly where available.
 */
function toFrontendStatus(
  status: BackendPaymentStatus,
  invoiceDueDate?: string | Date
): PaymentListItem['paymentStatus'] {
  if (status === 'PAID') return 'PAID'
  if (isOverdue(invoiceDueDate)) return 'OVERDUE'
  return status  // UNPAID or PARTIAL pass through
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapPaymentListItem(item: BackendPaymentItem): PaymentListItem {
  const totalAmt = item.invoice?.amount ?? (item.amount + item.remainingBalance)
  return {
    id:                 item.id,
    docNumber:          item.id,
    division:           'PI',                              // not in Payment response — stub, no division relation
    invoiceId:          item.invoiceId,
    invoiceNumber:      item.invoice?.invoiceNumber ?? item.invoiceId,
    insuredName:        item.invoice?.insured ?? item.notes ?? '—',
    currency:           'IDR',                              // not in Payment response — default; stub
    totalAmount:        totalAmt,
    paidAmount:         item.amount,
    remainingAmount:    item.remainingBalance,
    dueDate:            '',                                 // not on Payment response — would need Invoice detail
    paymentStatus:      toFrontendStatus(item.status),
    verificationStatus: 'UNVERIFIED',                        // not in Payment response
    isInstallment:      item.remainingBalance > 0,
    hasShipment:        false,                               // not in Payment response
    createdAt:          toISO(item.createdAt),
  }
}

export function mapPaymentDetail(item: BackendPaymentItem): PaymentDocument {
  const totalAmt = item.invoice?.amount ?? (item.amount + item.remainingBalance)
  return {
    id:                  item.id,
    docNumber:           item.id,
    division:            'PI',                              // not in Payment response — stub
    paymentStatus:       toFrontendStatus(item.status),
    verificationStatus:  'UNVERIFIED',                       // not in Payment response

    invoiceId:           item.invoiceId,
    invoiceNumber:       item.invoice?.invoiceNumber ?? item.invoiceId,

    insuredName:         item.invoice?.insured ?? item.notes ?? '—',
    currency:            'IDR',                              // not in Payment response — stub

    totalAmount:         totalAmt,
    paidAmount:          item.amount,
    remainingAmount:     item.remainingBalance,

    dueDate:             '',                                 // not on Payment response
    paidDate:            toISO(item.paymentDate) || undefined,

    isInstallment:       item.remainingBalance > 0,
    installments:        [],                                 // flat model — see file header note

    lastPaymentDate:     toISO(item.paymentDate) || undefined,
    lastPaymentAmount:   item.amount,
    lastPaymentMethod:   item.paymentMethod as PaymentDocument['lastPaymentMethod'],
    lastReferenceNumber: item.referenceNumber,

    internalNotes:       item.notes,

    createdBy:           item.createdBy,
    createdAt:           toISO(item.createdAt),
    updatedAt:           toISO(item.updatedAt),
    activity:            [],                                 // not in Payment response
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

/**
 * Map frontend RecordPaymentPayload/CreatePaymentPayload →
 * BackendCreatePaymentPayload. Matches the latest spec's create
 * request exactly: no due_date, remaining_amount, or
 * installment_number — the backend computes/sequences those itself.
 */
export function mapCreatePaymentPayload(payload: {
  invoiceId:        string
  paidDate:         string
  paidAmount:       number
  paymentMethod:    string
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
}): BackendCreatePaymentPayload {
  return {
    invoiceId:        payload.invoiceId,
    paymentDate:      dateInputToISO(payload.paidDate) ?? payload.paidDate,
    amount:           Math.round(payload.paidAmount),
    paymentMethod:    payload.paymentMethod,
    bankAccount:      payload.bankAccount,
    referenceNumber:  payload.referenceNumber,
    notes:            payload.notes,
  }
}

export function mapUpdatePaymentPayload(payload: {
  paidAmount?:      number
  paidDate?:        string
  paymentMethod?:   string
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
}): BackendUpdatePaymentPayload {
  const result: BackendUpdatePaymentPayload = {}
  if (payload.paidAmount != null) result.amount        = Math.round(payload.paidAmount)
  if (payload.paidDate)           result.paymentDate   = dateInputToISO(payload.paidDate)
  if (payload.paymentMethod)      result.paymentMethod = payload.paymentMethod
  if (payload.bankAccount)        result.bankAccount   = payload.bankAccount
  if (payload.referenceNumber)    result.referenceNumber = payload.referenceNumber
  if (payload.notes)              result.notes         = payload.notes
  return result
}

export function mapPaymentQueryParams(
  filters: PaymentFilters & { page?: number }
): BackendPaymentQueryParams {
  const params: BackendPaymentQueryParams = {}
  if (filters.search) params.search = filters.search
  if (filters.page)   params.page   = String(filters.page)

  if (filters.paymentStatus) {
    const s = filters.paymentStatus
    if (s === 'PAID')                       params.status = 'PAID'
    else if (s === 'PARTIAL')               params.status = 'PARTIAL'
    else if (s === 'UNPAID' || s === 'OVERDUE') params.status = 'UNPAID'
  }
  // verificationStatus, division, isInstallment, dueDate range have no
  // backend query param support — omitted; client-side filtering only

  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapPaymentListPagination(
  items: PaymentListItem[],
  pagination: { page: number; limit: number; total: number; totalPages: number }
) {
  return {
    success: true,
    data:    items,
    pagination: {
      page:       pagination.page,
      pageSize:   pagination.limit,
      total:      pagination.total,
      totalPages: pagination.totalPages,
    },
  }
}