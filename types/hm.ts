// FILE: types/hm.ts

// ═══════════════════════════════════════════════════════════════
// H&M (HULL & MACHINERY) DOMAIN TYPES
//
// Modeled directly from the current backend source
// (ppmi-workflow-backend-2/src/hm/hm.validation.ts, hm.service.ts,
// prisma/schema.prisma — model HmQuotation / HmQuotationInstallment).
// Nothing invented.
//
// Reuses shared types from types/quotation.ts (QuotationClientRef,
// QuotationInsuranceTypeRef, QuotationAdjusterEntry,
// QuotationSurveyorEntry, HmQuotationInstallmentSummary) rather than
// duplicating them — the latter was already added there in Phase 1
// for the *minimal* summary nested inside GET /quotations/:id
// (`quotation.hmQuotation`). This file's `HmQuotationDetail` is the
// richer shape returned by the H&M-specific endpoints themselves
// (GET/POST/PATCH /hm/quotations/:quotationId), which additionally
// nests the full `quotation` (client, insuranceType, adjusters,
// surveyors) — that richer nesting is NOT present on the summary.
//
// Word-doc field mapping (MASTER_-_QS_HM_280.docx), confirmed against
// the current backend contract:
//   No / Date / To / Attn              -> base Quotation: quotationNumber (auto) / quotationDate / recipient / attentionTo
//   TYPE INSURANCE                     -> base Quotation: insuranceTypeId (selects the HM InsuranceType row)
//   THE INSURED / ADDRESS              -> base Quotation: insured / address
//   INTEREST                           -> base Quotation: interest (free text; HM's fixed wording is typed in, not enumerated)
//   SUM INSURED                        -> base Quotation: sumInsured / sumInsuredCurrency
//   PERIODE                            -> base Quotation: periodText (periodStart/periodEnd also available if a date range is preferred)
//   TYPE OF VESSEL                     -> HmQuotation.vesselType
//   TRADING WARRANTY                   -> HmQuotation.tradingWarranty
//   Terms & Conditions clause bundle,
//   Warranties (Cl.280, Cl.294, Bankers
//   Clause, etc. - "Bisa di edit"/     -> generic QuotationTerm / QuotationWarranty (types/quotation.ts) -
//   "Bisa dihapus" annotations)          isEditable/isRemovable/selectionGroup fields already model this
//   Nominated Adjuster Clause /
//   Surveyor Clause firm lists         -> QuotationAdjuster / QuotationSurveyor via adjusterIds/surveyorIds below
//   Premium Payment (4-installment     -> HmQuotation.installments[] + premiumPaymentEnabled
//   schedule, "Bisa di hapus")           (the removable toggle - see hm.validation.ts)
//   Deductible ("...% of Sum Insured") -> base Quotation: deductibleText / deductibleBasis (formula-like text, not a clean number)
//   Rate                               -> base Quotation: rate
//   Brokerage ("Bisa di hapus")        -> base Quotation: brokerage + HmQuotation.brokerageEnabled (the removable toggle)
//   "Insurance" footer field           -> base Quotation: insuranceLabelValue (resolves the ambiguity flagged in the earlier field audit)
//   Confirmed & Accepted by            -> base Quotation: confirmedAcceptedBy
//
// No dedicated HmQuotation field exists for "TYPE OF VESSEL" as a
// selectable list, or for a standard-wording auto-populate mechanism
// on TRADING WARRANTY - both remain plain free text, matching the
// backend's actual (untyped, optional string) schema exactly.
// ═══════════════════════════════════════════════════════════════

import type {
  QuotationClientRef,
  QuotationInsuranceTypeRef,
  QuotationAdjusterEntry,
  QuotationSurveyorEntry,
  HmQuotationInstallmentSummary,
} from './quotation'

// ─── Response shape (GET / POST / PATCH /hm/quotations/:quotationId) ───
// Mirrors hm.service.ts's detailInclude() exactly.

export interface HmQuotationDetail {
  id:                    string
  quotationId:           string
  vesselType:            string | null
  tradingWarranty:       string | null
  premiumPaymentEnabled: boolean
  brokerageEnabled:      boolean
  installments:          HmQuotationInstallmentSummary[]
  quotation: {
    id:              string
    quotationNumber: string
    status:          string
    client:          QuotationClientRef & { id: string }
    insuranceType:   QuotationInsuranceTypeRef & { id: string }
    adjusters:       QuotationAdjusterEntry[]
    surveyors:       QuotationSurveyorEntry[]
    [key: string]:   unknown // remaining base Quotation scalar fields - see types/quotation.ts Quotation for the full field list
  }
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ─── Create/Update payloads ─────────────────────────────────────
// Mirror createHmQuotationSchema / updateHmQuotationSchema exactly -
// both are the SAME schema on the backend (`hmFieldsSchema`), so
// Create and Update share one input shape here too (all fields
// optional either way; POST additionally 400s server-side if H&M
// detail already exists for this quotationId - see hm.service.ts).

export interface HmInstallmentInput {
  installmentNo:  number
  percentage?:    number // 0-100
  dueAfterDays?:  number
  amount?:        number
  currency?:      string // exactly 3 chars
  dueDate?:       string
  sortOrder?:     number
}

export interface HmQuotationFieldsInput {
  vesselType?:            string
  tradingWarranty?:       string
  premiumPaymentEnabled?: boolean
  brokerageEnabled?:      boolean
  /** Full-replace sync on submit - installmentNo values must be unique; enforced server-side (400 otherwise). Omit entirely to leave installments unchanged. */
  installments?:          HmInstallmentInput[]
  /** Full-replace sync - must be existing, active Adjuster ids, no duplicates (enforced server-side). Omit to leave unchanged; pass [] to clear. */
  adjusterIds?:           string[]
  /** Full-replace sync - must be existing, active Surveyor ids, no duplicates (enforced server-side). Omit to leave unchanged; pass [] to clear. */
  surveyorIds?:           string[]
}

export type CreateHmQuotationPayload = HmQuotationFieldsInput
export type UpdateHmQuotationPayload = HmQuotationFieldsInput