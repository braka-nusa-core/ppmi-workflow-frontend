/**
 * Raw backend Policy Placement types.
 *
 * Modeled directly from the latest Policy API Specification (Source of
 * Truth per project ruling), NOT from any prior/legacy backend contract.
 * Envelope and field casing follow the General API Specification
 * (camelCase, { success, message, data } / { success, data, pagination }),
 * consistent with how the Policy/RFI/Finance API docs are written.
 *
 * Used ONLY in lib/adapters/policy.ts — never imported by components.
 */

// ─── Status ────────────────────────────────────────────────────────
export type BackendPolicyStatus =
  | 'WAITING_POLICY'
  | 'POLICY_CREATED'
  | 'PLACEMENT_IN_PROGRESS'
  | 'PLACEMENT_COMPLETED'
  | 'READY_FOR_RFI'

// ─── Leader / Member (participant) ──────────────────────────────────
export interface BackendPolicyParticipant {
  id:                    string
  insuranceCompanyId:    string
  insuranceCompanyName?: string
  sharePercentage:       number
}

// ─── List item ───────────────────────────────────────────────────────
export interface BackendPolicyListItem {
  id:                 string
  quotationId:        string
  quotationNumber?:   string
  policyNumber:       string
  policyDate:         string
  insuranceTypeId?:   string
  insuranceTypeName?: string
  insured?:           string
  status:             BackendPolicyStatus
  totalShare?:        number
  createdBy:          string
  createdAt:          string
  updatedAt:          string
}

// ─── Detail (Policy Detail returns Quotation/Policy/Placement/
// Leader/Member/Share/History per API spec 5.3 — history is fetched
// separately via 5.12, the rest is embedded here) ─────────────────
export interface BackendPolicyDetail extends BackendPolicyListItem {
  leader:  BackendPolicyParticipant | null
  members: BackendPolicyParticipant[]
}

// ─── History ─────────────────────────────────────────────────────
export interface BackendPolicyHistoryEntry {
  id:          string
  action:      string
  description?: string
  performedBy: string
  createdAt:   string
}

// ─── Envelopes ───────────────────────────────────────────────────
export interface BackendPolicyListEnvelope {
  success:    boolean
  data:       BackendPolicyListItem[]
  pagination: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

export interface BackendPolicyDetailEnvelope {
  success: boolean
  message?: string
  data:    BackendPolicyDetail
}

export interface BackendPolicyMutationEnvelope {
  success: boolean
  message?: string
  data:    { id: string; status: BackendPolicyStatus }
}

export interface BackendPolicyValidateEnvelope {
  success: boolean
  data:    { valid: boolean; totalShare: number; message?: string }
}

export interface BackendPolicyHistoryEnvelope {
  success: boolean
  data:    BackendPolicyHistoryEntry[]
}

// ─── Create/update payloads ───────────────────────────────────────
export interface BackendCreatePolicyPayload {
  quotationId:  string
  policyNumber: string
  policyDate:   string
}

export type BackendUpdatePolicyPayload = Partial<BackendCreatePolicyPayload>

export interface BackendAddParticipantPayload {
  insuranceCompanyId: string
  sharePercentage:    number
}

export interface BackendUpdateParticipantPayload {
  sharePercentage: number
}

// ─── Query params ──────────────────────────────────────────────────
export interface BackendPolicyQueryParams {
  page?:          string
  status?:        string
  insuranceType?: string
  search?:        string
}