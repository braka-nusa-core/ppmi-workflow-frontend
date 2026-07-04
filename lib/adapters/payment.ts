/**
 * Payment adapters — map raw backend Payment records to frontend
 * PaymentListItem / PaymentDocument shapes, and map frontend
 * create/update payloads to BackendCreatePaymentPayload.
 *
 * KEY STRUCTURAL NOTE:
 * The backend Payment model is a FLAT installment record. Each row IS
 * one installment (installment_number, paid_amount, remaining_amount, etc.).
 * The frontend PaymentDocument with nested installments array does not exist
 * in the backend — we map a single backend Payment record to both
 * PaymentListItem and PaymentDocument, with installments: [] stub.
 *
 * Frontend PaymentStatus derivation:
 *   backend UNPAID      → 'UNPAID'       (or 'OVERDUE' if dueDate < today)
 *   backend INSTALLMENT → 'INSTALLMENT'  (or 'OVERDUE' if dueDate < today)
 *   backend PAID        → 'PAID'
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

function isOverdue(dueDate: string | Date): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

/**
 * Derive frontend PaymentStatus from backend status + due date.
 * OVERDUE is a frontend-only derived state for UNPAID/INSTALLMENT payments
 * whose due date has passed.
 */
function toFrontendStatus(
  status: BackendPaymentStatus,
  dueDate: string | Date
): PaymentListItem['paymentStatus'] {
  if (status === 'PAID') return 'PAID'
  if (isOverdue(dueDate)) return 'OVERDUE'
  return status  // UNPAID or INSTALLMENT pass through
}

