// ═══════════════════════════════════════════════════════════════
// P&I (PROTECTION & INDEMNITY) DOMAIN TYPES
//
// Modeled directly from the current backend source
// (ppmi-workflow-backend-2/src/pni/pni.validation.ts,
// src/pni/pni.service.ts, prisma/schema.prisma). Nothing invented.
//
// Reuses shared quotation types from types/quotation.ts
// (QuotationClientRef, QuotationInsuranceTypeRef,
// QuotationTechnicalUnitRef, InlineClientInput) rather than
// duplicating them.
//
// IMPORTANT — this is deliberately NOT part of QuotationDetail:
// GET /quotations/:id never includes pniQuotation. A P&I quotation's
// full detail always comes from GET /pni/quotations/:quotationId.
// ═══════════════════════════════════════════════════════════════

import type {
  QuotationClientRef,
  QuotationInsuranceTypeRef,
  QuotationTechnicalUnitRef,
  InlineClientInput,
} from './quotation'

// ─── Enums (exact backend values) ──────────────────────────────

export type PniClubFormat =
  | 'INIGO_SYNDICATE_1301'
  | 'EAGLE_OCEAN_MARINE'
  | 'MSIG_SPECIALTY_MARINE_NV'

export type PniPremiumBasis =
  | 'PER_ANNUM'
  | 'PER_VESSEL_PER_ANNUM'
  | 'PRO_RATA'
  | 'INCLUDED_NO_ADDITIONAL_CHARGE'
  | 'OTHER'

export type PniProvisionType = 'CONDITION' | 'CLAUSE' | 'EXCLUSION' | 'WARRANTY'
export type PniProvisionSource = 'PREDEFINED' | 'CUSTOM'
export type PniProvisionScope = 'QUOTE' | 'ALL_VESSELS' | 'SELECTED_VESSELS'
export type PniDeductibleScope = 'FLAT' | 'CLAIM_CATEGORY' | 'ALL_VESSELS' | 'SELECTED_VESSELS'

/** Display names are hardcoded on the backend (pni.service.ts CLUB_FORMATS), not stored in the DB — returned as-is by GET /pni/club-formats. */
export interface PniClubFormatOption {
  code:        PniClubFormat
  displayName: string
}

// ─── Response shapes (GET /pni/quotations/:quotationId) ───────
// Field order/nesting mirrors pni.service.ts's detailInclude() exactly.

export interface PniVesselCoverage {
  id:               string
  pniVesselId:      string
  insuranceBlockId: string
  annualPremium:    string | null // Prisma Decimal(15,2) — numeric string, see Quotation.rate caveat in types/quotation.ts
  limitAmount:      string | null
  currency:         string
  details:          unknown
  createdAt:        string
  updatedAt:        string
  deletedAt:        string | null
}

export interface PniVessel {
  id:                 string
  pniQuotationId:     string
  name:               string
  imoNumber:          string | null
  vesselType:         string | null
  builtYear:          number | null
  flag:               string | null
  vesselClass:        string | null
  /** true = render "-" instead of blank (Karya's explicit dash pattern from the source Word doc). */
  classNotApplicable: boolean
  grossTonnage:       string | null // Decimal(15,2)
  portOfRegistry:     string | null
  sortOrder:          number
  details:            unknown
  coverages:          PniVesselCoverage[]
  createdAt:          string
  updatedAt:          string
  deletedAt:          string | null
}

/** Join-row shape nested under a provision/deductible's `vesselScopes` — composite PK on the backend (no own `id`). */
export interface PniProvisionVesselScope {
  provisionId: string
  vesselId:    string
}

export interface PniDeductibleVesselScope {
  deductibleId: string
  vesselId:     string
}

export interface PniProvision {
  id:               string
  pniQuotationId:   string
  insuranceBlockId: string | null // null = quote-level (appears in the top-level `provisions[]`, not nested in a block)
  type:             PniProvisionType
  source:           PniProvisionSource
  scope:            PniProvisionScope
  title:            string
  content:          string | null
  reference:        string | null
  conditionRule:    unknown
  sortOrder:        number
  /** Only non-empty when scope === 'SELECTED_VESSELS' — enforced server-side. */
  vesselScopes:     PniProvisionVesselScope[]
  createdAt:        string
  updatedAt:        string
  deletedAt:        string | null
}

