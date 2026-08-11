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

/**
 * Incoming Payment (AR) API layer, per the latest Finance API
 * Specification (Source of Truth) — Payment now originates from
 * Invoice, not Voucher (Phase 7).
 *
 * Path aligned to the spec's documented endpoint (/finance/ar/payments),
 * unlike Voucher/Invoice (Phase 5/6) which kept their legacy paths —
 * because this module's entire payload contract changed here (origin,
 * envelope, every field), not just the origin field, so there's no
 * partial legacy contract left worth preserving path-compatibility
 * with. See Phase 7 report for the full reasoning.
 */
const BASE = '/finance/ar/payments'

// ─── List ─────────────────────────────────────────────────────────
/** GET /finance/ar/payments */
export async function fetchPaymentList(
  filters: PaymentFilters & { page?: number } = {}
): Promise<PaginatedResponse<PaymentListItem>> {
  const params   = mapPaymentQueryParams(filters)
  const envelope = await get<BackendPaymentListEnvelope>(BASE, { params })
  const items    = envelope.data.map(mapPaymentListItem)
  return mapPaymentListPagination(items, envelope.pagination)
}

// ─── Detail ───────────────────────────────────────────────────────
/** GET /finance/ar/payments/:id */
export async function fetchPaymentDetail(id: string): Promise<PaymentDocument> {
  const envelope = await get<BackendPaymentDetailEnvelope>(`${BASE}/${id}`)
  return mapPaymentDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /finance/ar/payments
 * Creates a new payment record against an invoice. Each call is one
 * payment entry (full or partial) — the backend computes the
 * resulting remaining balance and status (UNPAID → PARTIAL → PAID)
 * from Total Invoice - Total Payment, per the latest spec. There is
 * no client-supplied installment number, due date, or remaining
 * amount on create.
 */
export async function createPayment(payload: {
  invoiceId:        string
  paidDate:         string
  paidAmount:       number
  paymentMethod:    string
  bankAccount?:     string
  referenceNumber?: string
  notes?:           string
}): Promise<PaymentDocument> {
  const envelope = await post<BackendPaymentMutationEnvelope>(
    BASE,
    mapCreatePaymentPayload(payload)
  )
  // Create response per spec only returns { status, remainingBalance },
  // not the full record — refetch detail for the complete document.
  return fetchPaymentDetail(envelope.data.id)
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PATCH /finance/ar/payments/:id
 * NOTE: not explicitly documented in the latest Finance API
 * Specification (only Create/List/Detail/Export Receipt are listed
 * for Incoming Payment). Kept as a defensive capability, consistent
 * with the existing architecture, but flagged as unconfirmed.
 */
export async function updatePayment(
  id: string,
  payload: {
    paidAmount?:      number
    paidDate?:        string
    paymentMethod?:   string
    bankAccount?:     string
    referenceNumber?: string
    notes?:           string
  }
): Promise<PaymentDocument> {
  const envelope = await patch<BackendPaymentMutationEnvelope>(`${BASE}/${id}`, mapUpdatePaymentPayload(payload))
  return fetchPaymentDetail(envelope.data.id)
}

// ─── Delete ───────────────────────────────────────────────────────
/**
 * DELETE /finance/ar/payments/:id
 * NOTE: not explicitly documented in the latest spec either — kept
 * for the same reason as updatePayment above.
 */
export async function deletePayment(id: string): Promise<void> {
  await del<{ success: boolean }>(`${BASE}/${id}`)
}

// ─── Export Receipt ───────────────────────────────────────────────
/** GET /finance/ar/payments/:id/receipt */
export function fetchPaymentReceiptUrl(id: string): string {
  return `${BASE}/${id}/receipt`
}