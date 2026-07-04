/**
 * QS adapters — map raw backend response fields to frontend QSListItem /
 * QSDocument shapes, and map frontend CreateQSPayload to BackendCreateQSPayload.
 *
 * All transformation logic lives here. lib/api/qs.ts calls these.
 * Components never import from this file.
 */

import type { Division } from '@/types/workflow'
import type {
  QSListItem,
  QSDocument,
  QSStatus,
  QSType,
  InsuranceType,
  CreateQSPayload,
  UpdateQSPayload,
  QSFilters,
} from '@/types/qs'
import type {
  BackendQSListItem,
  BackendQSDetail,
  BackendQSStatus,
  BackendQSType,
  BackendCreateQSPayload,
  BackendUpdateQSPayload,
  BackendQSQueryParams,
} from '@/types/backend/qs'

// ─── Date → ISO string ────────────────────────────────────────────
function toISO(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return value
}

/**
 * Convert a date-input value ("YYYY-MM-DD") to a full ISO-8601 DateTime
 * string required by Prisma ("YYYY-MM-DDTHH:mm:ss.sssZ").
 *
 * HTML <input type="date"> always returns "YYYY-MM-DD" with no time part.
 * Prisma rejects this with PrismaClientValidationError("Expected ISO-8601 DateTime").
 * Returns undefined if the value is empty so optional fields are omitted cleanly.
 */
function dateInputToISO(dateStr: string | undefined | null): string | undefined {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr   // already a full DateTime — pass through
  return `${dateStr}T00:00:00.000Z`
}

