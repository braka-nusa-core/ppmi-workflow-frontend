/**
 * Frontend Policy Placement types.
 * Mirrors the latest Policy API Specification.
 */

// ─── Status ────────────────────────────────────────────────────────
export type PolicyStatus =
  | 'WAITING_POLICY'
  | 'POLICY_CREATED'
  | 'PLACEMENT_IN_PROGRESS'
  | 'PLACEMENT_COMPLETED'
  | 'READY_FOR_RFI'

// ─── Participant (Leader / Member) ──────────────────────────────────
export type ParticipantRole = 'leader' | 'member'

export interface PolicyParticipant {
  id:                    string
  insuranceCompanyId:    string
  insuranceCompanyName?: string
  role:                  ParticipantRole
  sharePercentage:       number
}

// ─── List item (table row) ────────────────────────────────────────
export interface PolicyListItem {
  id:               string
  quotationId:      string
  quotationNumber?: string
  policyNumber:     string
  policyDate:       string
  insured?:         string
  status:           PolicyStatus
  totalShare?:      number
  createdAt:        string
  updatedAt:        string
}

// ─── Full document ────────────────────────────────────────────────
export interface PolicyDocument extends PolicyListItem {
  leader:      PolicyParticipant | null
  members:     PolicyParticipant[]
  // Convenience — leader + members combined, in display order.
  participants: PolicyParticipant[]
}

// ─── Create / update payloads ─────────────────────────────────────
export interface CreatePolicyPayload {
  quotationId:  string
  policyNumber: string
  policyDate:   string
}

export type UpdatePolicyPayload = Partial<CreatePolicyPayload>

export interface AddParticipantPayload {
  insuranceCompanyId: string
  sharePercentage:    number
}

export interface UpdateParticipantPayload {
  sharePercentage: number
}

// ─── Validation result ────────────────────────────────────────────
export interface ValidatePlacementResult {
  valid:      boolean
  totalShare: number
  message?:   string
}

// ─── History ───────────────────────────────────────────────────────
export interface PolicyHistoryEvent {
  id:           string
  action:       string
  description?: string
  performedBy:  string
  createdAt:    string
}

// ─── Filters ───────────────────────────────────────────────────────
export interface PolicyFilters {
  search?:        string
  status?:        PolicyStatus
  insuranceType?: string
}