function toBackendStatus(
  status: PaymentListItem['paymentStatus'] | undefined
): BackendPaymentStatus {
  if (status === 'PAID') return 'PAID'
  if (status === 'INSTALLMENT' || status === 'PARTIAL') return 'INSTALLMENT'
  return 'UNPAID'
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapPaymentListItem(item: BackendPaymentItem): PaymentListItem {
  const dueISO = toISO(item.due_date)
  return {
    id:                 item.id,
    docNumber:          item.id,
    division:           'PI',                          // not in Payment model — unknown; stub
    voucherNumber:      item.voucher?.voucher_number ?? item.voucher_id,
    invoiceNumber:      '',                            // not in Payment model — derive via Voucher integration
    insuredName:        item.remarks || '—',           // remarks is the closest text field available
    currency:           'IDR',                         // not in Payment model — default; stub
    totalAmount:        item.paid_amount + item.remaining_amount,
    paidAmount:         item.paid_amount,
    remainingAmount:    item.remaining_amount,
    dueDate:            dueISO,
    paymentStatus:      toFrontendStatus(item.payment_status, item.due_date),
    verificationStatus: 'UNVERIFIED',                  // not in Payment model
    isInstallment:      item.installment_number > 1,
    installmentCount:   item.installment_number,
    hasShipment:        false,                         // not in Payment model
    createdAt:          toISO(item.created_at),
  }
}

export function mapPaymentDetail(item: BackendPaymentItem): PaymentDocument {
  const dueISO    = toISO(item.due_date)
  const totalAmt  = item.paid_amount + item.remaining_amount
  return {
    id:                  item.id,
    docNumber:           item.id,
    division:            'PI',                         // not in Payment model — stub
    paymentStatus:       toFrontendStatus(item.payment_status, item.due_date),
    verificationStatus:  'UNVERIFIED',                 // not in Payment model

    voucherId:           item.voucher_id,
    voucherNumber:       item.voucher?.voucher_number ?? item.voucher_id,
    invoiceId:           '',                           // not in Payment model — stub
    invoiceNumber:       '',                           // not in Payment model — stub
    qsId:                '',                           // not in Payment model — stub
    qsNumber:            '',                           // not in Payment model — stub

    insuredName:         item.remarks || '—',          // closest available field
    currency:            'IDR',                        // not in Payment model — stub

    totalAmount:         totalAmt,
    paidAmount:          item.paid_amount,
    remainingAmount:     item.remaining_amount,

    dueDate:             dueISO,
    paidDate:            toISO(item.payment_date) || undefined,

    isInstallment:       item.installment_number > 1,
    installmentCount:    item.installment_number,
    installments:        [],                           // flat model — no child installments

    lastPaymentDate:     toISO(item.payment_date) || undefined,
    lastPaymentAmount:   item.paid_amount,

    internalNotes:       item.remarks,

    createdBy:           '',                           // not in Payment model
    createdAt:           toISO(item.created_at),
    updatedAt:           toISO(item.updated_at),
    activity:            [],                           // not in Payment model
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

/**
 * Map frontend CreatePaymentFormData → BackendCreatePaymentPayload.
 * The backend expects flat installment fields, not a "payment document".
 */
export function mapCreatePaymentPayload(payload: {
  voucherId:         string
  installmentNumber: number
  paymentDate?:      string | null
  dueDate:           string
  paidAmount:        number
  remainingAmount:   number
  paymentStatus:     BackendPaymentStatus
  remarks:           string
}): BackendCreatePaymentPayload {
  return {
    voucher_id:         payload.voucherId,
    installment_number: payload.installmentNumber,
    payment_date:       payload.paymentDate ?? null,
    due_date:           payload.dueDate,
    paid_amount:        Math.round(payload.paidAmount),
    remaining_amount:   Math.round(payload.remainingAmount),
    payment_status:     payload.paymentStatus,
    remarks:            payload.remarks || '-',
  }
}

/**
 * Map update fields → BackendUpdatePaymentPayload (all optional).
 */
export function mapUpdatePaymentPayload(payload: {
  paidAmount?:      number
  remainingAmount?: number
  paymentStatus?:   PaymentListItem['paymentStatus']
  paymentDate?:     string | null
  dueDate?:         string
  remarks?:         string
}): BackendUpdatePaymentPayload {
  const result: BackendUpdatePaymentPayload = {}
  if (payload.paidAmount != null)      result.paid_amount       = Math.round(payload.paidAmount)
  if (payload.remainingAmount != null) result.remaining_amount  = Math.round(payload.remainingAmount)
  if (payload.paymentStatus)           result.payment_status    = toBackendStatus(payload.paymentStatus)
  if (payload.paymentDate !== undefined) result.payment_date    = payload.paymentDate
  if (payload.dueDate)                 result.due_date          = payload.dueDate
  if (payload.remarks)                 result.remarks           = payload.remarks
  return result
}

/**
 * Map frontend PaymentFilters → BackendPaymentQueryParams.
 */
export function mapPaymentQueryParams(
  filters: PaymentFilters & {
    page?:     number
    pageSize?: number
    sortBy?:   string
    sortDir?:  'asc' | 'desc'
  }
): BackendPaymentQueryParams {
  const SORT_FIELD_MAP: Record<string, string> = {
    docNumber:       'id',
    paidAmount:      'paid_amount',
    remainingAmount: 'remaining_amount',
    dueDate:         'due_date',
    createdAt:       'created_at',
    updatedAt:       'updated_at',
  }

  const params: BackendPaymentQueryParams = {}

  if (filters.search)   params.search     = filters.search
  if (filters.page)     params.page       = String(filters.page)
  if (filters.pageSize) params.limit      = String(filters.pageSize)
  if (filters.sortDir)  params.sort_order = filters.sortDir
  if (filters.sortBy && SORT_FIELD_MAP[filters.sortBy]) {
    params.sort_by = SORT_FIELD_MAP[filters.sortBy]
  }

  // Map frontend paymentStatus to backend — drop OVERDUE (no backend equivalent)
  if (filters.paymentStatus) {
    const s = filters.paymentStatus
    if (s === 'PAID')                    params.payment_status = 'PAID'
    else if (s === 'INSTALLMENT' || s === 'PARTIAL') params.payment_status = 'INSTALLMENT'
    else if (s === 'UNPAID' || s === 'OVERDUE')      params.payment_status = 'UNPAID'
  }

  // verificationStatus, division, isInstallment, dueDate range have no
  // backend query param support — omitted; client-side filtering only

  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapPaymentListPagination(
  items: PaymentListItem[],
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