// FILE: lib/quotation-templates/shared/fromPni.ts
// ═══════════════════════════════════════════════════════════════
// PERSISTED P&I QUOTATION → INSURER TEMPLATE (shared helpers)
//
// The template prototypes were built on a local mock repository. This
// layer feeds the SAME templates from a real quotation instead:
//
//   GET /pni/quotations/:id  →  mapPniTo<Insurer>()  →  template document
//
// Rules (apply to every insurer mapper):
//  • Fixed wording of the paper is never edited, and nothing is written
//    back to the quotation (no template defaults are persisted).
//  • A template field is filled only from the backend field that holds
//    the same information. When there is none (or it is blank), the field
//    stays blank and a TemplateGap says so — nothing is guessed, summed
//    or borrowed from an unrelated field.
//  • Backend data the paper has no slot for is not dropped silently: it is
//    returned as `notPrinted` so the UI can show it next to the preview.
// ═══════════════════════════════════════════════════════════════

import type { PniInsuranceBlock, PniQuotationDetail } from '@/types/pni'

/** A template field that could not be filled (or filled only partly) from the quotation. */
export interface TemplateGap { field: string; message: string }

/** Persisted data the insurer paper has no place for. */
export interface NotPrintedSection { title: string; items: string[] }

export interface PniTemplateInfo {
  insurerName:     string
  templateId:      string
  templateVersion: string
  sourceNote:      string
}

export interface PniTemplateRender<TDoc> {
  document:   TDoc
  gaps:       TemplateGap[]
  notPrinted: NotPrintedSection[]
  template:   PniTemplateInfo
}

export const isBlank = (v: unknown): boolean => v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
export const clean = (v: string | null | undefined): string => (v ?? '').trim()

/** A scalar from the loosely-typed `quotation` block (insured, address, periodStart …): a string or null. */
export const quotationText = (d: PniQuotationDetail, key: string): string | null => {
  const v = d.quotation[key]
  return typeof v === 'string' ? v : null
}

/**
 * Template-only values with no backend column (Eagle: vessel heading, crew limit,
 * WDCD sub-limit, per-vessel Id and co-assured roles) are kept under
 * `details.template` — `details` is the backend's free-form JSON on the P&I
 * quotation and on each vessel. Other keys in `details` are preserved untouched.
 */
export function templateDetails(raw: unknown): Record<string, unknown> {
  const t = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).template : null
  return t && typeof t === 'object' && !Array.isArray(t) ? (t as Record<string, unknown>) : {}
}

/** ISO timestamp / date → yyyy-mm-dd ('' when absent or not a date). */
export function isoDay(v: string | null | undefined): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(v ?? '')
  return m ? m[1] : ''
}

/** Decimal(15,2) arrives as a numeric string (or null). Returned unchanged; null → ''. */
export const decimal = (v: string | number | null | undefined): string => (v === null || v === undefined ? '' : String(v).trim())

/** Whole-number view of a decimal string. `lossy` = it had a non-zero fractional part. */
export function wholeNumber(v: string | null | undefined): { value: string; lossy: boolean } {
  const s = decimal(v)
  if (s === '') return { value: '', lossy: false }
  const m = /^(-?\d+)(?:\.(\d+))?$/.exec(s)
  if (!m) return { value: '', lossy: true }
  return { value: m[1], lossy: Boolean(m[2] && /[1-9]/.test(m[2])) }
}

/** The quotation's cover period as the template's own date style, or null unless BOTH dates exist. */
export function periodText(start: string | null | undefined, end: string | null | undefined, fmt: (iso: string) => string): string | null {
  const a = fmt(isoDay(start)); const b = fmt(isoDay(end))
  return a && b ? `${a} — ${b}` : null
}

export interface BlockSplit {
  /** First block that does not inherit from another one — the main P&I cover. */
  main:   PniInsuranceBlock | null
  /** First block that inherits from `main` — how the form models a War P&I rider. */
  war:    PniInsuranceBlock | null
  /** Blocks that fit neither role. */
  extras: PniInsuranceBlock[]
}

export function splitBlocks(blocks: PniInsuranceBlock[]): BlockSplit {
  const main = blocks.find((b) => !b.inheritsFromBlockId) ?? blocks[0] ?? null
  const war = main ? blocks.find((b) => b.inheritsFromBlockId === main.id) ?? null : null
  return { main, war, extras: blocks.filter((b) => b !== main && b !== war) }
}

const blockName = (b: PniInsuranceBlock) => b.typeOfInsurance || '(untitled block)'
const money = (cur: string, amount: string | null) => (isBlank(amount) ? `${cur} —` : `${cur} ${amount}`)
const scopeLabel = (s: string) => s.replace(/_/g, ' ').toLowerCase()

/** What the mapper put on the paper, so the rest can be listed as not printed. */
export interface PrintedSet {
  deductibleIds:   Set<string>
  /** `${blockId}:${field}` for security / tradingArea / policyWordingReference / paymentWarrantyText. */
  blockTexts:      Set<string>
  /** Blocks whose maximum insured / premium are on the paper. */
  blockAmounts:    Set<string>
  /** Vessel coverage amounts (annual premium / limit) are on the paper for these blocks. */
  coverageBlocks:  Set<string>
  organizationRoles: boolean
}

