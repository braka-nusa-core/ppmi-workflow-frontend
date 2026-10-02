// FILE: lib/validations/pni.ts

import { z } from 'zod'
import { optionalNonNegativeNumber } from './numeric'

// ═══════════════════════════════════════════════════════════════
// P&I FORM VALIDATION FOUNDATION
//
// Mirrors createPniQuotationSchema / updatePniQuotationSchema exactly
// (ppmi-workflow-backend-2/src/pni/pni.validation.ts). No stricter
// business rules were added beyond what the backend itself enforces,
// with one exception noted below (vesselRefs/scope pairing), which
// mirrors a rule the backend enforces imperatively in pni.service.ts
// (assertProvisionScope/assertDeductibleScope) rather than in its zod
// schema — surfacing it client-side avoids a round-trip 400.
//
// Numeric fields use `optionalNonNegativeNumber` (lib/validations/
// numeric.ts) for the same NaN-on-empty-input reason documented
// there — every amountSchema-backed field on the backend (rate,
// premium, deductible, brokerage, maximumInsured, annualPremium,
// limitAmount, grossTonnage, installment amount, etc.) uses it here.
//
// Dates: mirrors the backend exactly — plain `z.string().optional()`,
// no format/date validation, matching quotation.ts's convention of
// passing native `<input type="date">` values straight through.
//
// This file defines SHAPES only — no React Hook Form resolvers,
// discriminated `clientMode` UI helper, or payload-builder functions
// yet (those belong to the Phase 2B form itself, mirroring the
// pattern in lib/validations/quotation.ts's createQuotationFormSchema
// / toCreateQuotationPayload once the form exists).
// ═══════════════════════════════════════════════════════════════

const clubFormatSchema = z.enum([
  'INIGO_SYNDICATE_1301',
  'EAGLE_OCEAN_MARINE',
  'MSIG_SPECIALTY_MARINE_NV',
])

const jsonSchema = z.record(z.string(), z.unknown())
const identifierSchema = z.string().min(1)

// clientId XOR client — same inline-client shape as
// lib/validations/quotation.ts's inlineClientSchema (requiredness
// enforced contextually by the Phase 2B form, not at the shape level,
// for the same reason documented there).
export const pniInlineClientSchema = z.object({
  name:          z.string().optional(),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().optional(),
  contactPerson: z.string().optional(),
})

export const pniQuotationFieldsSchema = z.object({
  clientId:        identifierSchema.optional(),
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
})

export const pniFieldsSchema = z.object({
  clubFormat:            clubFormatSchema,
  referenceNumber:       z.string().optional(),
  validityDays:          z.number().int().positive().optional(),
  assuredDomicile:       z.string().optional(),
  broker:                z.string().optional(),
  insurerOrSecurity:     z.string().optional(),
  tradingLimits:         z.string().optional(),
  paymentTermsText:      z.string().optional(),
  subjectivities:        z.string().optional(),
  importantInformation:  z.string().optional(),
  signatureName:         z.string().optional(),
  signatureCity:         z.string().optional(),
  signatureDate:         z.string().optional(),
  details:               jsonSchema.optional(),
})

export const pniVesselSchema = z.object({
  id:                 identifierSchema.optional(),
  key:                identifierSchema.optional(),
  name:               z.string().min(1, 'Vessel name is required'),
  imoNumber:          z.string().optional(),
  vesselType:         z.string().optional(),
  builtYear:          z.number().int().min(1800).max(3000).optional(),
  flag:               z.string().optional(),
  vesselClass:        z.string().optional(),
  classNotApplicable: z.boolean().optional(),
  grossTonnage:       optionalNonNegativeNumber,
  portOfRegistry:     z.string().optional(),
  sortOrder:          z.number().int().min(0).optional(),
  details:            jsonSchema.optional(),
})

export const pniInsuranceBlockSchema = z.object({
  id:                     identifierSchema.optional(),
  key:                    identifierSchema.optional(),
  inheritsFromBlockRef:   identifierSchema.nullable().optional(),
  typeOfInsurance:        z.string().min(1, 'Type of Insurance is required'),
  security:               z.string().optional(),
  policyWordingReference: z.string().optional(),
  tradingArea:            z.string().optional(),
  paymentWarrantyText:    z.string().optional(),
  maximumInsured:         optionalNonNegativeNumber,
  currency:               z.string().length(3).optional(),
  premium:                optionalNonNegativeNumber,
  premiumBasis: z
    .enum(['PER_ANNUM', 'PER_VESSEL_PER_ANNUM', 'PRO_RATA', 'INCLUDED_NO_ADDITIONAL_CHARGE', 'OTHER'])
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  details:   jsonSchema.optional(),
})
// A block referencing itself as its own inheritance source is
// rejected server-side (400) — checked at submit time in the Phase 2B
// form (where both `key`/`id` values across the whole array are known
// together), not representable as a per-row shape rule here.

