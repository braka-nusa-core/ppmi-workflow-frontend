// FILE: lib/quotation-templates/eagle/fromPni.ts
// ═══════════════════════════════════════════════════════════════
// EAGLE OCEAN MARINE: PERSISTED P&I QUOTATION → EAGLE TEMPLATE DOCUMENT
//
// Backend source: GET /pni/quotations/:id (PniQuotationDetail).
// Paper field                         ← backend field
//   QUOTATION No.                     ← pni.referenceNumber
//   Applicant / Address               ← quotation.insured / quotation.address
//   Vessel: <heading>                 ← the vessel’s name, only when there is exactly one vessel
//   Period of Insurance               ← quotation.periodStart + periodEnd (both required)
//   Limits: USD …                     ← main block.maximumInsured
//   date beside the signature         ← pni.signatureDate
//   TRADING AREA (E09)                ← main block.tradingArea  (replaces standing wording only when present)
//   DEDUCTIBLES slots (E24–E29)       ← CLAIM_CATEGORY deductibles of the main block whose category is
//                                       named like the slot (crew / cargo / collision / F&FO / other / total loss)
//   INFORMATION – vessel table        ← pni.vessels[]
//   premium table (per vessel)        ← that vessel’s coverage under the main block: annualPremium, limitAmount
//   premium total row                 ← main block.premium (stored value, never summed)
//   COASSUREDS AND OTHERS             ← pni.organizationRoles, only for a single-vessel quotation
//                                       (roles are not tied to a vessel in the backend)
//
// Main block = the first block that does not inherit from another. The paper
// prints whole numbers in USD only, so a value with a fractional part or in
// another currency is reported as a gap instead of being rounded or relabelled.
// Fixed wording and layout are untouched.
// ═══════════════════════════════════════════════════════════════

import type { PniDeductible, PniQuotationDetail } from '@/types/pni'
import { buildEagleDocument } from './buildDocument'
import { formatDateEagle } from './format'
import { EAGLE_TEMPLATE } from './template'
import type { EagleAmountSlot, EagleDocument, EagleFormData, EagleRole, EagleTemplate, EagleVessel } from './types'
import {
  buildNotPrinted, clean, decimal, emptyPrinted, isBlank, isoDay, periodText, quotationText, splitBlocks, templateDetails, wholeNumber,
  type PniTemplateRender, type TemplateGap,
} from '../shared/fromPni'

const PAPER_CURRENCY = 'USD'

/** Normalised claim-category names that identify each deductible slot (the paper’s own wording / the form’s examples). */
const SLOT_CATEGORIES: Partial<Record<EagleAmountSlot, string[]>> = {
  crewClaims:      ['crew', 'crewclaims'],
  cargoClaims:     ['cargo', 'cargoclaims'],
  collisionClaims: ['collision', 'collisionclaims', 'collisionliability', 'collisionliabilityclaims', 'rdc'],
  ffoClaims:       ['ffo', 'fixedfloatingobjects', 'damagetofixedfloatingobjects'],
  otherClaims:     ['other', 'otherclaims'],
  totalLoss:       ['totalloss', 'totallossfurtherdeduction'],
}
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** The deductible slot a claim category belongs to — one rule for reading AND writing. */
export const slotOfCategory = (category: string): EagleAmountSlot | undefined =>
  (Object.keys(SLOT_CATEGORIES) as EagleAmountSlot[]).find((s) => SLOT_CATEGORIES[s]?.includes(norm(category)))

/** Category names written for a slot that has no saved deductible yet (the paper's own claim categories). */
export const SLOT_CATEGORY_NAME: Partial<Record<EagleAmountSlot, string>> = {
  crewClaims: 'Crew', cargoClaims: 'Cargo', collisionClaims: 'Collision', ffoClaims: 'F&FO', otherClaims: 'Other', totalLoss: 'Total loss',
}

const emptyAmounts = (): EagleFormData['amounts'] => ({
  crewLimit: '', wdcdSubLimit: '', crewClaims: '', cargoClaims: '', collisionClaims: '', ffoClaims: '', otherClaims: '', totalLoss: '',
})

/** Row E09 (TRADING AREA) takes the saved quotation's text when it has one; nothing else on the template changes. */
export function applyEagleOverrides(t: EagleTemplate, ov?: EagleFormData['pniOverrides']): EagleTemplate {
  if (!ov?.tradingArea) return t
  const text = ov.tradingArea
  return {
    ...t,
    body: t.body.map((el) => (el.kind === 'row' && el.id === 'E09'
      ? { ...el, paragraphs: [{ text, gapBefore: el.paragraphs[0]?.gapBefore ?? 0 }] }
      : el)),
  }
}