export const emptyPrinted = (): PrintedSet => ({
  deductibleIds: new Set(), blockTexts: new Set(), blockAmounts: new Set(), coverageBlocks: new Set(), organizationRoles: false,
})

/** Everything persisted on the quotation that this paper does not print. */
export function buildNotPrinted(d: PniQuotationDetail, printed: PrintedSet): NotPrintedSection[] {
  const out: NotPrintedSection[] = []
  const add = (title: string, items: string[]) => { if (items.length > 0) out.push({ title, items }) }

  const blockFields: string[] = []
  for (const b of d.insuranceBlocks) {
    const n = blockName(b)
    const fields: [string, string | null][] = [
      ['security', b.security], ['tradingArea', b.tradingArea],
      ['policyWordingReference', b.policyWordingReference], ['paymentWarrantyText', b.paymentWarrantyText],
    ]
    const labels: Record<string, string> = { security: 'Security', tradingArea: 'Trading Area', policyWordingReference: 'Policy Wording', paymentWarrantyText: 'Payment Warranty' }
    for (const [key, value] of fields) {
      if (!isBlank(value) && !printed.blockTexts.has(`${b.id}:${key}`)) blockFields.push(`${n} — ${labels[key]}: ${clean(value)}`)
    }
    if (!printed.blockAmounts.has(b.id)) {
      blockFields.push(`${n} — Maximum insured: ${money(b.currency, b.maximumInsured)}; Premium: ${money(b.currency, b.premium)}`)
    }
    blockFields.push(`${n} — Premium basis: ${scopeLabel(b.premiumBasis)}${b.inheritsFromBlockId ? ' (inherits terms from another block)' : ''}`)
  }
  add('Insurance block details', blockFields)

  const coverages = d.vessels.flatMap((v) =>
    v.coverages.filter((c) => !printed.coverageBlocks.has(c.insuranceBlockId)).map((c) => {
      const b = d.insuranceBlocks.find((x) => x.id === c.insuranceBlockId)
      return `${v.name} × ${b ? blockName(b) : 'block'}: annual premium ${money(c.currency, c.annualPremium)}, limit ${money(c.currency, c.limitAmount)}`
    }))
  add('Vessel coverages', coverages)

  const deductibles = d.insuranceBlocks.flatMap((b) =>
    b.deductibles.filter((x) => !printed.deductibleIds.has(x.id)).map((x) =>
      `${blockName(b)} — ${scopeLabel(x.scope)}${x.claimCategory ? ` (${x.claimCategory})` : ''}: ${money(x.currency, x.amount)}${x.description ? ` — ${x.description}` : ''}`))
  add('Deductibles', deductibles)

  const provisions = [
    ...d.provisions.map((p) => ({ p, where: 'Quote-level' })),
    ...d.insuranceBlocks.flatMap((b) => b.provisions.map((p) => ({ p, where: blockName(b) }))),
  ].map(({ p, where }) =>
    `[${p.type}] ${p.title}${p.content ? ` — ${p.content}` : ''}${p.reference ? ` (Ref: ${p.reference})` : ''} · ${where} · ${scopeLabel(p.scope)}`)
  add('Provisions', provisions)

  const restrictions = [
    ...d.coverRestrictions.map((r) => ({ r, where: 'Quote-level' })),
    ...d.insuranceBlocks.flatMap((b) => b.coverRestrictions.map((r) => ({ r, where: blockName(b) }))),
  ].map(({ r, where }) =>
    `${r.name}${r.partReference || r.sectionReference ? ` (${[r.partReference, r.sectionReference].filter(Boolean).join(', ')})` : ''} · ${where} · ${r.isSelected ? 'selected' : 'not selected'}`)
  add('Cover restrictions', restrictions)

  add('Installments', d.installments.map((i) => `#${i.installmentNo} — ${money(i.currency, i.amount)}${i.dueDate ? ` — due ${isoDay(i.dueDate)}` : ''}`))
  add('Required documents', d.requiredDocuments.map((x) => `${x.name}${x.isRequired ? '' : ' (optional)'}`))
  if (!printed.organizationRoles) {
    add('Organization roles', d.organizationRoles.map((r) => `${clean(r.organization) || '—'} — ${r.role}`))
  }

  const other: [string, string | number | null][] = [
    ['Broker', d.broker], ['Assured domicile', d.assuredDomicile], ['Payment terms', d.paymentTermsText],
    ['Subjectivities', d.subjectivities], ['Important information', d.importantInformation],
    ['Signature name', d.signatureName], ['Signature city', d.signatureCity], ['Validity (days)', d.validityDays],
  ]
  add('Other quotation fields', other.filter(([, v]) => !isBlank(v)).map(([k, v]) => `${k}: ${String(v).trim()}`))
  return out
}
