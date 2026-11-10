// FILE: lib/quotation-templates/eagle/toPni.ts
// ═══════════════════════════════════════════════════════════════
// EAGLE OCEAN MARINE: EDITOR FORM DATA → P&I BACKEND PAYLOAD
//
// Paper field                    → backend field
//   QUOTATION No.                → pni.referenceNumber
//   Applicant / Address          → quotation.insured / quotation.address
//   Period of Insurance (text)   → quotation.periodText  (saved by the caller through PATCH /quotations/:id)
//   date beside the signature    → pni.signatureDate
//   Limits: USD …                → main block.maximumInsured
//   premium total row            → main block.premium
//   deductible slots             → CLAIM_CATEGORY deductibles of the main block (same category rule as fromPni)
//   per-vessel premium / limit   → vessel coverage under the main block
//   vessel table                 → pni.vessels[]
//   pinned template version      → quotation.templateVersion
// No backend column exists for: vessel heading, crew limit, WDCD sub-limit, the vessel “Id” column and the
// per-vessel co-assured roles — they are saved under `details.template` (pni.details / vessel.details), the
// backend’s free-form JSON, and read back by eagle/fromPni.ts.
// ═══════════════════════════════════════════════════════════════

import type { PniInsuranceBlock, PniQuotationDetail } from '@/types/pni'
import { clean, splitBlocks } from '../shared/fromPni'
import {
  contextIssues, mergeTemplateDetails, parseAmount, parseWhole, PniSaveError, quotationFields, textPatch, unclearable,
  type PniClientContext,
} from '../shared/toPni'
import type { PniWrite } from '../msig/toPni'
import { SLOT_CATEGORY_NAME, slotOfCategory } from './fromPni'
import { EAGLE_TEMPLATE } from './template'
import type { EagleAmountSlot, EagleFormData, EagleVessel } from './types'

type Loose = Record<string, unknown>

const BLOCK_TYPE = EAGLE_TEMPLATE.coassureds.cover   // the paper’s own “Protection and Indemnity”
const CURRENCY = 'USD'                                // fixed wording on the paper
const DEDUCTIBLE_SLOTS = Object.keys(SLOT_CATEGORY_NAME) as EagleAmountSlot[]

function vesselFields(v: EagleVessel, i: number, edit: boolean, persisted: Loose | undefined, issues: string[]): Loose {
  const n = i + 1
  if (!clean(v.name)) issues.push(`Vessel ${n} needs a name.`)
  const gt = parseAmount(`Vessel ${n} GT`, v.grossTonnage, issues)
  const built = parseWhole(`Vessel ${n} year built`, v.builtYear, issues, 1800, 3000)
  if (edit) {
    unclearable(issues, `Vessel ${n} GT`, gt, persisted?.grossTonnage as string | null)
    unclearable(issues, `Vessel ${n} year built`, built, persisted?.builtYear as number | null)
  }
  const roles = v.roles.filter((r) => clean(r.organisation) || clean(r.role)).map((r) => ({ organisation: r.organisation, role: r.role }))
  return {
    name: clean(v.name),
    vesselType: textPatch(v.vesselType, persisted?.vesselType, edit),
    imoNumber: textPatch(v.imoNumber, persisted?.imoNumber, edit),
    vesselClass: textPatch(v.vesselClass, persisted?.vesselClass, edit),
    grossTonnage: gt,
    builtYear: built,
    flag: textPatch(v.flag, persisted?.flag, edit),
    details: mergeTemplateDetails(persisted?.details, { vesselId: v.vesselId, roles }),
    sortOrder: i,
  }
}

interface Parsed { limit?: number; premium?: number; slots: Partial<Record<EagleAmountSlot, number>> }
function parseTotals(data: EagleFormData, issues: string[]): Parsed {
  const slots: Parsed['slots'] = {}
  for (const slot of DEDUCTIBLE_SLOTS) {
    const label = EAGLE_TEMPLATE.amountSlots.find((s) => s.slot === slot)?.label ?? slot
    const v = parseAmount(label, data.amounts[slot], issues)
    if (v !== undefined) slots[slot] = v
  }
  return { limit: parseAmount('Limits', data.limitAmount, issues), premium: parseAmount('Premium total', data.premiumTotal, issues), slots }
}

const pniDetails = (data: EagleFormData, original: unknown) => mergeTemplateDetails(original, {
  vesselHeading: data.vesselHeading, crewLimit: data.amounts.crewLimit, wdcdSubLimit: data.amounts.wdcdSubLimit,
})

