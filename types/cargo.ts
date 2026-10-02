// FILE: types/cargo.ts

// ═══════════════════════════════════════════════════════════════
// CARGO (MARINE CARGO) DOMAIN TYPES
//
// Modeled directly from the current backend source
// (ppmi-workflow-backend-2/src/cargo/cargo.validation.ts,
// cargo.service.ts, prisma/schema.prisma — model CargoQuotation).
// Nothing invented. Architecture is structurally identical to H&M
// (types/hm.ts) — same two-step create, same "no list endpoint",
// same redundant /cargo/template vs. the shared
// /quotation-references/templates/CARGO — see lib/api/cargo.ts.
//
// Reuses CargoInstituteClause and the shared quotation ref types from
// types/quotation.ts rather than duplicating them.
//
// Word-doc field mapping (MASTER_-_QS_CARGO.docx), confirmed against
// the current backend contract:
//   No / Date / To / Attn   -> base Quotation: quotationNumber (auto) / quotationDate / recipient / attentionTo
//   TYPE INSURANCE          -> base Quotation: insuranceTypeId (selects the CARGO InsuranceType row)
//   THE INSURED / ADDRESS   -> base Quotation: insured / address
//   INTEREST INSURED        -> CargoQuotation.interestInsured (NOT base `interest` — Cargo's own dedicated field, unlike H&M/P&I which reuse the base one)
//   SUM INSURED             -> base Quotation: sumInsured / sumInsuredCurrency
//   VOYAGE FROM / TO        -> CargoQuotation.voyageFrom / voyageTo
//   SAILING DATE ETD / ETA  -> CargoQuotation.etd / eta
//   CONVEYANCE              -> CargoQuotation.conveyance
//   Rate                    -> base Quotation: rate
//   Deductible              -> base Quotation: deductibleText / deductibleBasis / deductible
//   Institute Cargo Clause
//   (A/B/C/Bulk Oil/Coal/   -> CargoQuotation.instituteCargoClause (single enum — the ONLY
//   Air) - "Bisa dipilih       Word-doc "pick one" group with a real backend field)
//   salah satu"
//   Nominated Adjuster /
//   Surveyor Clause lists   -> QuotationAdjuster / QuotationSurveyor via adjusterIds/surveyorIds below
//
// CONTRACT GAP (unchanged from the original Word-doc audit): the
// ~35-item additional clause list (Institute Time Clauses Freight,
// Sanction Limitation Exclusion Clause, Terrorism Exclusion Clause,
// etc.) has NO dedicated CargoQuotation field. No fake payload field
// is added for it here — if ever represented, it would go through the
// generic QuotationTerm resource (types/quotation.ts), not this file.
// ═══════════════════════════════════════════════════════════════

import type {
  QuotationClientRef,
  QuotationInsuranceTypeRef,
  QuotationAdjusterEntry,
  QuotationSurveyorEntry,
  CargoInstituteClause,
} from './quotation'

export type { CargoInstituteClause }

// ─── Response shape (GET / POST / PATCH /cargo/quotations/:quotationId) ───
// Mirrors cargo.service.ts's detailInclude() exactly.

export interface CargoQuotationDetail {
  id:                   string
  quotationId:          string
  interestInsured:      string | null
  voyageFrom:           string | null
  voyageTo:             string | null
  etd:                  string | null
  eta:                  string | null
  conveyance:           string | null
  instituteCargoClause: CargoInstituteClause | null
  quotation: {
    id:              string
    quotationNumber: string
    status:          string
    client:          QuotationClientRef & { id: string }
    insuranceType:   QuotationInsuranceTypeRef & { id: string }
    adjusters:       QuotationAdjusterEntry[]
    surveyors:       QuotationSurveyorEntry[]
    [key: string]:   unknown // remaining base Quotation scalar fields — see types/quotation.ts Quotation for the full field list
  }
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ─── Create/Update payloads ─────────────────────────────────────
// Mirror createCargoQuotationSchema / updateCargoQuotationSchema
// exactly — both are the SAME schema on the backend
// (`cargoFieldsSchema`), so Create and Update share one input shape
// here too, same convention as types/hm.ts.

export interface CargoQuotationFieldsInput {
  interestInsured?:      string
  voyageFrom?:           string
  voyageTo?:             string
  etd?:                  string
  eta?:                  string
  conveyance?:           string
  instituteCargoClause?: CargoInstituteClause
  /** Full-replace sync — must be existing, active Adjuster ids, no duplicates (enforced server-side). Omit to leave unchanged; pass [] to clear. */
  adjusterIds?:          string[]
  /** Full-replace sync — must be existing, active Surveyor ids, no duplicates (enforced server-side). Omit to leave unchanged; pass [] to clear. */
  surveyorIds?:          string[]
}

export type CreateCargoQuotationPayload = CargoQuotationFieldsInput
export type UpdateCargoQuotationPayload = CargoQuotationFieldsInput