export interface PniDeductible {
  id:               string
  insuranceBlockId: string
  scope:            PniDeductibleScope
  claimCategory:    string | null // meaningful only when scope === 'CLAIM_CATEGORY'
  amount:           string | null // Decimal(15,2)
  currency:         string
  description:      string | null
  sortOrder:        number
  /** Only non-empty when scope === 'SELECTED_VESSELS' — enforced server-side. */
  vesselScopes:     PniDeductibleVesselScope[]
  createdAt:        string
  updatedAt:        string
  deletedAt:        string | null
}

export interface PniCoverRestriction {
  id:               string
  pniQuotationId:   string
  insuranceBlockId: string | null // null = quote-level
  name:             string
  partReference:    string | null
  sectionReference: string | null
  isSelected:       boolean
  sortOrder:        number
  createdAt:        string
  updatedAt:        string
  deletedAt:        string | null
}

export interface PniInsuranceBlock {
  id:                     string
  pniQuotationId:         string
  /** Non-null when this block defers its terms to another block — e.g. Karya's War P&I block inheriting from the main P&I block. */
  inheritsFromBlockId:    string | null
  typeOfInsurance:        string
  security:               string | null
  policyWordingReference: string | null
  tradingArea:            string | null
  paymentWarrantyText:    string | null
  maximumInsured:         string | null // Decimal(15,2)
  currency:               string
  /** Decimal(15,2), DB default 0 — CAN legitimately be "0.00" (e.g. a War P&I rider included at no extra charge). */
  premium:                string
  premiumBasis:           PniPremiumBasis
  sortOrder:              number
  details:                unknown
  deductibles:            PniDeductible[]
  provisions:             PniProvision[] // block-scoped only (insuranceBlockId === this block's id)
  coverRestrictions:      PniCoverRestriction[] // block-scoped only
  createdAt:              string
  updatedAt:              string
  deletedAt:              string | null
}

export interface PniInstallment {
  id:             string
  pniQuotationId: string
  installmentNo:  number
  amount:         string | null // Decimal(15,2)
  currency:       string
  dueDate:        string | null
  createdAt:      string
  updatedAt:      string
  deletedAt:      string | null
}

export interface PniRequiredDocument {
  id:             string
  pniQuotationId: string
  name:           string
  isRequired:     boolean
  sortOrder:      number
  createdAt:      string
  updatedAt:      string
  deletedAt:      string | null
}

export interface PniOrganizationRole {
  id:             string
  pniQuotationId: string
  organization:   string | null
  role:           string
  sortOrder:      number
  createdAt:      string
  updatedAt:      string
  deletedAt:      string | null
}

/** GET/POST/PATCH /pni/quotations/:quotationId — the full P&I detail. */
export interface PniQuotationDetail {
  id:                   string
  quotationId:          string
  clubFormat:           PniClubFormat
  referenceNumber:      string | null
  validityDays:         number | null
  assuredDomicile:      string | null
  broker:               string | null
  insurerOrSecurity:    string | null
  tradingLimits:        string | null
  paymentTermsText:     string | null
  subjectivities:       string | null
  importantInformation: string | null
  signatureName:        string | null
  signatureCity:        string | null
  signatureDate:        string | null
  details:              unknown
  quotation: {
    id:              string
    quotationNumber: string
    status:          string
    client:          QuotationClientRef & { id: string }
    insuranceType:   QuotationInsuranceTypeRef & { id: string }
    technicalUnit:   QuotationTechnicalUnitRef | null
    [key: string]:   unknown // remaining base Quotation scalar fields — see types/quotation.ts Quotation for the full field list
  }
  vessels:           PniVessel[]
  insuranceBlocks:   PniInsuranceBlock[]
  /** Quote-level only (insuranceBlockId === null) — block-level provisions live nested inside each insuranceBlocks[] entry instead. */
  provisions:        PniProvision[]
  installments:      PniInstallment[]
  requiredDocuments: PniRequiredDocument[]
  organizationRoles: PniOrganizationRole[]
  /** Quote-level only (insuranceBlockId === null) — block-level restrictions live nested inside each insuranceBlocks[] entry instead. */
  coverRestrictions: PniCoverRestriction[]
  createdAt:         string
  updatedAt:         string
  deletedAt:         string | null
}

