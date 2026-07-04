import { get, post, patch, del } from '@/lib/api/client'
import type { PaginatedResponse }    from '@/types/api'
import type { PaymentListItem, PaymentDocument, PaymentFilters } from '@/types/payment'
import type {
  BackendPaymentListEnvelope,
  BackendPaymentDetailEnvelope,
  BackendPaymentMutationEnvelope,
  BackendCreatePaymentPayload,
  BackendUpdatePaymentPayload,
} from '@/types/backend/payment'
import {
  mapPaymentListItem,
  mapPaymentDetail,
  mapPaymentQueryParams,
  mapPaymentListPagination,
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
 */
export async function createPayment(payload: BackendCreatePaymentPayload): Promise<PaymentDocument> {
  const envelope = await post<BackendPaymentMutationEnvelope>(BASE, payload)
  return mapPaymentDetail(envelope.data)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /payments/:id  (NOT PUT)
 * Updates one or more fields on an existing payment record.
 * Used for: recording payment receipt (update paid_amount, remaining_amount, payment_status)
 *           updating due date, remarks, etc.
 */
export async function updatePayment(
  id: string,
  payload: BackendUpdatePaymentPayload
): Promise<PaymentDocument> {
  const envelope = await patch<BackendPaymentMutationEnvelope>(`${BASE}/${id}`, payload)
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
    paid_amount:      paidAmount,
    remaining_amount: remainingAmount,
    payment_date:     paymentDate,
    payment_status:   status,
    ...(remarks ? { remarks } : {}),
  })
}