// ─── Division name → Division code ───────────────────────────────
// Backend returns division NAME string from division.name
// e.g. "P&I" → 'PI',  "H&M" → 'HM'
function toDivisionCode(name: string | null): Division {
  if (!name) return 'PI'
  const upper = name.toUpperCase().trim()
  if (upper === 'P&I' || upper === 'PI') return 'PI'
  if (upper === 'H&M' || upper === 'HM') return 'HM'
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[qs adapter] Unknown division name: "${name}"`)
  }
  return 'PI'
}

/** Division code → display name (backend list filter expects name, not code) */
export function divisionCodeToName(code: Division | ''): string | undefined {
  if (!code) return undefined
  return code === 'PI' ? 'P&I' : 'H&M'
}

// ─── Currency: backend is free-text, frontend is a union ─────────
// Backend `currency` field has no enum constraint in Prisma schema —
// it's a plain string. Frontend QSDocument/QSListItem type it as
// 'IDR' | 'USD' for display formatting purposes. Coerce to the closest
// match; default to 'IDR' for anything unrecognized.
function toFrontendCurrency(value: string): 'IDR' | 'USD' {
  const upper = value.toUpperCase().trim()
  return upper === 'USD' ? 'USD' : 'IDR'
}

// ─── InsuranceType: backend is free-text, frontend is a union ────
// Same situation as currency — backend `insurance` field is unconstrained
// text. Coerce to the closest known InsuranceType value; fall back to
// the raw value cast as InsuranceType (display still works, just an
// unvalidated string at the type level).
const KNOWN_INSURANCE_TYPES: InsuranceType[] = ['P&I', 'H&M', 'FD&D', 'War Risk', 'Cargo', 'Liability']

function toFrontendInsuranceType(value: string): InsuranceType {
  const match = KNOWN_INSURANCE_TYPES.find(
    (t) => t.toLowerCase() === value.toLowerCase().trim()
  )
  return match ?? (value as InsuranceType)
}

// ─── Backend QSStatus ↔ frontend QSStatus ────────────────────────
// Identical value sets now (both DRAFT/SUBMITTED/APPROVED/REJECTED).
// Kept as explicit pass-through functions so any future divergence
// is isolated to this one place.
function toFrontendStatus(status: BackendQSStatus): QSStatus {
  return status as QSStatus
}
function toBackendStatus(status: QSStatus | undefined): BackendQSStatus | undefined {
  return status as BackendQSStatus | undefined
}

// ─── Backend QSType ↔ frontend QSType ────────────────────────────
// Identical value sets now (both NEW/RENEWAL).
function toFrontendType(type: BackendQSType): QSType {
  return type as QSType
}
function toBackendType(type: QSType | undefined): BackendQSType | undefined {
  return type as BackendQSType | undefined
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

/** Map a single BackendQSListItem → QSListItem (one table row) */
export function mapQSListItem(item: BackendQSListItem): QSListItem {
  return {
    id:             item.id,
    docNumber:      item.id,                          // id IS the doc number
    type:           toFrontendType(item.type),
    division:       toDivisionCode(item.division),
    insuredName:    item.insured,
    vesselName:     item.vessel,
    insuranceType:  toFrontendInsuranceType(item.insurance),
    currency:       toFrontendCurrency(item.currency),
    premiumAmount:  item.premium_amount,
    status:         toFrontendStatus(item.status),
    createdAt:      toISO(item.created_at),
    updatedAt:      toISO(item.updated_at),
    hasInvoice:     false,                            // not in QS response — derive later via Invoice module
    invoiceNumber:  undefined,
    policyNumber:   item.policy_number,
  }
}

/** Map BackendQSDetail → QSDocument (detail page) */
export function mapQSDetail(item: BackendQSDetail): QSDocument {
  return {
    id:             item.id,
    docNumber:      item.id,
    division:       toDivisionCode(item.division),
    divisionId:     item.division_id,
    status:         toFrontendStatus(item.status),
    type:           toFrontendType(item.type),
    effectiveDate:  toISO(item.period_from),
    expiryDate:     toISO(item.period_to),
    insuredName:    item.insured,
    vesselName:     item.vessel,
    insuranceType:  toFrontendInsuranceType(item.insurance),
    currency:       toFrontendCurrency(item.currency),
    premiumAmount:  item.premium_amount,
    internalNotes:  item.remarks,
    createdAt:      toISO(item.created_at),
    updatedAt:      toISO(item.updated_at),
    hasInvoice:     false,
    member:         item.member,
    leader:         item.leader,
    policyNumber:   item.policy_number,
    // Not in backend QS response — left undefined, components already
    // handle optional/undefined for these via existing `?` typing
    createdBy:      undefined,
    updatedBy:      undefined,
    activity:       [],
    attachments:    [],
  }
}

// ════════════════════════════════════════════════════════════════
// REQUEST ADAPTERS  (frontend → backend)
// ════════════════════════════════════════════════════════════════

/**
 * Map frontend CreateQSPayload → BackendCreateQSPayload.
 *
 * Requires divisionId (UUID) resolved from GET /divisions before calling —
 * the API layer (lib/api/qs.ts) accepts it as a parameter.
 *
 * Fields with no backend equivalent are dropped silently:
 *   broker, insuredAddress, insuredContact, vesselFlag, vesselType,
 *   vesselGRT, vesselBuiltYear, imoNumber, coverageDetail, deductible,
 *   exchangeRate (none exist in the Prisma QS model).
 *
 * Fields required by backend but newly added (optional) to CreateQSPayload —
 * member, leader, policyNumber — fall back to placeholder values if the
 * calling form hasn't been updated to collect them yet. This keeps the
 * API layer functional without forcing form changes in this phase.
 */
export function mapCreateQSPayload(
  payload: CreateQSPayload,
  divisionId: string
): BackendCreateQSPayload {
  return {
    division_id:    divisionId,
    type:           toBackendType(payload.type) ?? 'NEW',
    status:         toBackendStatus(payload.status) ?? 'DRAFT',
    insured:        payload.insuredName,
    vessel:         payload.vesselName,
    insurance:      payload.insuranceType,
    // Omit policy_number/member/leader entirely when not provided by the form.
    // Sending '-' caused a UNIQUE constraint violation on policy_number
    // and stored semantically wrong placeholder values for member/leader.
    ...(payload.policyNumber ? { policy_number: payload.policyNumber } : {}),
    ...(payload.member       ? { member:         payload.member       } : {}),
    ...(payload.leader       ? { leader:         payload.leader       } : {}),
    period_from:    dateInputToISO(payload.effectiveDate) ?? '',
    period_to:      dateInputToISO(payload.expiryDate)    ?? '',
    premium_amount: Math.round(payload.premiumAmount),  // backend expects integer
    currency:       payload.currency,
    remarks:        payload.internalNotes || '-',        // backend requires min(1)
  }
}

/**
 * Map frontend UpdateQSPayload → BackendUpdateQSPayload.
 * Only includes fields that are actually present (undefined = omit from PATCH body).
 */
export function mapUpdateQSPayload(
  payload: UpdateQSPayload,
  divisionId?: string
): BackendUpdateQSPayload {
  const result: BackendUpdateQSPayload = {}

  if (divisionId)                    result.division_id    = divisionId
  if (payload.type)                  result.type           = toBackendType(payload.type)
  if (payload.status)                result.status         = toBackendStatus(payload.status)
  if (payload.insuredName)           result.insured        = payload.insuredName
  if (payload.vesselName)            result.vessel         = payload.vesselName
  if (payload.insuranceType)         result.insurance      = payload.insuranceType
  if (payload.member)                result.member         = payload.member
  if (payload.leader)                result.leader         = payload.leader
  if (payload.policyNumber)          result.policy_number  = payload.policyNumber
  if (payload.effectiveDate) result.period_from = dateInputToISO(payload.effectiveDate)
  if (payload.expiryDate)   result.period_to   = dateInputToISO(payload.expiryDate)
  if (payload.currency)              result.currency       = payload.currency
  if (payload.internalNotes != null) result.remarks = payload.internalNotes || '-'
  if (payload.premiumAmount != null) result.premium_amount = Math.round(payload.premiumAmount)

  return result
}

/**
 * Map frontend QSFilters (+ pagination/sort) → BackendQSQueryParams.
 * Conversions: pageSize→limit, sortDir→sort_order, sortBy→sort_by
 * (validated against backend's allowed sort fields), division code→name.
 */
export function mapQSQueryParams(
  filters: QSFilters & {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  }
): BackendQSQueryParams {
  const SORT_FIELD_MAP: Record<string, string> = {
    docNumber:     'id',
    insuredName:   'insured',
    vesselName:    'vessel',
    premiumAmount: 'premium_amount',
    createdAt:     'created_at',
    updatedAt:     'updated_at',
  }

  const params: BackendQSQueryParams = {}

  if (filters.search)    params.search     = filters.search
  if (filters.status)    params.status     = filters.status
  if (filters.type)      params.type       = filters.type
  if (filters.division)  params.division   = divisionCodeToName(filters.division)
  if (filters.page)      params.page       = String(filters.page)
  if (filters.pageSize)  params.limit      = String(filters.pageSize)
  if (filters.sortDir)   params.sort_order = filters.sortDir
  if (filters.sortBy && SORT_FIELD_MAP[filters.sortBy]) {
    params.sort_by = SORT_FIELD_MAP[filters.sortBy]
  }

  return params
}

// ─── Pagination adapter ───────────────────────────────────────────
/**
 * Convert backend pagination (items + total_pages + current_page) to
 * frontend PaginatedResponse shape (page/pageSize/total/totalPages).
 * Backend does not return a total item count — estimated as
 * totalPages * pageSize (may be slightly high on the last page).
 */
export function mapQSListPagination(
  items: QSListItem[],
  totalPages: number,
  currentPage: number,
  pageSize: number
) {
  return {
    success: true,
    data:    items,
    pagination: {
      page:       currentPage,
      pageSize,
      total:      totalPages * pageSize,
      totalPages,
    },
  }
}