/** GET /pni/quotations (list) — slim shape per pni.service.ts list(). */
export interface PniQuotationListItem {
  id:              string
  quotationNumber: string
  client:          QuotationClientRef
  insuranceType:   QuotationInsuranceTypeRef
  pniQuotation: {
    id:              string
    clubFormat:      PniClubFormat
    referenceNumber: string | null
  }
  status:          string
  createdAt:       string
  [key: string]:   unknown
}

/** GET /pni/club-formats/:clubFormat/template — QsTemplate rows filtered by pniClubFormat. */
export interface PniTemplate {
  id:              string
  name:            string
  templateVersion: string | null
  templateDomain:  'PNI' | 'HULL_MACHINERY' | 'CARGO' | null
  pniClubFormat:   PniClubFormat | null
  content:         unknown
  createdAt:       string
  updatedAt:       string
  deletedAt:       string | null
}

// ─── Create/Update payloads ─────────────────────────────────────
// Mirror createPniQuotationSchema / updatePniQuotationSchema exactly.
//
// KEY/REF PATTERN: `key` is a client-generated temporary string used
// only within a single request to wire a vessel or insurance block to
// the other arrays below it (vesselCoverages/provisions/deductibles/
// coverRestrictions reference it via `vesselRef`/`insuranceBlockRef`).
// The server resolves it to the real DB id and it is never persisted.
// On update, once a row has a real `id`, reference that instead of a
// `key`. Both `key` and `id` are accepted anywhere a `*Ref` field is
// typed below (`IdOrKey`) — the backend resolves against whichever a
// given request actually provides.
export type IdOrKey = string

export interface PniQuotationFieldsInput {
  clientId?:        string
  insured?:         string
  address?:         string
  quotationDate?:   string
  periodStart?:     string
  periodEnd?:       string
  interest?:        string
  rate?:            number
  premium?:         number
  deductible?:      number
  brokerage?:       number
  templateVersion?: string
}

export interface CreatePniFieldsInput {
  clubFormat:            PniClubFormat
  referenceNumber?:      string
  validityDays?:         number
  assuredDomicile?:      string
  broker?:               string
  insurerOrSecurity?:    string
  tradingLimits?:        string
  paymentTermsText?:     string
  subjectivities?:       string
  importantInformation?: string
  signatureName?:        string
  signatureCity?:        string
  signatureDate?:        string
  details?:              Record<string, unknown>
}
export type UpdatePniFieldsInput = Partial<CreatePniFieldsInput>

export interface PniVesselInput {
  id?:                 string
  key?:                IdOrKey
  name:                string
  imoNumber?:          string
  vesselType?:         string
  builtYear?:          number
  flag?:               string
  vesselClass?:        string
  classNotApplicable?: boolean
  grossTonnage?:       number
  portOfRegistry?:     string
  sortOrder?:          number
  details?:            Record<string, unknown>
}

export interface PniInsuranceBlockInput {
  id?:                     string
  key?:                    IdOrKey
  /** Reference another block in this same request (by its `key` or real `id`), or `null` to clear an existing inheritance on update. */
  inheritsFromBlockRef?:   IdOrKey | null
  typeOfInsurance:         string
  security?:               string
  policyWordingReference?: string
  tradingArea?:            string
  paymentWarrantyText?:    string
  maximumInsured?:         number
  currency?:               string // exactly 3 chars
  premium?:                number
  premiumBasis?:           PniPremiumBasis
  sortOrder?:              number
  details?:                Record<string, unknown>
}

