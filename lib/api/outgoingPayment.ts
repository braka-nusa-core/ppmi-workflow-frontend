import { get, post } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
  OutgoingPaymentListItem,
  OutgoingPaymentDocument,
  OutgoingPaymentFilters,
  CreateOutgoingPaymentPayload,
  InsurerObligation,
} from '@/types/outgoingPayment'
import type {
  BackendOutgoingPaymentListEnvelope,
  BackendOutgoingPaymentDetailEnvelope,
  BackendOutgoingPaymentMutationEnvelope,
} from '@/types/backend/outgoingPayment'
import {
  mapOutgoingPaymentListItem,
  mapOutgoingPaymentDetail,
  mapOutgoingPaymentQueryParams,
  mapOutgoingPaymentListPagination,
  mapCreateOutgoingPaymentPayload,
  computeInsurerObligations,
} from '@/lib/adapters/outgoingPayment'
import { fetchPolicyDetail } from '@/lib/api/policy'
import { fetchInvoiceDetail } from '@/lib/api/invoice'

/**
 * Outgoing Payment (AP) API layer, per the latest Finance API
 * Specification, Module 4. Origin: Invoice + Insurance Company (not
 * Incoming Payment — see Phase 8 report).
 */
const BASE = '/finance/ap/payments'

// ─── List ─────────────────────────────────────────────────────────
/** GET /finance/ap/payments */
export async function fetchOutgoingPaymentList(
  filters: OutgoingPaymentFilters & { page?: number } = {}
): Promise<PaginatedResponse<OutgoingPaymentListItem>> {
  const params   = mapOutgoingPaymentQueryParams(filters)
  const envelope = await get<BackendOutgoingPaymentListEnvelope>(BASE, { params })
  const items    = envelope.data.map(mapOutgoingPaymentListItem)
  return mapOutgoingPaymentListPagination(items, envelope.pagination)
}

// ─── Detail ───────────────────────────────────────────────────────
/** GET /finance/ap/payments/:id */
export async function fetchOutgoingPaymentDetail(id: string): Promise<OutgoingPaymentDocument> {
  const envelope = await get<BackendOutgoingPaymentDetailEnvelope>(`${BASE}/${id}`)
  return mapOutgoingPaymentDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /finance/ap/payments
 * Business rule (enforced server-side, per spec): amount must not
 * exceed the insurer's share of the invoice total. The frontend
 * pre-computes and displays this ceiling (see fetchInsurerObligations
 * below) as UX guidance, but the server remains authoritative.
 */
export async function createOutgoingPayment(
  payload: CreateOutgoingPaymentPayload
): Promise<{ id: string }> {
  const envelope = await post<BackendOutgoingPaymentMutationEnvelope>(
    BASE,
    mapCreateOutgoingPaymentPayload(payload)
  )
  return { id: envelope.data.id }
}

// ─── Insurer obligations (per-invoice, computed) ──────────────────
/**
 * Fetches the Policy Placement linked to an invoice's policy, and the
 * invoice itself, then computes each insurer's payment obligation
 * (ceiling = invoice total x share%) minus any existing AP rows
 * against that invoice. Requires the invoice's Voucher Invoice chain
 * to expose a resolvable policyId — see Phase 8 report, Unexpected
 * Findings, for the current limitation here.
 */
export async function fetchInsurerObligations(
  invoiceId: string,
  policyId: string
): Promise<InsurerObligation[]> {
  const [invoice, policy, existing] = await Promise.all([
    fetchInvoiceDetail(invoiceId),
    fetchPolicyDetail(policyId),
    fetchOutgoingPaymentList({ invoiceId }),
  ])
  return computeInsurerObligations(policy.participants, invoice.totalAmount, existing.data)
}

// ─── Export Receipt ───────────────────────────────────────────────
/** GET /finance/ap/payments/:id/receipt */
export function fetchOutgoingPaymentReceiptUrl(id: string): string {
  return `${BASE}/${id}/receipt`
}