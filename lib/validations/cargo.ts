// FILE: lib/validations/cargo.ts

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// CARGO FORM VALIDATION FOUNDATION
//
// Mirrors createCargoQuotationSchema / updateCargoQuotationSchema
// exactly (ppmi-workflow-backend-2/src/cargo/cargo.validation.ts) -
// both are the SAME schema on the backend (`cargoFieldsSchema`), so
// one schema here covers both create and update, matching that
// (same convention as lib/validations/hm.ts's raw schemas).
//
// The backend enforces one rule NOT expressible in this per-field
// shape (in technical-quotation-validation.service.ts, not
// cargoFieldsSchema itself): at SUBMIT time (not create/update time),
// `instituteCargoClause` must be set or the quotation cannot move to
// WAITING_APPROVAL. Not mirrored as a .superRefine here since
// `instituteCargoClause` is genuinely optional at save time (a draft
// may legitimately be saved before the clause is chosen) - the
// Phase 4B form should surface this as a submit-time warning, the
// same way lib/validations/hm.ts's installment-count rule does.
//
// adjusterIds/surveyorIds duplicate-check mirrors the backend's
// `idListSchema` exactly, same as lib/validations/hm.ts.
// ═══════════════════════════════════════════════════════════════

const uniqueIdsSchema = z
  .array(z.string().min(1))
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'IDs must not contain duplicates',
  })

export const cargoInstituteClauseSchema = z.enum([
  'INSTITUTE_CARGO_A',
  'INSTITUTE_CARGO_B',
  'INSTITUTE_CARGO_C',
  'INSTITUTE_BULK_OIL',
  'INSTITUTE_COAL',
  'INSTITUTE_CARGO_AIR',
])

const cargoFieldsSchema = z.object({
  interestInsured:      z.string().optional(),
  voyageFrom:           z.string().optional(),
  voyageTo:             z.string().optional(),
  etd:                  z.string().optional(),
  eta:                  z.string().optional(),
  conveyance:           z.string().optional(),
  instituteCargoClause: cargoInstituteClauseSchema.optional(),
  adjusterIds:          uniqueIdsSchema.optional(),
  surveyorIds:          uniqueIdsSchema.optional(),
})

export const createCargoQuotationSchema = cargoFieldsSchema
export const updateCargoQuotationSchema = cargoFieldsSchema

export type CreateCargoQuotationFormValues = z.infer<typeof createCargoQuotationSchema>
export type UpdateCargoQuotationFormValues = z.infer<typeof updateCargoQuotationSchema>