export const pniVesselCoverageSchema = z.object({
  id:                identifierSchema.optional(),
  vesselRef:         identifierSchema,
  insuranceBlockRef: identifierSchema,
  annualPremium:     optionalNonNegativeNumber,
  limitAmount:       optionalNonNegativeNumber,
  currency:          z.string().length(3).optional(),
  details:           jsonSchema.optional(),
})

const scopedVesselRefsRefinement = <
  T extends { scope?: string; vesselRefs?: string[] }
>(data: T, ctx: z.RefinementCtx) => {
  const hasRefs = Boolean(data.vesselRefs && data.vesselRefs.length > 0)
  if (data.scope === 'SELECTED_VESSELS' && !hasRefs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['vesselRefs'],
      message: 'Select at least one vessel when scope is Selected Vessels',
    })
  }
  if (data.scope !== 'SELECTED_VESSELS' && hasRefs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['vesselRefs'],
      message: 'Vessel selection only applies when scope is Selected Vessels',
    })
  }
}

export const pniProvisionSchema = z
  .object({
    id:                identifierSchema.optional(),
    insuranceBlockRef: identifierSchema.nullable().optional(),
    type:              z.enum(['CONDITION', 'CLAUSE', 'EXCLUSION', 'WARRANTY']),
    source:            z.enum(['PREDEFINED', 'CUSTOM']).optional(),
    scope:             z.enum(['QUOTE', 'ALL_VESSELS', 'SELECTED_VESSELS']).optional(),
    title:             z.string().min(1, 'Title is required'),
    content:           z.string().optional(),
    reference:         z.string().optional(),
    conditionRule:     jsonSchema.optional(),
    sortOrder:         z.number().int().min(0).optional(),
    vesselRefs:        z.array(identifierSchema).optional(),
  })
  .superRefine(scopedVesselRefsRefinement)

export const pniDeductibleSchema = z
  .object({
    id:                identifierSchema.optional(),
    insuranceBlockRef: identifierSchema,
    scope:             z.enum(['FLAT', 'CLAIM_CATEGORY', 'ALL_VESSELS', 'SELECTED_VESSELS']),
    claimCategory:     z.string().optional(),
    amount:            optionalNonNegativeNumber,
    currency:          z.string().length(3).optional(),
    description:       z.string().optional(),
    sortOrder:         z.number().int().min(0).optional(),
    vesselRefs:        z.array(identifierSchema).optional(),
  })
  .superRefine(scopedVesselRefsRefinement)

export const pniInstallmentSchema = z.object({
  id:            identifierSchema.optional(),
  installmentNo: z.number().int().positive(),
  amount:        optionalNonNegativeNumber,
  currency:      z.string().length(3).optional(),
  dueDate:       z.string().optional(),
})

export const pniRequiredDocumentSchema = z.object({
  id:         identifierSchema.optional(),
  name:       z.string().min(1, 'Document name is required'),
  isRequired: z.boolean().optional(),
  sortOrder:  z.number().int().min(0).optional(),
})

export const pniOrganizationRoleSchema = z.object({
  id:           identifierSchema.optional(),
  organization: z.string().optional(),
  role:         z.string().min(1, 'Role is required'),
  sortOrder:    z.number().int().min(0).optional(),
})

export const pniCoverRestrictionSchema = z.object({
  id:                identifierSchema.optional(),
  insuranceBlockRef: identifierSchema.nullable().optional(),
  name:              z.string().min(1, 'Name is required'),
  partReference:     z.string().optional(),
  sectionReference:  z.string().optional(),
  isSelected:        z.boolean().optional(),
  sortOrder:         z.number().int().min(0).optional(),
})

const pniChildrenSchema = z.object({
  vessels:           z.array(pniVesselSchema).optional(),
  insuranceBlocks:   z.array(pniInsuranceBlockSchema).optional(),
  vesselCoverages:   z.array(pniVesselCoverageSchema).optional(),
  provisions:        z.array(pniProvisionSchema).optional(),
  deductibles:       z.array(pniDeductibleSchema).optional(),
  installments:      z.array(pniInstallmentSchema).optional(),
  requiredDocuments: z.array(pniRequiredDocumentSchema).optional(),
  organizationRoles: z.array(pniOrganizationRoleSchema).optional(),
  coverRestrictions: z.array(pniCoverRestrictionSchema).optional(),
})