/** The one place a document is built from Eagle form data — editor preview, PDF and the read-only page all use it. */
export function buildEagleDocumentWithOverrides(t: EagleTemplate, data: EagleFormData): EagleDocument {
  return buildEagleDocument(applyEagleOverrides(t, data.pniOverrides), data)
}

/** Saved quotation → the editor's form data (+ which fields could not be filled and what was printed). */
export function pniToEagle(d: PniQuotationDetail): { data: EagleFormData; gaps: TemplateGap[]; printed: ReturnType<typeof emptyPrinted> } {
  const tpl = templateDetails(d.details)
  const gaps: TemplateGap[] = []
  const printed = emptyPrinted()
  const { main, extras } = splitBlocks(d.insuranceBlocks)
  const blockLabel = main?.typeOfInsurance || 'insurance block'

  /** A whole-number USD amount for the paper, or '' with a gap. */
  const usdWhole = (field: string, value: string | null, currency: string): string => {
    const { value: whole, lossy } = wholeNumber(value)
    if (whole === '' && !lossy) return ''
    if (currency !== PAPER_CURRENCY) {
      gaps.push({ field, message: `The value is in ${currency}, but the paper prints “${PAPER_CURRENCY}” as fixed wording; it is left blank.` })
      return ''
    }
    if (lossy) {
      gaps.push({ field, message: `The stored value ${decimal(value)} has a fractional part; the paper prints whole numbers only, so it is left blank.` })
      return ''
    }
    return whole
  }

  // ── header ──
  const reference = clean(d.referenceNumber)
  if (!reference) gaps.push({ field: 'QUOTATION No.', message: 'The quotation has no reference number.' })

  const applicant = clean(quotationText(d, 'insured'))
  if (!applicant) gaps.push({ field: 'Applicant', message: `The quotation has no Insured text${d.quotation.client?.name ? ` (its client is “${d.quotation.client.name}”, which is not used as a substitute)` : ''}.` })

  const address = clean(quotationText(d, 'address'))

  let vesselHeading = ''
  if (typeof tpl.vesselHeading === 'string') vesselHeading = tpl.vesselHeading
  else if (d.vessels.length === 1) vesselHeading = d.vessels[0].name
  else gaps.push({
    field: 'Vessel (heading)',
    message: d.vessels.length === 0
      ? 'The quotation has no vessels.'
      : `The heading names one vessel but the quotation has ${d.vessels.length}; the backend does not say which, so it is left blank (all vessels are in the schedule).`,
  })

  // The paper’s Period is free text → quotation.periodText. Without it, both cover dates are shown instead.
  const period = clean(quotationText(d, 'periodText')) || periodText(quotationText(d, 'periodStart'), quotationText(d, 'periodEnd'), (iso) => formatDateEagle(iso))
  if (!period) gaps.push({ field: 'Period of Insurance', message: 'The quotation has no period text and no complete period start/end; the line is left blank.' })

  const issueDate = isoDay(d.signatureDate)
  if (!issueDate) gaps.push({ field: 'Date (signature)', message: 'The quotation has no signature date; the date is left blank.' })

  // ── main block: limits, premium, deductibles, trading area ──
  const amounts = emptyAmounts()
  let limitAmount = ''
  let premiumTotal = ''
  let tradingOverride = ''
  if (!main) {
    gaps.push({ field: 'Limits / premium / deductibles', message: 'The quotation has no insurance block; these are left blank.' })
  } else {
    printed.blockAmounts.add(main.id)
    limitAmount = usdWhole('Limits', main.maximumInsured, main.currency)
    premiumTotal = usdWhole('Premium total', main.premium, main.currency)

    const bySlot = new Map<EagleAmountSlot, PniDeductible[]>()
    for (const ded of main.deductibles) {
      if (ded.scope !== 'CLAIM_CATEGORY' || !ded.claimCategory) continue
      const slot = slotOfCategory(ded.claimCategory)
      if (slot) bySlot.set(slot, [...(bySlot.get(slot) ?? []), ded])
    }
    for (const [slot, list] of Array.from(bySlot.entries())) {
      const label = EAGLE_TEMPLATE.amountSlots.find((s) => s.slot === slot)?.label ?? slot
      if (list.length > 1) { gaps.push({ field: label, message: `${list.length} deductibles are named for this slot; it is left blank rather than guessing which applies.` }); continue }
      const value = usdWhole(label, list[0].amount, list[0].currency)
      amounts[slot] = value
      if (value !== '' || isBlank(list[0].amount)) printed.deductibleIds.add(list[0].id)
    }
    if (clean(main.tradingArea)) { tradingOverride = clean(main.tradingArea); printed.blockTexts.add(`${main.id}:tradingArea`) }
  }
  if (typeof tpl.crewLimit === 'string') amounts.crewLimit = tpl.crewLimit
  if (typeof tpl.wdcdSubLimit === 'string') amounts.wdcdSubLimit = tpl.wdcdSubLimit
  if (typeof tpl.crewLimit !== 'string' && typeof tpl.wdcdSubLimit !== 'string') {
    gaps.push({ field: 'Crew limit / WDCD sub-limit', message: 'The backend has no column for these two amounts and none were saved with the quotation; they are left blank.' })
  }
  if (extras.length > 0) {
    gaps.push({ field: 'Insurance blocks', message: `${extras.length} further block(s) (${extras.map((b) => b.typeOfInsurance || 'untitled').join(', ')}) are not on this paper (it prints one Protection and Indemnity block).` })
  }
  if (d.validityDays !== null) {
    gaps.push({ field: 'Validity', message: `The quotation’s validity (${d.validityDays} days) has no place on this paper; its fixed wording is unchanged.` })
  }

  // ── vessels ──
  const storedRoles = (v: PniQuotationDetail['vessels'][number]): EagleRole[] | null => {
    const r = templateDetails(v.details).roles
    return Array.isArray(r)
      ? r.map((x, i) => ({ id: `${v.id}-r${i}`, organisation: String((x as { organisation?: unknown })?.organisation ?? ''), role: String((x as { role?: unknown })?.role ?? '') }))
      : null
  }
  const single = d.vessels.length === 1
  // Per-vessel roles saved from the editor win; otherwise the quotation-level roles are used only for a single-vessel quotation.
  const roles: EagleRole[] = single
    ? d.organizationRoles.map((r) => ({ id: r.id, organisation: clean(r.organization), role: r.role }))
    : []
  printed.organizationRoles = single && storedRoles(d.vessels[0]) === null
  if (!single && d.organizationRoles.length > 0) {
    gaps.push({ field: 'COASSUREDS AND OTHERS', message: `Organization roles are not tied to a vessel in the backend, so with ${d.vessels.length} vessels they cannot be assigned to rows; they are listed separately.` })
  }
  if (d.vessels.length > 0 && !d.vessels.some((v) => typeof templateDetails(v.details).vesselId === 'string')) gaps.push({ field: 'Vessel table “Id” column', message: 'The backend holds no vessel Id value for this column and none were saved with the quotation; it is left blank.' })

  const vessels: EagleVessel[] = d.vessels.map((v) => {
    const cov = main ? v.coverages.find((c) => c.insuranceBlockId === main.id) : undefined
    if (main && !cov) gaps.push({ field: `Premium table — ${v.name}`, message: `No coverage of this vessel under “${blockLabel}”; its annual premium and limit are left blank.` })
    if (cov) printed.coverageBlocks.add(cov.insuranceBlockId)
    if (v.classNotApplicable && !clean(v.vesselClass)) {
      gaps.push({ field: `Class — ${v.name}`, message: 'The class is flagged “not applicable”; this paper has no such convention, so the cell is left blank.' })
    }
    return {
      id: v.id,
      vesselId: typeof templateDetails(v.details).vesselId === 'string' ? (templateDetails(v.details).vesselId as string) : '',
      name: v.name,
      imoNumber: clean(v.imoNumber),
      grossTonnage: decimal(v.grossTonnage),
      builtYear: v.builtYear === null ? '' : String(v.builtYear),
      vesselType: clean(v.vesselType),
      flag: clean(v.flag),
      vesselClass: clean(v.vesselClass),
      annualPremium: cov ? usdWhole(`Annual premium — ${v.name}`, cov.annualPremium, cov.currency) : '',
      limit: cov ? usdWhole(`Limit — ${v.name}`, cov.limitAmount, cov.currency) : '',
      roles: storedRoles(v) ?? (d.vessels.length === 1 ? roles : []),
    }
  })

  const data: EagleFormData = {
    reference, applicant, address, vesselHeading, period: period ?? '', limitAmount, issueDate, amounts, premiumTotal, vessels,
    pniOverrides: tradingOverride ? { tradingArea: tradingOverride } : undefined,
  }
  return { data, gaps, printed }
}

export function mapPniToEagle(d: PniQuotationDetail): PniTemplateRender<EagleDocument> {
  const { data, gaps, printed } = pniToEagle(d)
  return {
    document: buildEagleDocumentWithOverrides(EAGLE_TEMPLATE, data),
    gaps,
    notPrinted: buildNotPrinted(d, printed),
    template: {
      insurerName: EAGLE_TEMPLATE.insurerName,
      templateId: EAGLE_TEMPLATE.templateId,
      templateVersion: EAGLE_TEMPLATE.templateVersion,
      sourceNote: EAGLE_TEMPLATE.sourceNote,
    },
  }
}

export const eagleFileName = (d: PniQuotationDetail) =>
  `Eagle-Quotation-${(clean(d.referenceNumber) || d.quotation.quotationNumber || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`