export function buildEagleCreate(data: EagleFormData, ctx: PniClientContext, templateVersion: string): PniWrite {
  const issues = contextIssues(ctx, true)
  const t = parseTotals(data, issues)
  const vessels = data.vessels.map((v, i) => ({ key: v.id, ...vesselFields(v, i, false, undefined, issues) }))
  const vesselCoverages: Loose[] = []
  data.vessels.forEach((v, i) => {
    const annualPremium = parseAmount(`Vessel ${i + 1} annual premium`, v.annualPremium, issues)
    const limitAmount = parseAmount(`Vessel ${i + 1} limit`, v.limit, issues)
    if (annualPremium !== undefined || limitAmount !== undefined) vesselCoverages.push({ vesselRef: v.id, insuranceBlockRef: 'pni', annualPremium, limitAmount })
  })
  if (issues.length) throw new PniSaveError(issues)

  const deductibles: Loose[] = DEDUCTIBLE_SLOTS.filter((s) => t.slots[s] !== undefined).map((s) => ({
    insuranceBlockRef: 'pni', scope: 'CLAIM_CATEGORY', claimCategory: SLOT_CATEGORY_NAME[s], amount: t.slots[s], currency: CURRENCY,
  }))
  return {
    payload: {
      quotation: { ...quotationFields(ctx, { insured: data.applicant, address: data.address }, templateVersion), insuranceTypeId: ctx.insuranceTypeId },
      pni: { clubCode: 'EOM', referenceNumber: clean(data.reference) || undefined, signatureDate: clean(data.issueDate) || undefined, details: pniDetails(data, undefined) },
      vessels,
      insuranceBlocks: [{ key: 'pni', typeOfInsurance: BLOCK_TYPE, currency: CURRENCY, maximumInsured: t.limit, premium: t.premium, sortOrder: 0 }],
      deductibles, vesselCoverages,
    },
    periodText: clean(data.period) || undefined,
  }
}

export function buildEagleUpdate(data: EagleFormData, ctx: PniClientContext, templateVersion: string, original: PniQuotationDetail): PniWrite {
  const issues = contextIssues(ctx, false)
  const t = parseTotals(data, issues)
  const main: PniInsuranceBlock | null = splitBlocks(original.insuranceBlocks).main
  const mainRef = main?.id ?? 'pni'

  const savedVessels = new Map(original.vessels.map((v) => [v.id, v]))
  const vessels = data.vessels.map((v, i) => {
    const saved = savedVessels.get(v.id)
    const fields = vesselFields(v, i, Boolean(saved), saved as unknown as Loose | undefined, issues)
    return saved ? { id: v.id, ...fields } : { key: v.id, ...fields }
  })
  const keep = new Set(data.vessels.map((v) => v.id))
  const removedVessels = original.vessels.filter((v) => !keep.has(v.id)).map((v) => v.id)

  const insuranceBlocks: Loose[] = []
  if (main) {
    unclearable(issues, 'Limits', t.limit, main.maximumInsured)
    unclearable(issues, 'Premium total', t.premium, main.premium, true)
    // typeOfInsurance is required on every block row, updates included (same child schema as create)
    insuranceBlocks.push({ id: main.id, typeOfInsurance: main.typeOfInsurance, maximumInsured: t.limit, premium: t.premium })
  } else {
    insuranceBlocks.push({ key: 'pni', typeOfInsurance: BLOCK_TYPE, currency: CURRENCY, maximumInsured: t.limit, premium: t.premium, sortOrder: 0 })
  }

  const deductibles: Loose[] = []
  const removedDeductibles: string[] = []
  for (const slot of DEDUCTIBLE_SLOTS) {
    const label = EAGLE_TEMPLATE.amountSlots.find((s) => s.slot === slot)?.label ?? slot
    const existing = (main?.deductibles ?? []).filter((x) => x.scope === 'CLAIM_CATEGORY' && x.claimCategory && slotOfCategory(x.claimCategory) === slot)
    const value = t.slots[slot]
    if (existing.length === 1) {
      if (value !== undefined) deductibles.push({ id: existing[0].id, insuranceBlockRef: mainRef, scope: 'CLAIM_CATEGORY', claimCategory: existing[0].claimCategory, amount: value })
      else removedDeductibles.push(existing[0].id)
    } else if (existing.length > 1) {
      if (value !== undefined) issues.push(`${label}: several deductibles are saved for this category — edit them in the full P&I form.`)
    } else if (value !== undefined) {
      deductibles.push({ insuranceBlockRef: mainRef, scope: 'CLAIM_CATEGORY', claimCategory: SLOT_CATEGORY_NAME[slot], amount: value, currency: main?.currency ?? CURRENCY })
    }
  }

  const vesselCoverages: Loose[] = []
  data.vessels.forEach((v, i) => {
    const annualPremium = parseAmount(`Vessel ${i + 1} annual premium`, v.annualPremium, issues)
    const limitAmount = parseAmount(`Vessel ${i + 1} limit`, v.limit, issues)
    const saved = savedVessels.get(v.id)?.coverages.find((c) => c.insuranceBlockId === main?.id)
    if (saved) {
      unclearable(issues, `Vessel ${i + 1} annual premium`, annualPremium, saved.annualPremium)
      unclearable(issues, `Vessel ${i + 1} limit`, limitAmount, saved.limitAmount)
    }
    if (annualPremium !== undefined || limitAmount !== undefined) vesselCoverages.push({ vesselRef: v.id, insuranceBlockRef: mainRef, annualPremium, limitAmount })
  })
  if (issues.length) throw new PniSaveError(issues)

  const remove: Loose = {}
  if (removedVessels.length) remove.vesselIds = removedVessels
  if (removedDeductibles.length) remove.deductibleIds = removedDeductibles
  const q = original.quotation as Loose
  return {
    payload: {
      quotation: quotationFields(ctx, { insured: data.applicant, address: data.address }, templateVersion, q),
      pni: {
        referenceNumber: textPatch(data.reference, original.referenceNumber, true),
        signatureDate: textPatch(data.issueDate, original.signatureDate, true),
        details: pniDetails(data, original.details),
      },
      vessels, insuranceBlocks, deductibles, vesselCoverages,
      ...(Object.keys(remove).length ? { remove } : {}),
    },
    periodText: textPatch(data.period, q.periodText, true),
  }
}