const pniRemoveSchema = z.object({
  vesselIds:           z.array(identifierSchema).optional(),
  insuranceBlockIds:   z.array(identifierSchema).optional(),
  provisionIds:        z.array(identifierSchema).optional(),
  deductibleIds:       z.array(identifierSchema).optional(),
  installmentIds:      z.array(identifierSchema).optional(),
  requiredDocumentIds: z.array(identifierSchema).optional(),
  organizationRoleIds: z.array(identifierSchema).optional(),
  coverRestrictionIds: z.array(identifierSchema).optional(),
})

/** Mirrors createPniQuotationSchema — clientId XOR client, same as lib/validations/quotation.ts's top-level create schema. */
export const createPniQuotationSchema = z
  .object({
    quotation: pniQuotationFieldsSchema.extend({
      insuranceTypeId: identifierSchema,
      client:          pniInlineClientSchema.optional(),
    }),
    pni: pniFieldsSchema,
  })
  .merge(pniChildrenSchema)
  .refine((data) => Boolean(data.quotation.clientId || data.quotation.client), {
    message: 'Either an existing client or a new client is required',
    path:    ['quotation', 'clientId'],
  })
  .refine((data) => !(data.quotation.clientId && data.quotation.client), {
    message: 'Provide either an existing client or a new client, not both',
    path:    ['quotation', 'clientId'],
  })

/** Mirrors updatePniQuotationSchema. */
export const updatePniQuotationSchema = z
  .object({
    quotation: pniQuotationFieldsSchema.partial().optional(),
    pni:       pniFieldsSchema.partial().optional(),
    remove:    pniRemoveSchema.optional(),
  })
  .merge(pniChildrenSchema)

export type PniVesselFormValues = z.infer<typeof pniVesselSchema>
export type PniInsuranceBlockFormValues = z.infer<typeof pniInsuranceBlockSchema>
export type PniProvisionFormValues = z.infer<typeof pniProvisionSchema>
export type PniDeductibleFormValues = z.infer<typeof pniDeductibleSchema>
export type CreatePniQuotationFormValues = z.infer<typeof createPniQuotationSchema>
export type UpdatePniQuotationFormValues = z.infer<typeof updatePniQuotationSchema>

// ─── Form-level schemas (Phase 2B) ─────────────────────────────
// `clientMode` mirrors lib/validations/quotation.ts's
// createQuotationFormSchema exactly — form-only discriminator,
// stripped before building the API payload, never sent as-is.

export const createPniQuotationFormSchema = z
  .object({
    clientMode: z.enum(['existing', 'new']),
    clientId:   z.string().optional(),
    client:     pniInlineClientSchema.optional(),
    insuranceTypeId: identifierSchema,
    ...pniQuotationFieldsSchema.omit({ clientId: true }).shape,
    pni: pniFieldsSchema,
  })
  .merge(pniChildrenSchema)
  .superRefine((data, ctx) => {
    if (data.clientMode === 'existing' && !data.clientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select an existing client', path: ['clientId'] })
    }
    if (data.clientMode === 'new' && !data.client?.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Client name is required', path: ['client', 'name'] })
    }
  })

export type CreatePniQuotationFormData = z.infer<typeof createPniQuotationFormSchema>

/** No `clientMode`/inline `client` on update — mirrors updatePniQuotationSchema (clientId may change; no inline-create on update). */
export const updatePniQuotationFormSchema = z
  .object({
    clientId: z.string().optional(),
    ...pniQuotationFieldsSchema.omit({ clientId: true }).shape,
    pni: pniFieldsSchema.partial(),
  })
  .merge(pniChildrenSchema)

export type UpdatePniQuotationFormData = z.infer<typeof updatePniQuotationFormSchema>

/**
 * Whole-array checks the backend enforces imperatively in
 * pni.service.ts's applyChildren (not expressible as a per-row Zod
 * shape): an insurance block cannot inherit itself. Run this at
 * submit time, in addition to (not instead of) the per-row
 * `.superRefine` scope/vesselRefs check above. Returns a list of
 * `{ index, message }` for any offending insuranceBlocks row.
 */
export function findSelfInheritingBlocks(
  blocks: { key?: string; id?: string; inheritsFromBlockRef?: string | null }[]
): { index: number; message: string }[] {
  const issues: { index: number; message: string }[] = []
  blocks.forEach((block, index) => {
    const ownRef = block.id ?? block.key
    if (ownRef && block.inheritsFromBlockRef && block.inheritsFromBlockRef === ownRef) {
      issues.push({ index, message: 'An insurance block cannot inherit itself' })
    }
  })
  return issues
}