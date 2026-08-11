/**
 * Policy Placement adapters — map raw backend Policy records to frontend
 * PolicyListItem/PolicyDocument shapes, and map frontend create/update
 * payloads to backend payload shapes.
 *
 * Same pattern as lib/adapters/qs.ts / voucher.ts / payment.ts / shipment.ts.
 */

import type {
  PolicyListItem,
  PolicyDocument,
  PolicyParticipant,
  CreatePolicyPayload,
  UpdatePolicyPayload,
  AddParticipantPayload,
  UpdateParticipantPayload,
  ValidatePlacementResult,
  PolicyHistoryEvent,
  PolicyFilters,
} from '@/types/policy'
import type {
  BackendPolicyListItem,
  BackendPolicyDetail,
  BackendPolicyParticipant,
  BackendCreatePolicyPayload,
  BackendUpdatePolicyPayload,
  BackendAddParticipantPayload,
  BackendUpdateParticipantPayload,
  BackendPolicyQueryParams,
  BackendPolicyValidateEnvelope,
  BackendPolicyHistoryEntry,
} from '@/types/backend/policy'

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapPolicyListItem(item: BackendPolicyListItem): PolicyListItem {
  return {
    id:              item.id,
    quotationId:     item.quotationId,
    quotationNumber: item.quotationNumber,
    policyNumber:    item.policyNumber,
    policyDate:      item.policyDate,
    insured:         item.insured,
    status:          item.status,
    totalShare:      item.totalShare,
    createdAt:       item.createdAt,
    updatedAt:       item.updatedAt,
  }
}

export function mapParticipant(
  p: BackendPolicyParticipant,
  role: 'leader' | 'member'
): PolicyParticipant {
  return {
    id:                    p.id,
    insuranceCompanyId:    p.insuranceCompanyId,
    insuranceCompanyName:  p.insuranceCompanyName,
    role,
    sharePercentage:       p.sharePercentage,
  }
}

export function mapPolicyDetail(item: BackendPolicyDetail): PolicyDocument {
  const leader  = item.leader ? mapParticipant(item.leader, 'leader') : null
  const members = (item.members ?? []).map((m) => mapParticipant(m, 'member'))
  const participants = [...(leader ? [leader] : []), ...members]

  // totalShare isn't guaranteed on the detail response per the API spec
  // (only the /validate endpoint explicitly returns it) — compute it
  // client-side from participants as a display fallback.
  const computedTotalShare = participants.reduce((sum, p) => sum + p.sharePercentage, 0)

  return {
    ...mapPolicyListItem(item),
    totalShare: item.totalShare ?? computedTotalShare,
    leader,
    members,
    participants,
  }
}

export function mapPolicyHistoryEvent(entry: BackendPolicyHistoryEntry): PolicyHistoryEvent {
  return {
    id:          entry.id,
    action:      entry.action,
    description: entry.description,
    performedBy: entry.performedBy,
    createdAt:   entry.createdAt,
  }
}

export function mapValidatePlacementResult(
  envelope: BackendPolicyValidateEnvelope
): ValidatePlacementResult {
  return {
    valid:      envelope.data.valid,
    totalShare: envelope.data.totalShare,
    message:    envelope.data.message,
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

export function mapCreatePolicyPayload(payload: CreatePolicyPayload): BackendCreatePolicyPayload {
  return {
    quotationId:  payload.quotationId,
    policyNumber: payload.policyNumber,
    policyDate:   payload.policyDate,
  }
}

export function mapUpdatePolicyPayload(payload: UpdatePolicyPayload): BackendUpdatePolicyPayload {
  const result: BackendUpdatePolicyPayload = {}
  if (payload.quotationId)  result.quotationId  = payload.quotationId
  if (payload.policyNumber) result.policyNumber = payload.policyNumber
  if (payload.policyDate)   result.policyDate   = payload.policyDate
  return result
}

export function mapAddParticipantPayload(
  payload: AddParticipantPayload
): BackendAddParticipantPayload {
  return {
    insuranceCompanyId: payload.insuranceCompanyId,
    sharePercentage:    payload.sharePercentage,
  }
}

export function mapUpdateParticipantPayload(
  payload: UpdateParticipantPayload
): BackendUpdateParticipantPayload {
  return {
    sharePercentage: payload.sharePercentage,
  }
}

export function mapPolicyQueryParams(
  filters: PolicyFilters & { page?: number }
): BackendPolicyQueryParams {
  const params: BackendPolicyQueryParams = {}
  if (filters.search)        params.search        = filters.search
  if (filters.status)        params.status        = filters.status
  if (filters.insuranceType) params.insuranceType = filters.insuranceType
  if (filters.page)          params.page          = String(filters.page)
  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapPolicyListPagination(
  items: PolicyListItem[],
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