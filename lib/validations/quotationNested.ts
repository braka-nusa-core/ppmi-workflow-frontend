import { z } from 'zod'
import { optionalNonNegativeNumber } from './numeric'

// ═══════════════════════════════════════════════════════════════
// NESTED QUOTATION DATA — VALIDATION
//
// Mirrors createQuotationObjectSchema / createQuotationCoverageSchema /
// createQuotationTermSchema / createQuotationWarrantySchema exactly
// (ppmi-workflow-backend-2/src/quotations/quotation-{objects,
// coverages,terms,warranties}.validation.ts). Create and update
// schemas are identical on the backend for all four resources, so
// one schema per resource is used for both modes.
// ═══════════════════════════════════════════════════════════════

// ─── Objects ───────────────────────────────────────────────────
// Backend: { objectType: string (required on create), data: z.any() }.
// `data` is genuinely arbitrary JSON with no fixed shape anywhere in
// the codebase (Prisma Json column, no schema, no existing business
// usage found) — represented here as a simple key/value row editor
// rather than inventing a vessel-specific schema or a raw JSON
// textarea. Keys/values are both plain strings; the array of rows is
// serialized into a plain object before being sent as `data`.
export const objectFormSchema = z.object({
  objectType: z.string().min(1, 'Object type is required'),
  dataRows: z.array(
    z.object({
      key:   z.string(),
      value: z.string(),
    })
  ),
})
export type ObjectFormData = z.infer<typeof objectFormSchema>

// ─── Coverages ─────────────────────────────────────────────────
// Backend: { coverageType?, description?, value?: number }.
// `value` is a Prisma Decimal column on read (arrives as a numeric
// string — see types/quotation.ts), but the create/update DTO itself
// takes a plain `z.number()`, so the form field is a real number
// input, not a string. Uses optionalNonNegativeNumber (Phase 3C) to
// avoid sending NaN when the field is left blank.
export const coverageFormSchema = z.object({
  coverageType: z.string().optional(),
  description:  z.string().optional(),
  value:        optionalNonNegativeNumber,
})
export type CoverageFormData = z.infer<typeof coverageFormSchema>

// ─── Terms ─────────────────────────────────────────────────────
// Backend: { termsConditionId?: string, description?: string }.
// KNOWN GAP: there is no terms-conditions master-data endpoint
// anywhere in the backend, so there is no way to look up or validate
// a real termsConditionId. This form only exposes `description` —
// see the Phase 3B report for details; termsConditionId is
// deliberately left unset rather than asking the user to type a raw
// ID with no way to verify it.
export const termFormSchema = z.object({
  description: z.string().optional(),
})
export type TermFormData = z.infer<typeof termFormSchema>

// ─── Warranties ────────────────────────────────────────────────
// Same gap as Terms: no warranty master-data endpoint exists, so
// warrantyId is deliberately left unset. Only `description` is
// exposed in the form.
export const warrantyFormSchema = z.object({
  description: z.string().optional(),
})
export type WarrantyFormData = z.infer<typeof warrantyFormSchema>