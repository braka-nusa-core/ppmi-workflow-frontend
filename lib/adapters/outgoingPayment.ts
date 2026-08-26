/**
 * Outgoing Payment adapters — map raw backend AP records to frontend
 * shapes, and map frontend create payloads to backend payload shapes.
 *
 * Same pattern as lib/adapters/policy.ts / rfi.ts / payment.ts.
 *
 * Also assembles per-insurer obligation data (ceiling = invoice total
 * x share%) from Policy Placement's leader/member records, since the
 * Outgoing Payment API itself doesn't return this — it's derived by
 * combining this module's own data with Policy's, per the Migration
 * Blueprint's explicit guidance (§6.7) that this cross-reference is
 * necessary and expected, not a scope violation.
 */

import type {
  OutgoingPaymentListItem,
  OutgoingPaymentDocument,
  InsurerObligation,
  CreateOutgoingPaymentPayload,
  OutgoingPaymentFilters,
} from '@/types/outgoingPayment'
import type {
  BackendOutgoingPaymentItem,
  BackendCreateOutgoingPaymentPayload,
  BackendOutgoingPaymentQueryParams,
} from '@/types/backend/outgoingPayment'
import type { PolicyParticipant } from '@/types/policy'

function toISO(v: string | Date | null | undefined): string {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString()
  return v
}

function dateInputToISO(dateStr: string | undefined | null): string | undefined {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr
  return `${dateStr}T00:00:00.000Z`
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapOutgoingPaymentListItem(item: BackendOutgoingPaymentItem): OutgoingPaymentListItem {
  return {
    id:                   item.id,
    docNumber:            item.id,
    invoiceId:            item.invoiceId,
    invoiceNumber:        item.invoice?.invoiceNumber ?? item.invoiceId,
    insuredName:          item.invoice?.insured ?? '—',
    insuranceCompanyId:   item.insuranceCompanyId,
    insuranceCompanyName: item.insuranceCompany?.name ?? item.insuranceCompanyId,
    paymentDate:          toISO(item.paymentDate),
    amount:               item.amount,
    bankReference:        item.bankReference,
    status:               item.status,
    createdAt:            toISO(item.createdAt),
  }
}

export function mapOutgoingPaymentDetail(item: BackendOutgoingPaymentItem): OutgoingPaymentDocument {
  return {
    ...mapOutgoingPaymentListItem(item),
    createdBy: item.createdBy,
    updatedAt: toISO(item.updatedAt),
  }
}

/**
 * Compute each insurer's payment obligation for an invoice from
 * Policy Placement's participants (leader + members) and the
 * invoice's total amount, then subtract any existing AP rows against
 * that insurer to get the remaining balance.
 *
 * ceiling = invoice.totalAmount * sharePercentage / 100 — matches the
 * spec's business rule exactly ("Jumlah pembayaran tidak boleh
 * melebihi nilai share masing-masing perusahaan asuransi").
 */
export function computeInsurerObligations(
  participants: PolicyParticipant[],
  invoiceTotalAmount: number,
  existingPayments: OutgoingPaymentListItem[]
): InsurerObligation[] {
  return participants.map((p) => {
    const obligationAmount = Math.round((invoiceTotalAmount * p.sharePercentage) / 100)
    const paidAmount = existingPayments
      .filter((pay) => pay.insuranceCompanyId === p.insuranceCompanyId)
      .reduce((sum, pay) => sum + pay.amount, 0)
    const remainingAmount = Math.max(0, obligationAmount - paidAmount)

    let status: InsurerObligation['status'] = 'WAITING_PAYMENT'
    if (remainingAmount <= 0 && paidAmount > 0) status = 'FULLY_PAID'
    else if (paidAmount > 0) status = 'PARTIAL_PAYMENT'

    return {
      insuranceCompanyId:   p.insuranceCompanyId,
      insuranceCompanyName: p.insuranceCompanyName ?? p.insuranceCompanyId,
      role:                 p.role,
      sharePercentage:      p.sharePercentage,
      obligationAmount,
      paidAmount,
      remainingAmount,
      status,
    }
  })
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

export function mapCreateOutgoingPaymentPayload(
  payload: CreateOutgoingPaymentPayload
): BackendCreateOutgoingPaymentPayload {
  return {
    invoiceId:          payload.invoiceId,
    insuranceCompanyId: payload.insuranceCompanyId,
    paymentDate:        dateInputToISO(payload.paymentDate) ?? payload.paymentDate,
    amount:             Math.round(payload.amount),
    bankReference:      payload.bankReference,
  }
}

export function mapOutgoingPaymentQueryParams(
  filters: OutgoingPaymentFilters & { page?: number }
): BackendOutgoingPaymentQueryParams {
  const params: BackendOutgoingPaymentQueryParams = {}
  if (filters.search)             params.search             = filters.search
  if (filters.status)             params.status             = filters.status
  if (filters.invoiceId)          params.invoiceId          = filters.invoiceId
  if (filters.insuranceCompanyId) params.insuranceCompanyId = filters.insuranceCompanyId
  if (filters.page)               params.page               = String(filters.page)
  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapOutgoingPaymentListPagination(
  items: OutgoingPaymentListItem[],
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