export interface PniVesselCoverageInput {
  id?:                string
  vesselRef:          IdOrKey
  insuranceBlockRef:  IdOrKey
  annualPremium?:     number
  limitAmount?:       number
  currency?:          string
  details?:           Record<string, unknown>
}

export interface PniProvisionInput {
  id?:                string
  /** Omit or `null` for a quote-level provision; a `key`/`id` for a block-scoped one. */
  insuranceBlockRef?: IdOrKey | null
  type:               PniProvisionType
  source?:            PniProvisionSource
  scope?:             PniProvisionScope
  title:              string
  content?:           string
  reference?:         string
  conditionRule?:     Record<string, unknown>
  sortOrder?:         number
  /** REQUIRED non-empty when scope === 'SELECTED_VESSELS'; MUST be omitted/empty otherwise — enforced server-side (400 on violation). */
  vesselRefs?:        IdOrKey[]
}

export interface PniDeductibleInput {
  id?:                string
  insuranceBlockRef:  IdOrKey
  scope:              PniDeductibleScope
  /** Meaningful only when scope === 'CLAIM_CATEGORY' (e.g. "Crew", "Cargo", "Collision", "F&FO"). */
  claimCategory?:     string
  amount?:            number
  currency?:          string
  description?:       string
  sortOrder?:         number
  /** REQUIRED non-empty when scope === 'SELECTED_VESSELS'; MUST be omitted/empty otherwise — enforced server-side (400 on violation). */
  vesselRefs?:        IdOrKey[]
}

export interface PniInstallmentInput {
  id?:            string
  installmentNo:  number
  amount?:        number
  currency?:      string
  dueDate?:       string
}

export interface PniRequiredDocumentInput {
  id?:         string
  name:        string
  isRequired?: boolean
  sortOrder?:  number
}

export interface PniOrganizationRoleInput {
  id?:           string
  organization?: string
  role:          string
  sortOrder?:    number
}

export interface PniCoverRestrictionInput {
  id?:                string
  insuranceBlockRef?: IdOrKey | null
  name:               string
  partReference?:     string
  sectionReference?:  string
  isSelected?:        boolean
  sortOrder?:         number
}

/** The 9 child-collection arrays shared by both create and update (all upsert semantics on update — see UpdatePniQuotationPayload). */
export interface PniChildrenInput {
  vessels?:           PniVesselInput[]
  insuranceBlocks?:   PniInsuranceBlockInput[]
  vesselCoverages?:   PniVesselCoverageInput[]
  provisions?:        PniProvisionInput[]
  deductibles?:       PniDeductibleInput[]
  installments?:      PniInstallmentInput[]
  requiredDocuments?: PniRequiredDocumentInput[]
  organizationRoles?: PniOrganizationRoleInput[]
  coverRestrictions?: PniCoverRestrictionInput[]
}

/** POST /pni/quotations body. Mirrors createPniQuotationSchema exactly — clientId XOR client enforced server-side (400 otherwise). */
export type CreatePniQuotationPayload = {
  quotation: PniQuotationFieldsInput & { insuranceTypeId: string } & (
    | { clientId: string; client?: never }
    | { client: InlineClientInput; clientId?: never }
  )
  pni: CreatePniFieldsInput
} & PniChildrenInput

/** Ids to hard-delete, passed under `remove` on PATCH — a row omitted from the arrays above is left untouched, NOT deleted; only ids listed here are removed. */
export interface PniRemoveInput {
  vesselIds?:           string[]
  insuranceBlockIds?:   string[]
  provisionIds?:        string[]
  deductibleIds?:       string[]
  installmentIds?:      string[]
  requiredDocumentIds?: string[]
  organizationRoleIds?: string[]
  coverRestrictionIds?: string[]
}

/** PATCH /pni/quotations/:quotationId body. All top-level keys optional; each child array entry upserts by presence/absence of `id`. */
export type UpdatePniQuotationPayload = {
  quotation?: Partial<PniQuotationFieldsInput> & { clientId?: string }
  pni?:       UpdatePniFieldsInput
  remove?:    PniRemoveInput
} & PniChildrenInput