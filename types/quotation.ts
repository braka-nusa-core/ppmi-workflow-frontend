// FILE: types/quotation.ts
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

/** Matches `model Adjuster` / `model Surveyor` in schema.prisma — both share this shape. Returned as a flat array by GET /quotation-references/adjusters and /surveyors. */
export interface QuotationReferenceContact {
  id:        string
  name:      string
  phone:     string | null
  email:     string | null
  address:   string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * Matches `model QsTemplate`. Returned by GET /quotation-references/templates/:domain
 * (domain restricted server-side to HULL_MACHINERY | CARGO — P&I templates use the
 * separate /pni/club-formats/:clubFormat/template endpoint instead, not this one).
 * `content` is schema-less (Prisma Json) — narrow it yourself per domain in Phase 2.
 */
export interface QsTemplate {
  id:              string
  name:            string
  templateVersion: string | null
  templateDomain:  'PNI' | 'HULL_MACHINERY' | 'CARGO' | null
  pniClubFormat:   string | null
  content:         unknown
  createdAt:       string
  updatedAt:       string
  deletedAt:       string | null
}

/** Join row shape as returned nested on GET /quotations/:id (`adjusters: { include: { adjuster: true } } }`). No own `id` — `QuotationAdjuster`/`QuotationSurveyor` use a composite primary key on the backend. */
export interface QuotationAdjusterEntry {
  quotationId: string
  adjusterId:  string
  sortOrder:   number
  adjuster:    QuotationReferenceContact
}

export interface QuotationSurveyorEntry {
  quotationId: string
  surveyorId:  string
  sortOrder:   number
  surveyor:    QuotationReferenceContact
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
  recipient:   string | null
  attentionTo: string | null

  quotationDate: string | null // ISO date string
  periodStart:   string | null
  periodEnd:     string | null
  periodText:    string | null

