/**
 * Raw backend QS response types.
 * Confirmed from backend source:
 *   src/qs/qs.service.ts, src/qs/qs.validation.ts, prisma/schema.prisma
 *
 * Used ONLY in lib/adapters/qs.ts — never imported by components.
 */

// ─── Backend enums ────────────────────────────────────────────────

/** prisma: enum QSType { NEW  RENEWAL } */
export type BackendQSType = 'NEW' | 'RENEWAL'

/**
 * prisma: enum QSSTATUS { DRAFT  SUBMITTED  APPROVED  REJECTED }
 * Frontend had PENDING/REVISION/COMPLETED — none exist in backend.
 */
export type BackendQSStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

// ─── List / detail item shape ─────────────────────────────────────
/**
 * Shape returned by listQs() and getQs().
 * `id` is auto-generated document number e.g. "QS-20250115-001".
 * `division` is resolved to division.name (string|null), not a code or UUID.
 * Dates are Prisma DateTime — may arrive as Date or ISO string.
 */
export interface BackendQSListItem {
  id:             string
  division_id:    string          // UUID
  division:       string | null   // name e.g. "P&I" | "H&M"
  type:           BackendQSType
  status:         BackendQSStatus
  insured:        string
  vessel:         string
  insurance:      string
  member:         string
  leader:         string
  policy_number:  string
  period_from:    string | Date
  period_to:      string | Date
  premium_amount: number          // integer
  currency:       string
  remarks:        string
  is_deleted:     boolean
  created_at:     string | Date
  updated_at:     string | Date
  deleted_at:     string | Date | null
}

export type BackendQSDetail = BackendQSListItem

// ─── List response envelope ───────────────────────────────────────
/**
 * client.ts get<T>() returns res.data = full Axios response body.
 * So adapters access envelope.data.items / .total_pages / .current_page.
 */
export interface BackendQSListData {
  items:        BackendQSListItem[]
  total_pages:  number
  current_page: number
}

export interface BackendQSListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendQSListData
}

export interface BackendQSDetailEnvelope {
  success:     boolean
  status_code: number
  data:        BackendQSDetail
}

export interface BackendQSMutationEnvelope {
  success:     boolean
  status_code: number
  data:        BackendQSDetail
}

// ─── Create payload ───────────────────────────────────────────────
/** Confirmed from createQsSchema — required fields. Optional fields may be omitted. */
export interface BackendCreateQSPayload {
  division_id:    string
  type:           BackendQSType
  status:         BackendQSStatus
  insured:        string
  vessel:         string
  insurance:      string
  member?:        string   // optional — form does not collect; omit rather than sending '-'
  leader?:        string   // optional — form does not collect; omit rather than sending '-'
  policy_number?: string   // optional — UNIQUE constraint; omit rather than sending '-'
  period_from:    string
  period_to:      string
  premium_amount: number
  currency:       string
  remarks:        string
}

/** Confirmed from updateQsSchema — all optional. Backend: PATCH /qs/:id */
export type BackendUpdateQSPayload = Partial<BackendCreateQSPayload>

// ─── Query params ─────────────────────────────────────────────────
/**
 * Backend listQs() accepts these params (from @ApiQuery decorators):
 *   'limit' (not 'pageSize'), 'sort_by', 'sort_order',
 *   'division' = division NAME string e.g. "P&I"
 */
export interface BackendQSQueryParams {
  status?:     string
  division?:   string   // division NAME "P&I" or "H&M"
  type?:       string
  search?:     string
  page?:       string
  limit?:      string
  sort_by?:    string
  sort_order?: string
}