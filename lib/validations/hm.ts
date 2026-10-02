// FILE: lib/validations/hm.ts

import { z } from 'zod'
import { optionalNonNegativeNumber } from './numeric'

// ═══════════════════════════════════════════════════════════════
// H&M FORM VALIDATION FOUNDATION
//
// Mirrors createHmQuotationSchema / updateHmQuotationSchema exactly
// (ppmi-workflow-backend-2/src/hm/hm.validation.ts) - both are the
// SAME schema on the backend (`hmFieldsSchema`), so one schema here
// covers both create and update, matching that.
//
// `percentage`/`amount`/`dueAfterDays` use `optionalNonNegativeNumber`
// for the same NaN-on-empty-input reason documented in
// lib/validations/numeric.ts (used the same way by
// lib/validations/pni.ts). `percentage` additionally caps at 100,
// matching the backend's `z.number().min(0).max(100)`.
//
// The backend enforces two rules NOT expressible as a per-row Zod
// shape (both happen in hm.service.ts, not hmFieldsSchema itself):
//   - installmentNo values must be unique across the array (400 if not)
//   - if premiumPaymentEnabled is true at SUBMIT time (not create/update
//     time), technical-quotation-validation.service.ts requires exactly
//     4 installments before allowing WAITING_APPROVAL
// Both are mirrored below as array-level .superRefine checks so the
// Phase 3B form can surface them before hitting the API, without
// duplicating backend business logic beyond what's already documented.
// adjusterIds/surveyorIds duplicate-check (`idListSchema`'s `.refine`)
// IS expressible as a per-array Zod rule and is mirrored directly.
// ═══════════════════════════════════════════════════════════════

const uniqueIdsSchema = z
  .array(z.string().min(1))
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'IDs must not contain duplicates',
  })

export const hmInstallmentSchema = z.object({
  installmentNo: z.number().int().positive(),
  percentage:    optionalNonNegativeNumber.refine((v) => v === undefined || v <= 100, {
    message: 'Percentage cannot exceed 100',
  }),
  dueAfterDays:  z.number().int().nonnegative().optional(),
  amount:        optionalNonNegativeNumber,
  currency:      z.string().length(3).optional(),
  dueDate:       z.string().optional(),
  sortOrder:     z.number().int().min(0).optional(),
})

const hmFieldsSchema = z.object({
  vesselType:            z.string().optional(),
  tradingWarranty:       z.string().optional(),
  premiumPaymentEnabled: z.boolean().optional(),
  brokerageEnabled:      z.boolean().optional(),
  installments:          z.array(hmInstallmentSchema).optional(),
  adjusterIds:           uniqueIdsSchema.optional(),
  surveyorIds:           uniqueIdsSchema.optional(),
})

function withArrayRules<T extends typeof hmFieldsSchema>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const installments = data.installments
    if (!installments) return
    const numbers = installments.map((i) => i.installmentNo)
    if (new Set(numbers).size !== numbers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installments'],
        message: 'Installment numbers must be unique',
      })
    }
    // Mirrors technical-quotation-validation.service.ts's submit-time
    // rule. Enforced here as a heads-up only — the backend is the
    // authority and re-checks this independently at submit time, not
    // at create/update time (a draft may legitimately be saved with
    // 0-3 installments while premiumPaymentEnabled is still true).
    if (data.premiumPaymentEnabled && installments.length > 0 && installments.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installments'],
        message: 'Exactly 4 installments are required before this quotation can be submitted (when Premium Payment is enabled)',
      })
    }
  })
}

export const createHmQuotationSchema = withArrayRules(hmFieldsSchema)
export const updateHmQuotationSchema = withArrayRules(hmFieldsSchema)

export type HmInstallmentFormValues = z.infer<typeof hmInstallmentSchema>
export type CreateHmQuotationFormValues = z.infer<typeof createHmQuotationSchema>
export type UpdateHmQuotationFormValues = z.infer<typeof updateHmQuotationSchema>

// ─── Form-level schemas (Phase 3B) ─────────────────────────────
// The H&M create flow is two backend calls (POST /quotations, then
// POST /hm/quotations/:id) presented as one form — these schemas
// cover BOTH steps' fields together. Base-Quotation fields here
// mirror createQuotationSchema/updateQuotationSchema exactly (see
// quotations.validation.ts) — kept local to this file rather than
// added to lib/validations/quotation.ts, matching the same
// per-domain-subset pattern lib/validations/pni.ts already uses for
// its own `pniQuotationFieldsSchema`.

export const hmInlineClientSchema = z.object({
  name:          z.string().optional(),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().optional(),
  contactPerson: z.string().optional(),
})

const hmQuotationBaseFieldsSchema = z.object({
  clientId:            z.string().min(1).optional(),
  insured:             z.string().optional(),
  address:             z.string().optional(),
  recipient:           z.string().optional(),
  attentionTo:         z.string().optional(),
  quotationDate:       z.string().optional(),
  periodStart:         z.string().optional(),
  periodEnd:           z.string().optional(),
  periodText:          z.string().optional(),
  interest:            z.string().optional(),
  sumInsured:          optionalNonNegativeNumber,
  sumInsuredCurrency:  z.string().length(3).optional(),
  rate:                optionalNonNegativeNumber,
  premium:             optionalNonNegativeNumber,
  deductible:          optionalNonNegativeNumber,
  deductibleText:      z.string().optional(),
  deductibleBasis:     z.string().optional(),
  brokerage:           optionalNonNegativeNumber,
  insuranceLabelValue: z.string().optional(),
  confirmedAcceptedBy: z.string().optional(),
  templateVersion:     z.string().optional(),
})

export const createHmQuotationFormSchema = z
  .object({
    clientMode: z.enum(['existing', 'new']),
    client:     hmInlineClientSchema.optional(),
    insuranceTypeId: z.string().min(1, 'Insurance Type is required'),
  })
  .merge(hmQuotationBaseFieldsSchema)
  .merge(hmFieldsSchema)
  .superRefine((data, ctx) => {
    if (data.clientMode === 'existing' && !data.clientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select an existing client', path: ['clientId'] })
    }
    if (data.clientMode === 'new' && !data.client?.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Client name is required', path: ['client', 'name'] })
    }
    const installments = data.installments
    if (installments) {
      const numbers = installments.map((i) => i.installmentNo)
      if (new Set(numbers).size !== numbers.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['installments'], message: 'Installment numbers must be unique' })
      }
      if (data.premiumPaymentEnabled && installments.length > 0 && installments.length !== 4) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['installments'], message: 'Exactly 4 installments are required before this quotation can be submitted' })
      }
    }
  })

export type CreateHmQuotationFormData = z.infer<typeof createHmQuotationFormSchema>

/** No clientMode/inline client on update — mirrors updateQuotationSchema (clientId may change; no inline-create on update), same convention as lib/validations/pni.ts's update form schema. */
export const updateHmQuotationFormSchema = hmQuotationBaseFieldsSchema.merge(hmFieldsSchema.partial())

export type UpdateHmQuotationFormData = z.infer<typeof updateHmQuotationFormSchema>