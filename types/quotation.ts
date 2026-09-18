// ═══════════════════════════════════════════════════════════════
// QUOTATION (QS) DOMAIN TYPES
//
// Modeled directly from the current backend source
// (ppmi-workflow-backend-2/src/quotations/*, prisma/schema.prisma).
// This is a NEW domain, independent of the legacy `/qs` types in
// types/qs.ts — do not mix the two. The legacy module targets a
// different backend resource entirely.
//
// Response envelope (unchanged from auth phase):
//   success: { success: true, message?: string, data: T }
//   error:   { success: false, error: { name, message, details? } }
// All `id` keys are transformed to `_id` on the wire by the backend's
// global TransformIdInterceptor — mapped back to `id` at the API layer
// boundary so the rest of the app only ever sees `id`.
// ═══════════════════════════════════════════════════════════════

export type QuotationStatus =
  | 'DRAFT'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'SENT_TO_INSURANCE'
  | 'REVISION'
  | 'INSURANCE_APPROVED'
  | 'POLICY_ISSUED'

export type QuotationApprovalAction = 'APPROVED' | 'REJECTED' | 'REVISION'
export type InsuranceReviewAction = 'APPROVED' | 'REVISION'

// ─── Nested reference shapes (as returned by GET /quotations/:id) ─

export interface QuotationClientRef {
  id:         string
  name:       string
  clientCode: string
}

export interface QuotationInsuranceTypeRef {
  id:   string
  code: string
  name: string
}

export interface QuotationTechnicalUnitRef {
  id:   string
  name: string
}

export interface QuotationActorRef {
  id:       string
  fullname: string
}

// ─── Core Quotation ────────────────────────────────────────────
// Fields match `model Quotation` in schema.prisma exactly. Every
// business field besides quotationNumber/clientId/insuranceTypeId is
// nullable/optional on the backend — represented as such here, not
// forced required for form convenience.

export interface Quotation {
  id:              string
  quotationNumber: string
  clientId:        string
  insuranceTypeId: string
  technicalUnitId: string | null

  insured: string | null
  address: string | null

  quotationDate: string | null // ISO date string
  periodStart:   string | null
  periodEnd:     string | null

  interest:   string | null
  /**
   * These are Prisma `Decimal` columns. No custom JSON serializer was
   * found in the backend (main.ts/common), and Prisma's Decimal.toJSON()
   * defaults to returning a STRING — so these almost certainly arrive as
   * numeric strings (e.g. "1500000.00"), not JS numbers, despite being
   * `z.number()` on the way IN (create/update payloads). Typed as
   * `string | null` on the read side accordingly. Confirm against one
   * real GET /quotations/:id response before building any arithmetic or
   * formatting on these fields — if wrong, this is a one-line fix here.
   */
  rate:       string | null
  premium:    string | null
  deductible: string | null
  brokerage:  string | null

  status: QuotationStatus

  createdById:  string | null
  approvedById: string | null
  approvedAt:   string | null

  insurerRevisionRequestedAt: string | null
  insurerRevisionUpdatedAt:   string | null

