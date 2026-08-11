import { get, post, put, del } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
  PolicyDocument,
  PolicyListItem,
  CreatePolicyPayload,
  UpdatePolicyPayload,
  AddParticipantPayload,
  UpdateParticipantPayload,
  ValidatePlacementResult,
  PolicyHistoryEvent,
  PolicyFilters,
} from '@/types/policy'
import type {
  BackendPolicyListEnvelope,
  BackendPolicyDetailEnvelope,
  BackendPolicyMutationEnvelope,
  BackendPolicyValidateEnvelope,
  BackendPolicyHistoryEnvelope,
} from '@/types/backend/policy'
import {
  mapPolicyListItem,
  mapPolicyDetail,
  mapPolicyHistoryEvent,
  mapValidatePlacementResult,
  mapCreatePolicyPayload,
  mapUpdatePolicyPayload,
  mapAddParticipantPayload,
  mapUpdateParticipantPayload,
  mapPolicyQueryParams,
  mapPolicyListPagination,
} from '@/lib/adapters/policy'

const BASE = '/api/v1/policies'

// ─── List ─────────────────────────────────────────────────────────
/** GET /api/v1/policies — Permission: policy.read */
export async function fetchPolicyList(
  filters: PolicyFilters & { page?: number } = {}
): Promise<PaginatedResponse<PolicyListItem>> {
  const params    = mapPolicyQueryParams(filters)
  const envelope  = await get<BackendPolicyListEnvelope>(BASE, { params })
  const items     = envelope.data.map(mapPolicyListItem)
  return mapPolicyListPagination(items, envelope.pagination)
}

// ─── Detail ───────────────────────────────────────────────────────
/** GET /api/v1/policies/:id — Permission: policy.read */
export async function fetchPolicyDetail(id: string): Promise<PolicyDocument> {
  const envelope = await get<BackendPolicyDetailEnvelope>(`${BASE}/${id}`)
  return mapPolicyDetail(envelope.data)
}

// ─── Create ───────────────────────────────────────────────────────
/**
 * POST /api/v1/policies — Permission: policy.create
 * Business rules: quotation must be Approved; quotation must not
 * already have a policy; policy number must be unique.
 */
export async function createPolicy(payload: CreatePolicyPayload): Promise<{ id: string }> {
  const envelope = await post<BackendPolicyMutationEnvelope>(BASE, mapCreatePolicyPayload(payload))
  return { id: envelope.data.id }
}

// ─── Update ───────────────────────────────────────────────────────
/**
 * PUT /api/v1/policies/:id — Permission: policy.update
 * Business rule: only allowed before status READY_FOR_RFI.
 */
export async function updatePolicy(id: string, payload: UpdatePolicyPayload): Promise<void> {
  await put<BackendPolicyMutationEnvelope>(`${BASE}/${id}`, mapUpdatePolicyPayload(payload))
}

// ─── Leader ───────────────────────────────────────────────────────
/**
 * POST /api/v1/policies/:id/leader — Permission: placement.manage
 * Business rule: only one leader per policy.
 */
export async function addLeader(id: string, payload: AddParticipantPayload): Promise<void> {
  await post<BackendPolicyMutationEnvelope>(`${BASE}/${id}/leader`, mapAddParticipantPayload(payload))
}

// ─── Members ──────────────────────────────────────────────────────
/** POST /api/v1/policies/:id/members — Permission: placement.manage */
export async function addMember(id: string, payload: AddParticipantPayload): Promise<void> {
  await post<BackendPolicyMutationEnvelope>(`${BASE}/${id}/members`, mapAddParticipantPayload(payload))
}

/** PUT /api/v1/policies/:id/members/:memberId — Permission: placement.manage */
export async function updateMember(
  id: string,
  memberId: string,
  payload: UpdateParticipantPayload
): Promise<void> {
  await put<BackendPolicyMutationEnvelope>(
    `${BASE}/${id}/members/${memberId}`,
    mapUpdateParticipantPayload(payload)
  )
}

/**
 * DELETE /api/v1/policies/:id/members/:memberId — Permission: placement.manage
 * Business rule: the Leader cannot be deleted via this endpoint.
 */
export async function deleteMember(id: string, memberId: string): Promise<void> {
  await del<{ success: boolean }>(`${BASE}/${id}/members/${memberId}`)
}

// ─── Validate Placement ─────────────────────────────────────────
/**
 * POST /api/v1/policies/:id/validate
 * Checks: leader required, minimum 1 company, total share = 100%.
 */
export async function validatePlacement(id: string): Promise<ValidatePlacementResult> {
  const envelope = await post<BackendPolicyValidateEnvelope>(`${BASE}/${id}/validate`)
  return mapValidatePlacementResult(envelope)
}

// ─── Complete Placement ──────────────────────────────────────────
/**
 * POST /api/v1/policies/:id/complete — Permission: policy.complete
 * Backend re-validates policy number/date/leader/share=100% before
 * transitioning status to PLACEMENT_COMPLETED.
 *
 * NOTE: Per the latest Policy API Specification's own closing
 * recommendation, the Policy module stops at PLACEMENT_COMPLETED.
 * The former `/ready-rfi` endpoint is intentionally NOT implemented
 * here — the next stage (Request For Invoice) is a separate module
 * that starts from a completed placement, not a Policy-module action.
 */
export async function completePlacement(id: string): Promise<void> {
  await post<BackendPolicyMutationEnvelope>(`${BASE}/${id}/complete`)
}

// ─── History ──────────────────────────────────────────────────────
/** GET /api/v1/policies/:id/history */
export async function fetchPolicyHistory(id: string): Promise<PolicyHistoryEvent[]> {
  const envelope = await get<BackendPolicyHistoryEnvelope>(`${BASE}/${id}/history`)
  return envelope.data.map(mapPolicyHistoryEvent)
}