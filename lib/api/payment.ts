import { get, post, patch, del } from '@/lib/api/client'
import type { PaginatedResponse }    from '@/types/api'
import type { PaymentListItem, PaymentDocument, PaymentFilters } from '@/types/payment'
import type {
  BackendPaymentListEnvelope,
  BackendPaymentDetailEnvelope,
  BackendPaymentMutationEnvelope,
} from '@/types/backend/payment'
import {
  mapPaymentListItem,
  mapPaymentDetail,
  mapPaymentQueryParams,
  mapPaymentListPagination,
  mapCreatePaymentPayload,
  mapUpdatePaymentPayload,
} from '@/lib/adapters/payment'

const BASE = '/payments'

// ─── List ─────────────────────────────────────────────────────────
export async function fetchPaymentList(
  filters: PaymentFilters & {
    page?:     number
    pageSize?: number
    sortBy?:   string
    sortDir?:  'asc' | 'desc'
  } = {}
): Promise<PaginatedResponse<PaymentListItem>> {
  const params = mapPaymentQueryParams(filters)
  const envelope = await get<BackendPaymentListEnvelope>(BASE, { params })
  const items    = envelope.data.items.map(mapPaymentListItem)
  const pageSize = filters.pageSize ?? 25
  return mapPaymentListPagination(items, envelope.data.total_pages, envelope.data.current_page, pageSize)
}

// ─── Detail ───────────────────────────────────────────────────────
export async function fetchPaymentDetail(id: string): Promise<PaymentDocument> {
  const envelope = await get<BackendPaymentDetailEnvelope>(`${BASE}/${id}`)
  return mapPaymentDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /payments
 * Creates a new payment installment record linked to a Voucher.
 * The backend stores each installment as a separate Payment row.
 *
 * @param payload  Frontend form data (camelCase) — mapped to the
 *                 backend's snake_case contract via mapCreatePaymentPayload,
 *                 same pattern as createQS()/createVoucher().
 */
export async function createPayment(payload: {
  voucherId:         string
  installmentNumber: number
  paymentDate?:      string | null
  dueDate:           string
  paidAmount:        number
  remainingAmount:   number
  paymentStatus:     'UNPAID' | 'INSTALLMENT' | 'PAID'
  remarks:           string
  paymentProof?:     string
}): Promise<PaymentDocument> {
  const envelope = await post<BackendPaymentMutationEnvelope>(BASE, mapCreatePaymentPayload(payload))
  return mapPaymentDetail(envelope.data)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /payments/:id  (NOT PUT)
 * Updates one or more fields on an existing payment record.
 * Used for: recording payment receipt (update paid_amount, remaining_amount, payment_status)
 *           updating due date, remarks, etc.
 *
 * @param payload  Frontend camelCase fields — mapped to the backend's
 *                 snake_case contract via mapUpdatePaymentPayload, same
 *                 pattern as createPayment(). This is also where
 *                 paymentDate/dueDate get converted to full ISO-8601 via
 *                 dateInputToISO — callers must NOT build the raw
 *                 backend payload (with payment_date as bare YYYY-MM-DD)
 *                 themselves.
 */
export async function updatePayment(
  id: string,
  payload: {
    paidAmount?:      number
    remainingAmount?: number
    paymentStatus?:   PaymentListItem['paymentStatus']
    paymentDate?:     string | null
    dueDate?:         string
    remarks?:         string
  }
): Promise<PaymentDocument> {
  const envelope = await patch<BackendPaymentMutationEnvelope>(`${BASE}/${id}`, mapUpdatePaymentPayload(payload))
  return mapPaymentDetail(envelope.data)
}

// ─── Delete ───────────────────────────────────────────────────────
/**
 * DELETE /payments/:id
 * Hard-deletes the payment record (permanent, no soft-delete on Payment model).
 */
export async function deletePayment(id: string): Promise<void> {
  await del<{ success: boolean; status_code: number }>(`${BASE}/${id}`)
}

// ─── Convenience: record a payment receipt ─────────────────────────
/**
 * Record that a payment has been received.
 * Maps to PATCH /payments/:id with updated amounts and status.
 */
export async function recordPaymentReceipt(
  id: string,
  paidAmount:      number,
  remainingAmount: number,
  paymentDate:     string,
  remarks?:        string
): Promise<PaymentDocument> {
  const status = remainingAmount <= 0 ? 'PAID' : 'INSTALLMENT'
  return updatePayment(id, {
    paidAmount,
    remainingAmount,
    paymentDate,
    paymentStatus: status,
    ...(remarks ? { remarks } : {}),
  })
}