  templateVersion: string | null

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Shape returned by GET /quotations (list) — includes shallow refs, no child collections. */
export interface QuotationListItem extends Quotation {
  client:        QuotationClientRef
  insuranceType: QuotationInsuranceTypeRef
  technicalUnit: QuotationTechnicalUnitRef | null
}

// ─── Sub-resources ─────────────────────────────────────────────

export interface QuotationObject {
  id:          string
  quotationId: string
  objectType:  string
  /** Schema-less on the backend (Prisma Json). Consumers must narrow this themselves — do not assume a vessel shape. */
  data:        unknown
  createdAt:   string
  updatedAt:   string
  deletedAt:   string | null
}

export interface QuotationCoverage {
  id:           string
  quotationId:  string
  coverageType: string | null
  description:  string | null
  /** Prisma Decimal — see note on Quotation.rate above; likely a numeric string, not a number. */
  value:        string | null
  createdAt:    string
  updatedAt:    string
  deletedAt:    string | null
}

export interface QuotationTerm {
  id:               string
  quotationId:      string
  termsConditionId: string | null
  description:      string | null
  /** Present on GET /quotations/:id (included relation); absent on the standalone /terms list unless the backend adds it there too — verify before relying on it outside the detail response. */
  termsCondition?:  { id: string; name: string } | null
  createdAt:        string
  updatedAt:        string
  deletedAt:        string | null
}

export interface QuotationWarranty {
  id:          string
  quotationId: string
  warrantyId:  string | null
  description: string | null
  warranty?:   { id: string; name: string } | null
  createdAt:   string
  updatedAt:   string
  deletedAt:   string | null
}

export interface QuotationAttachment {
  id:          string
  quotationId: string
  fileName:    string | null
  url:         string | null
  mimeType:    string | null
  fileSize:    number | null
  createdAt:   string
  updatedAt:   string
  deletedAt:   string | null
}

export interface QuotationApproval {
  id:          string
  quotationId: string
  approverId:  string | null
  action:      QuotationApprovalAction
  note:        string | null
  createdAt:   string
  updatedAt:   string
  /** Included on GET /:id/approvals. */
  approver?:   QuotationActorRef | null
}

export interface QuotationHistoryEntry {
  id:          string
  quotationId: string
  fromStatus:  QuotationStatus | null
  toStatus:    QuotationStatus
  action:      string | null
  actorId:     string | null
  note:        string | null
  createdAt:   string
  actor?:      QuotationActorRef | null
}

export interface InsuranceReview {
  id:                    string
  quotationSubmissionId: string
  action:                InsuranceReviewAction
  note:                  string | null
  recordedById:          string
  reviewedAt:            string
  recordedBy?:           QuotationActorRef
}

/**
 * A single "sent to insurer" event. A quotation may have MULTIPLE
 * submissions (e.g. re-sent after a revision, or sent to more than one
 * insurer) — do not flatten this into a boolean. Each submission has
 * its own review trail.
 */
export interface QuotationSubmission {
  id:               string
  note:             string | null
  sentAt:           string
  insuranceCompany: { id: string; code: string; name: string }
  sentBy:           QuotationActorRef
  reviews:          InsuranceReview[]
}

// ─── Detail response (GET /quotations/:id) ────────────────────
// Includes every child collection the backend eagerly loads.

export interface QuotationDetail extends Quotation {
  client:        QuotationClientRef & { id: string } // full Client record on detail (backend uses `include: { client: true }`) — only the id/name/clientCode fields are guaranteed by the narrower list-item shape above; treat any other client fields as unconfirmed until verified against a live response
  insuranceType: QuotationInsuranceTypeRef & { id: string }
  technicalUnit: QuotationTechnicalUnitRef | null
  objects:       QuotationObject[]
  coverages:     QuotationCoverage[]
  terms:         QuotationTerm[]
  warranties:    QuotationWarranty[]
  attachments:   QuotationAttachment[]
  approvals:     QuotationApproval[]
  histories:     QuotationHistoryEntry[]
  submissions:   QuotationSubmission[]
}

// ─── Request payloads ──────────────────────────────────────────
// Mirrors createQuotationSchema / updateQuotationSchema exactly
// (zod, quotations.validation.ts). clientId XOR client is enforced
// backend-side; represented here as a union so the UI layer is
// nudged toward the same constraint.

export interface InlineClientInput {
  name:          string
  address?:      string
  phone?:        string
  email?:        string
  contactPerson?: string
}

interface CreateQuotationBaseFields {
  insuranceTypeId: string
  insured?:        string
  address?:        string
  quotationDate?:  string
  periodStart?:    string
  periodEnd?:      string
  interest?:       string
  rate?:           number
  premium?:        number
  deductible?:     number
  brokerage?:      number
  templateVersion?: string
}

export type CreateQuotationPayload =
  | (CreateQuotationBaseFields & { clientId: string; client?: never })
  | (CreateQuotationBaseFields & { client: InlineClientInput; clientId?: never })

/** Mirrors updateQuotationSchema — every field optional, no clientId/client XOR constraint. */
export type UpdateQuotationPayload = Partial<
  CreateQuotationBaseFields & { clientId: string }
>

/** Mirrors actionNoteSchema — used by submit/approve/reject/request-revision/insurance-approve/insurance-revision. */
export interface ActionNotePayload {
  note?: string
}

/** Mirrors sendToInsuranceSchema. */
export interface SendToInsurancePayload extends ActionNotePayload {
  insuranceCompanyId: string
}

export interface CreateQuotationObjectPayload {
  objectType: string
  data?:      unknown
}
export type UpdateQuotationObjectPayload = Partial<CreateQuotationObjectPayload>

export interface CreateQuotationCoveragePayload {
  coverageType?: string
  description?:  string
  value?:        number
}
export type UpdateQuotationCoveragePayload = Partial<CreateQuotationCoveragePayload>

export interface CreateQuotationTermPayload {
  termsConditionId?: string
  description?:      string
}
export type UpdateQuotationTermPayload = Partial<CreateQuotationTermPayload>

export interface CreateQuotationWarrantyPayload {
  warrantyId?:  string
  description?: string
}
export type UpdateQuotationWarrantyPayload = Partial<CreateQuotationWarrantyPayload>

// ─── PDF export (placeholder endpoint) ─────────────────────────
// Backend returns this exact shape today — NOT a real PDF/file.
// Do not build download logic around this until the backend
// implements real generation.
export interface QuotationExportPdfPlaceholder {
  message:         string
  quotationId:     string
  quotationNumber: string
}