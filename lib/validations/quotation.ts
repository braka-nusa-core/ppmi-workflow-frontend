import { z } from 'zod'
import { optionalNonNegativeNumber } from './numeric'

// ═══════════════════════════════════════════════════════════════
// QUOTATION FORM VALIDATION
//
// Mirrors createQuotationSchema / updateQuotationSchema exactly
// (ppmi-workflow-backend-2/src/quotations/quotations.validation.ts).
// No stricter business rules were added beyond what the backend
// itself enforces — the only addition is the `clientMode` UI
// discriminator (stripped before building the API payload; see
// toCreateQuotationPayload / toUpdateQuotationPayload below).
//
// Numeric fields (rate/premium/deductible/brokerage) are `z.number()`
// on the backend's CREATE/UPDATE DTOs — that's the request-side shape.
// This is unrelated to the READ-side Decimal-as-string concern from
// Phase 2 (types/quotation.ts) — inputs here are real HTML number
// inputs with `valueAsNumber`, so there's no string-formatting risk
// to begin with. They ARE, however, subject to the native
// `input.valueAsNumber === NaN` quirk when left blank — handled by
// `optionalNonNegativeNumber` (see lib/validations/numeric.ts, added
// in Phase 3C after this was found to silently block submission).
//
// Dates: the backend validates quotationDate/periodStart/periodEnd as
// plain `z.string().optional()` with NO format/date validation at
// all. Native `<input type="date">` already yields a bare
// "YYYY-MM-DD" string with no timezone conversion — passed straight
// through, deliberately never wrapped in `new Date(...)`.
// ═══════════════════════════════════════════════════════════════

// The inline client sub-object is deliberately NOT required at the
// shape level (no `.min(1)` on `name` here) — requiredness is instead
// enforced contextually in `createQuotationFormSchema`'s superRefine,
// only when `clientMode === 'new'`. If this were required at the
// shape level, switching from "New Client" (with an incomplete name)
// back to "Existing Client" would fail the whole form's validation on
// the now-irrelevant stale `client` object, even though it's never
// sent in that mode (audited and fixed in Phase 3C).
const inlineClientSchema = z.object({
  name:          z.string().optional(),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().optional(),
  contactPerson: z.string().optional(),
})

const baseQuotationFields = {
  insuranceTypeId: z.string().min(1, 'Insurance type is required'),
  insured:         z.string().optional(),
  address:         z.string().optional(),
  quotationDate:   z.string().optional(),
  periodStart:     z.string().optional(),
  periodEnd:       z.string().optional(),
  interest:        z.string().optional(),
  rate:            optionalNonNegativeNumber,
  premium:         optionalNonNegativeNumber,
  deductible:      optionalNonNegativeNumber,
  brokerage:       optionalNonNegativeNumber,
  templateVersion: z.string().optional(),
}

// ─── Create ────────────────────────────────────────────────────
// `clientMode` is form-only — used to decide which of
// clientId/client to send, never sent to the backend itself.
export const createQuotationFormSchema = z
  .object({
    ...baseQuotationFields,
    clientMode: z.enum(['existing', 'new']),
    clientId:   z.string().optional(),
    client:     inlineClientSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === 'existing' && !data.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select an existing client',
        path: ['clientId'],
      })
    }
    if (data.clientMode === 'new' && !data.client?.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Client name is required',
        path: ['client', 'name'],
      })
    }
  })

export type CreateQuotationFormData = z.infer<typeof createQuotationFormSchema>

// ─── Update ────────────────────────────────────────────────────
// Mirrors updateQuotationSchema: clientId may change, but there is
// no `client` (inline) field on update at all — only create supports
// creating a client inline. No clientMode discriminator needed here.
export const updateQuotationFormSchema = z.object({
  insuranceTypeId: z.string().min(1).optional(),
  insured:         z.string().optional(),
  address:         z.string().optional(),
  quotationDate:   z.string().optional(),
  periodStart:     z.string().optional(),
  periodEnd:       z.string().optional(),
  interest:        z.string().optional(),
  rate:            optionalNonNegativeNumber,
  premium:         optionalNonNegativeNumber,
  deductible:      optionalNonNegativeNumber,
  brokerage:       optionalNonNegativeNumber,
  clientId:        z.string().optional(),
})

export type UpdateQuotationFormData = z.infer<typeof updateQuotationFormSchema>