  interest:   string | null
  sumInsuredCurrency: string | null
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
  sumInsured: string | null
  rate:       string | null
  premium:    string | null
  deductible: string | null
  deductibleText:  string | null
  deductibleBasis: string | null
  brokerage:  string | null
  insuranceLabelValue: string | null
  confirmedAcceptedBy: string | null

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
  client:         QuotationClientRef
  insuranceType:  QuotationInsuranceTypeRef
  technicalUnit:  QuotationTechnicalUnitRef | null
  /** Shallow `{ id }`-only select on the list endpoint — use this to badge/filter by domain without a full detail fetch. `null` when this quotation has no H&M/Cargo detail attached yet (or is P&I). */
  hmQuotation:    { id: string } | null
  cargoQuotation: { id: string } | null
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

export type QuotationTermSection = 'TERMS_CONDITIONS' | 'ADJUSTER_SURVEYOR'

export interface QuotationTerm {
  id:               string
  quotationId:      string
  termsConditionId: string | null
  description:      string | null
  section:          QuotationTermSection // has a DB default (TERMS_CONDITIONS) — never null
  sortOrder:        number
  /** Whether this row is currently attached/checked (H&M/Cargo "Bisa dihapus" pattern — the row can be toggled off rather than deleted). */
  isSelected:       boolean
  /** Whether the populated standard wording may be edited in place (H&M "Bisa di edit" pattern). */
  isEditable:       boolean
  /** Whether the whole row may be removed (H&M "Bisa di hapus" pattern). */
  isRemovable:      boolean
  /** Non-null groups this row into a mutually-exclusive pick-one set (Cargo's "Bisa dipilih salah satu" Institute Cargo Clause pattern). Rows sharing the same value are radio-exclusive; enforce that in the UI, the backend does not. */
  selectionGroup:   string | null
  /** Schema-less on the backend (Prisma Json) — e.g. an age/GT trigger. Consumers must narrow this themselves. */
  conditionRule:    unknown
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
  sortOrder:   number
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

// ─── H&M / Cargo detail summaries ──────────────────────────────
// These are ONLY the shapes nested inside GET /quotations/:id
// (hm.service.ts / cargo.service.ts detailInclude()). They are
// intentionally minimal — full domain types (create/update payloads,
// the H&M/Cargo builder forms) belong to their own Phase 2 modules
// (a future types/hm.ts / types/cargo.ts), not here.
//
// `pniQuotation` is deliberately NOT modeled on QuotationDetail at
// all: quotations.service.ts get() does not include it. A P&I
// quotation's detail must be fetched separately from
// GET /pni/quotations/:quotationId (Phase 2) and merged client-side
// — never assume it will appear on this type.

export type CargoInstituteClause =
  | 'INSTITUTE_CARGO_A'
  | 'INSTITUTE_CARGO_B'
  | 'INSTITUTE_CARGO_C'
  | 'INSTITUTE_BULK_OIL'
  | 'INSTITUTE_COAL'
  | 'INSTITUTE_CARGO_AIR'

export interface HmQuotationInstallmentSummary {
  id:            string
  hmQuotationId: string
  installmentNo: number
  /** Prisma Decimal(5,2) — see the numeric-string caveat on Quotation.rate above. */
  percentage:    string | null
  dueAfterDays:  number | null
  /** Prisma Decimal(15,2) — see the numeric-string caveat on Quotation.rate above. */
  amount:        string | null
  currency:      string | null
  dueDate:       string | null
  sortOrder:     number
  createdAt:     string
  updatedAt:     string
  deletedAt:     string | null
}

export interface HmQuotationSummary {
  id:                    string
  quotationId:           string
  vesselType:            string | null
  tradingWarranty:       string | null
  premiumPaymentEnabled: boolean
  brokerageEnabled:      boolean
  installments:          HmQuotationInstallmentSummary[]
  createdAt:             string
  updatedAt:             string
  deletedAt:             string | null
}

export interface CargoQuotationSummary {
  id:                   string
  quotationId:          string
  interestInsured:      string | null
  voyageFrom:           string | null
  voyageTo:             string | null
  etd:                  string | null
  eta:                  string | null
  conveyance:           string | null
  instituteCargoClause: CargoInstituteClause | null
  createdAt:            string
  updatedAt:            string
  deletedAt:            string | null
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
  adjusters:     QuotationAdjusterEntry[]
  surveyors:     QuotationSurveyorEntry[]
  approvals:     QuotationApproval[]
  histories:     QuotationHistoryEntry[]
  submissions:   QuotationSubmission[]
  /** Present only when insuranceType.code === 'HM' and hm.service.ts create() has been called for this quotation; otherwise null. */
  hmQuotation:    HmQuotationSummary | null
  /** Present only when insuranceType.code === 'CARGO' and cargo.service.ts create() has been called for this quotation; otherwise null. */
  cargoQuotation: CargoQuotationSummary | null
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
  recipient?:      string
  attentionTo?:    string
  quotationDate?:  string
  periodStart?:    string
  periodEnd?:      string
  periodText?:     string
  interest?:       string
  sumInsured?:         number
  sumInsuredCurrency?: string
  rate?:           number
  premium?:        number
  deductible?:     number
  deductibleText?:  string
  deductibleBasis?: string
  brokerage?:      number
  insuranceLabelValue?: string
  confirmedAcceptedBy?: string
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

/** Mirrors createQuotationTermSchema/updateQuotationTermSchema exactly (both accept the same optional field set). */
export interface CreateQuotationTermPayload {
  termsConditionId?: string
  description?:      string
  section?:          QuotationTermSection
  sortOrder?:        number
  isSelected?:       boolean
  isEditable?:       boolean
  isRemovable?:      boolean
  selectionGroup?:   string
  conditionRule?:    Record<string, unknown>
}
export type UpdateQuotationTermPayload = Partial<CreateQuotationTermPayload>

export interface CreateQuotationWarrantyPayload {
  warrantyId?:  string
  description?: string
  sortOrder?:   number
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