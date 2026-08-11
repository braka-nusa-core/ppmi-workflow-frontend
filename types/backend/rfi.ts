/**
 * Raw backend Request For Invoice (RFI) types.
 *
 * Modeled directly from the latest RFI API Specification (Source of
 * Truth), following the same camelCase / { success, data, pagination }
 * envelope convention established in types/backend/policy.ts (Phase 3).
 *
 * Used ONLY in lib/adapters/rfi.ts — never imported by components.
 */

import type { BackendPolicyParticipant } from './policy'

// ─── Status ────────────────────────────────────────────────────────
export type BackendRfiStatus = 'DRAFT' | 'WAITING_FINANCE' | 'PROCESSED' | 'CANCELLED'

// ─── Checklist ─────────────────────────────────────────────────────
/**
 * Matches the literal example response in the RFI API Specification
 * (section 5.5/5.6). The spec's own closing recommendation proposes
 * moving this to a dynamic rfi_checklist_items table later — the
 * adapter (lib/adapters/rfi.ts) converts this fixed shape into a
 * dynamic array on the frontend side so the UI is forward-compatible
 * with that change without a later type rewrite (per Migration
 * Blueprint §6.3), even though the backend shape today is fixed.
 */
export interface BackendRfiChecklist {
  policyInsurance:     boolean
  signedQuotation:     boolean
  signedRenewal:       boolean
  cnDn:                boolean
  attachmentChecklist: boolean
}

// ─── Attachment ────────────────────────────────────────────────────
export interface BackendRfiAttachment {
  id:         string
  fileName:   string
  fileUrl:    string
  uploadedBy: string
  uploadedAt: string
}

// ─── List item ─────────────────────────────────────────────────────
export interface BackendRfiListItem {
  id:               string
  policyId:         string
  policyNumber?:    string
  quotationNumber?: string
  insured?:         string
  status:           BackendRfiStatus
  requestedBy:      string
  submittedAt?:     string
  approvedAt?:      string
  createdAt:        string
  updatedAt:        string
}

// ─── Detail (Return: Policy, Quotation, Leader, Member, Share,
// Checklist, Attachment, History per API spec 5.3 — history is
// fetched separately via 5.13) ──────────────────────────────────
export interface BackendRfiDetail extends BackendRfiListItem {
  leader:      BackendPolicyParticipant | null
  members:     BackendPolicyParticipant[]
  totalShare?: number
  checklist:   BackendRfiChecklist
  attachments: BackendRfiAttachment[]
}

// ─── History ───────────────────────────────────────────────────────
export interface BackendRfiHistoryEntry {
  id:           string
  action:       string
  description?: string
  performedBy:  string
  createdAt:    string
}

// ─── Envelopes ─────────────────────────────────────────────────────
export interface BackendRfiListEnvelope {
  success:    boolean
  data:       BackendRfiListItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface BackendRfiDetailEnvelope {
  success:  boolean
  message?: string
  data:     BackendRfiDetail
}

export interface BackendRfiMutationEnvelope {
  success:  boolean
  message?: string
  data:     { id: string; status: BackendRfiStatus }
}

export interface BackendRfiChecklistEnvelope {
  success: boolean
  data:    BackendRfiChecklist
}

export interface BackendRfiAttachmentListEnvelope {
  success: boolean
  data:    BackendRfiAttachment[]
}

export interface BackendRfiAttachmentEnvelope {
  success: boolean
  data:    BackendRfiAttachment
}

export interface BackendRfiHistoryEnvelope {
  success: boolean
  data:    BackendRfiHistoryEntry[]
}

// ─── Create / update payloads ──────────────────────────────────────
export interface BackendCreateRfiPayload {
  policyId: string
}

export type BackendUpdateRfiPayload = Partial<BackendCreateRfiPayload>

export type BackendUpdateChecklistPayload = BackendRfiChecklist

// ─── Query params ──────────────────────────────────────────────────
export interface BackendRfiQueryParams {
  page?:          string
  status?:        string
  insuranceType?: string
  search?:        string
}