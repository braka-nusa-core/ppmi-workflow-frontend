/**
 * RFI adapters — map raw backend RFI records to frontend RfiListItem/
 * RfiDocument shapes, and map frontend create/update payloads to
 * backend payload shapes.
 *
 * Same pattern as lib/adapters/policy.ts (Phase 3).
 */

import type {
  RfiListItem,
  RfiDocument,
  RfiChecklistItem,
  RfiAttachment,
  CreateRfiPayload,
  UpdateRfiPayload,
  UpdateChecklistPayload,
  RfiHistoryEvent,
  RfiFilters,
} from '@/types/rfi'
import type {
  BackendRfiListItem,
  BackendRfiDetail,
  BackendRfiChecklist,
  BackendRfiAttachment,
  BackendCreateRfiPayload,
  BackendUpdateRfiPayload,
  BackendUpdateChecklistPayload,
  BackendRfiQueryParams,
  BackendRfiHistoryEntry,
} from '@/types/backend/rfi'
import { mapParticipant } from '@/lib/adapters/policy'

// ─── Checklist definition (label + required flag per the RFI API
// Specification's §6 "Checklist Default" table). Keys match the
// backend's fixed BackendRfiChecklist fields today; modeling this as
// a lookup here — rather than scattering field names through the UI
// — is what lets the frontend absorb a future dynamic/template-driven
// checklist without a component rewrite, only an adapter change. ────
const CHECKLIST_DEFS: { key: keyof BackendRfiChecklist; label: string; isRequired: boolean }[] = [
  { key: 'policyInsurance',     label: 'Policy Insurance',        isRequired: true  },
  { key: 'signedQuotation',     label: 'Signed Quotation Slip',   isRequired: true  },
  { key: 'signedRenewal',       label: 'Signed Renewal',          isRequired: false },
  { key: 'cnDn',                label: 'CN / DN',                 isRequired: false },
  { key: 'attachmentChecklist', label: 'Attachment Checklist',    isRequired: true  },
]

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

export function mapRfiListItem(item: BackendRfiListItem): RfiListItem {
  return {
    id:               item.id,
    policyId:         item.policyId,
    policyNumber:     item.policyNumber,
    quotationNumber:  item.quotationNumber,
    insured:          item.insured,
    status:           item.status,
    requestedBy:      item.requestedBy,
    submittedAt:      item.submittedAt,
    createdAt:        item.createdAt,
    updatedAt:        item.updatedAt,
  }
}

export function mapChecklist(checklist: BackendRfiChecklist): RfiChecklistItem[] {
  return CHECKLIST_DEFS.map((def) => ({
    key:         def.key,
    label:       def.label,
    isRequired:  def.isRequired,
    isCompleted: checklist[def.key],
  }))
}

export function mapAttachment(a: BackendRfiAttachment): RfiAttachment {
  return {
    id:         a.id,
    fileName:   a.fileName,
    fileUrl:    a.fileUrl,
    uploadedBy: a.uploadedBy,
    uploadedAt: a.uploadedAt,
  }
}

export function mapRfiDetail(item: BackendRfiDetail): RfiDocument {
  const leader  = item.leader ? mapParticipant(item.leader, 'leader') : null
  const members = (item.members ?? []).map((m) => mapParticipant(m, 'member'))
  const participants = [...(leader ? [leader] : []), ...members]
  const computedTotalShare = participants.reduce((sum, p) => sum + p.sharePercentage, 0)

  return {
    ...mapRfiListItem(item),
    leader,
    members,
    totalShare:  item.totalShare ?? computedTotalShare,
    checklist:   mapChecklist(item.checklist),
    attachments: item.attachments.map(mapAttachment),
  }
}

export function mapRfiHistoryEvent(entry: BackendRfiHistoryEntry): RfiHistoryEvent {
  return {
    id:          entry.id,
    action:      entry.action,
    description: entry.description,
    performedBy: entry.performedBy,
    createdAt:   entry.createdAt,
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

export function mapCreateRfiPayload(payload: CreateRfiPayload): BackendCreateRfiPayload {
  return { policyId: payload.policyId }
}

export function mapUpdateRfiPayload(payload: UpdateRfiPayload): BackendUpdateRfiPayload {
  const result: BackendUpdateRfiPayload = {}
  if (payload.policyId) result.policyId = payload.policyId
  return result
}

/**
 * Map a frontend { [itemKey]: boolean } partial update — as produced by
 * toggling one checklist row — into the full BackendRfiChecklist shape
 * the PUT endpoint expects (PUT replaces the whole checklist object).
 * `current` is the existing checklist so untouched fields are preserved.
 */
export function mapUpdateChecklistPayload(
  current: RfiChecklistItem[],
  updates: UpdateChecklistPayload
): BackendUpdateChecklistPayload {
  const base = Object.fromEntries(current.map((c) => [c.key, c.isCompleted])) as Record<string, boolean>
  const merged = { ...base, ...updates }
  return CHECKLIST_DEFS.reduce((acc, def) => {
    acc[def.key] = merged[def.key] ?? false
    return acc
  }, {} as BackendRfiChecklist)
}

export function mapRfiQueryParams(filters: RfiFilters & { page?: number }): BackendRfiQueryParams {
  const params: BackendRfiQueryParams = {}
  if (filters.search)        params.search        = filters.search
  if (filters.status)        params.status        = filters.status
  if (filters.insuranceType) params.insuranceType = filters.insuranceType
  if (filters.page)          params.page          = String(filters.page)
  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
export function mapRfiListPagination(
  items: RfiListItem[],
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