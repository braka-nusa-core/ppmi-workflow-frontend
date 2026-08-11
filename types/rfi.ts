/**
 * Frontend Request For Invoice (RFI) types.
 * Mirrors the latest RFI API Specification.
 */

import type { PolicyParticipant } from './policy'

// ─── Status ────────────────────────────────────────────────────────
export type RfiStatus = 'DRAFT' | 'WAITING_FINANCE' | 'PROCESSED' | 'CANCELLED'

// ─── Checklist item (dynamic shape — forward-compatible with a
// future per-Insurance-Type template even though today's backend
// returns a fixed set of fields; see types/backend/rfi.ts) ────────
export interface RfiChecklistItem {
  key:         string
  label:       string
  isRequired:  boolean
  isCompleted: boolean
}

// ─── Attachment ────────────────────────────────────────────────────
export interface RfiAttachment {
  id:         string
  fileName:   string
  fileUrl:    string
  uploadedBy: string
  uploadedAt: string
}

// ─── List item (table row) ────────────────────────────────────────
export interface RfiListItem {
  id:               string
  policyId:         string
  policyNumber?:    string
  quotationNumber?: string
  insured?:         string
  status:           RfiStatus
  requestedBy:      string
  submittedAt?:     string
  createdAt:        string
  updatedAt:        string
}

// ─── Full document ────────────────────────────────────────────────
export interface RfiDocument extends RfiListItem {
  leader:      PolicyParticipant | null
  members:     PolicyParticipant[]
  totalShare:  number
  checklist:   RfiChecklistItem[]
  attachments: RfiAttachment[]
}

// ─── Create / update payloads ─────────────────────────────────────
export interface CreateRfiPayload {
  policyId: string
}

export type UpdateRfiPayload = Partial<CreateRfiPayload>

// ─── Checklist update payload — keyed by item.key ─────────────────
export type UpdateChecklistPayload = Record<string, boolean>

// ─── History ───────────────────────────────────────────────────────
export interface RfiHistoryEvent {
  id:           string
  action:       string
  description?: string
  performedBy:  string
  createdAt:    string
}

// ─── Filters ───────────────────────────────────────────────────────
export interface RfiFilters {
  search?:        string
  status?:        RfiStatus
  insuranceType?: string
}