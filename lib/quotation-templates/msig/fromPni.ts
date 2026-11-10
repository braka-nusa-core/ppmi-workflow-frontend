// FILE: lib/quotation-templates/msig/fromPni.ts
// ═══════════════════════════════════════════════════════════════
// MSIG: PERSISTED P&I QUOTATION → MSIG TEMPLATE DOCUMENT
//
// Backend source: GET /pni/quotations/:id (PniQuotationDetail).
// Paper field                      ← backend field
//   M03 Our Reference              ← pni.referenceNumber
//   M04 Assured(s)                 ← quotation.insured        (never the client name)
//   M05 Insured Vessel (repeats)   ← pni.vessels[] (name, vesselType, imoNumber,
//                                    vesselClass / classNotApplicable, grossTonnage,
//                                    builtYear, flag, portOfRegistry)
//   M06 Period                     ← quotation.periodStart + periodEnd (both required)
//   M07 Trading Limits             ← P&I block.tradingArea   (replaces standing wording only when present)
//   M14 Security / M25             ← P&I / War block.security (same rule)
//   M26 Trading Area (War)         ← War block.tradingArea    (same rule)
//   M21–M23 P&I amounts            ← P&I block: maximumInsured · the single FLAT deductible · premium
//   M30–M32 War P&I amounts        ← War block, same fields
//   amount currency                ← block.currency
//   M35 date                       ← pni.signatureDate
//
// Which block is "P&I" and which is "War P&I": the first block that does not
// inherit is the P&I block; the block that inherits from it is the War P&I
// block (how the P&I form models a War rider). Any other block is reported,
// not printed. Fixed wording and layout are untouched.
// ═══════════════════════════════════════════════════════════════

import type { PniInsuranceBlock, PniQuotationDetail } from '@/types/pni'
import { buildMsigDocument } from './buildDocument'
import { formatDate } from './format'
import { MSIG_TEMPLATE } from './template'
import type { MsigCoverageAmounts, MsigDocument, MsigFormData, MsigPniOverrides, MsigTemplate, MsigVessel } from './types'
import {
  buildNotPrinted, clean, decimal, emptyPrinted, isoDay, periodText, quotationText, splitBlocks,
  type PniTemplateRender, type PrintedSet, type TemplateGap,
} from '../shared/fromPni'

/** “This quotation is valid 30 days …” is fixed wording on the paper (M33). */
const PAPER_VALIDITY_DAYS = 30

type Role = 'pni' | 'war'
const SECTION = {
  pni: { label: 'P&I', security: 'M14', trading: 'M07' },
  war: { label: 'War P&I', security: 'M25', trading: 'M26' },
} as const

function mapVessel(v: PniQuotationDetail['vessels'][number]): MsigVessel {
  return {
    id: v.id,
    name: v.name,
    type: clean(v.vesselType),
    imoNumber: clean(v.imoNumber),
    vesselClass: clean(v.vesselClass),
    classNotApplicable: v.classNotApplicable,
    grossTonnage: decimal(v.grossTonnage),
    builtYear: v.builtYear === null ? '' : String(v.builtYear),
    flag: clean(v.flag),
    portOfRegistry: clean(v.portOfRegistry),
  }
}

/** Swaps in per-quotation text/currency. Everything else on the template is left exactly as is. */
export function applyMsigOverrides(t: MsigTemplate, ov?: MsigPniOverrides): MsigTemplate {
  if (!ov) return t
  return {
    ...t,
    elements: t.elements.map((el) => {
      if (el.kind === 'text' && ov.text[el.id]) return { ...el, paragraphs: [{ text: ov.text[el.id] }] }
      if (el.kind === 'amount' && ov.currency[el.coverage]) return { ...el, currency: ov.currency[el.coverage] as string }
      return el
    }),
  }
}

/** The one place a document is built from MSIG form data — editor preview, PDF and the read-only page all use it. */
export function buildMsigDocumentWithOverrides(t: MsigTemplate, data: MsigFormData): MsigDocument {
  return buildMsigDocument(applyMsigOverrides(t, data.pniOverrides), data)
}

/** Saved quotation → the editor's form data (+ which fields could not be filled and what was printed). */
export function pniToMsig(d: PniQuotationDetail): { data: MsigFormData; gaps: TemplateGap[]; printed: PrintedSet } {
  const gaps: TemplateGap[] = []
  const printed: PrintedSet = emptyPrinted()
  const { main, war, extras } = splitBlocks(d.insuranceBlocks)
  const blocks: Record<Role, PniInsuranceBlock | null> = { pni: main, war }

  // ── quotation-level fields ──
  const reference = clean(d.referenceNumber)
  if (!reference) gaps.push({ field: 'Our Reference', message: 'The quotation has no reference number.' })

  const assured = clean(quotationText(d, 'insured'))
  if (!assured) gaps.push({ field: 'Assured(s)', message: `The quotation has no Insured text${d.quotation.client?.name ? ` (its client is “${d.quotation.client.name}”, which is not used as a substitute)` : ''}.` })

  // The paper’s Period is free text → quotation.periodText. Without it, both cover dates are shown instead.
  const period = clean(quotationText(d, 'periodText')) || periodText(quotationText(d, 'periodStart'), quotationText(d, 'periodEnd'), formatDate)
  if (!period) {
    gaps.push({ field: 'Period', message: 'The quotation has no period text and no complete period start/end; the Period line is left blank.' })
  }

  const issueDate = isoDay(d.signatureDate)
  if (!issueDate) gaps.push({ field: 'Date (signature line)', message: 'The quotation has no signature date; the date is left off the signature line.' })

  if (d.vessels.length === 0) gaps.push({ field: 'Insured Vessel', message: 'The quotation has no vessels.' })

  if (d.validityDays !== null && d.validityDays !== PAPER_VALIDITY_DAYS) {
    gaps.push({ field: 'Validity', message: `The paper’s fixed wording says “valid ${PAPER_VALIDITY_DAYS} days”, but this quotation’s validity is ${d.validityDays} days. The wording is not changed.` })
  }

  // ── coverage blocks ──
  const amounts = {} as Record<Role, MsigCoverageAmounts>
  const text: Record<string, string> = {}
  const currency: Partial<Record<Role, string>> = {}

  for (const role of ['pni', 'war'] as Role[]) {
    const b = blocks[role]
    const sec = SECTION[role]
    if (!b) {
      amounts[role] = { maximumAmount: '', deductibleAmount: '', premiumAmount: '' }
      gaps.push({
        field: `${sec.label} amounts`,
        message: role === 'pni'
          ? 'The quotation has no insurance block; the P&I amounts are left blank.'
          : 'No block inherits from the P&I block, so the War P&I amounts are left blank (the paper’s War P&I section is fixed wording).',
      })
      continue
    }
    currency[role] = b.currency
    printed.blockAmounts.add(b.id)

    const flat = b.deductibles.filter((x) => x.scope === 'FLAT')
    let deductibleAmount = ''
    if (flat.length === 1) {
      const only = flat[0]
      deductibleAmount = decimal(only.amount)
      printed.deductibleIds.add(only.id)
      if (only.currency !== b.currency) {
        gaps.push({ field: `${sec.label} deductible`, message: `The deductible is in ${only.currency} but the block is in ${b.currency}; the paper prints one currency per row (${b.currency}).` })
      }
    } else if (flat.length > 1) {
      gaps.push({ field: `${sec.label} deductible`, message: `${flat.length} flat deductibles exist but the paper has a single Deductible(s) row; none is printed.` })
    } else if (b.deductibles.length > 0) {
      gaps.push({ field: `${sec.label} deductible`, message: 'The block’s deductibles are not flat (all-claims) deductibles, so the Deductible(s) row is left blank.' })
    }
    amounts[role] = { maximumAmount: decimal(b.maximumInsured), deductibleAmount, premiumAmount: decimal(b.premium) }

    if (clean(b.security)) { text[sec.security] = clean(b.security); printed.blockTexts.add(`${b.id}:security`) }
    if (clean(b.tradingArea)) { text[sec.trading] = clean(b.tradingArea); printed.blockTexts.add(`${b.id}:tradingArea`) }
  }
  if (extras.length > 0) {
    gaps.push({ field: 'Insurance blocks', message: `${extras.length} further block(s) (${extras.map((b) => b.typeOfInsurance || 'untitled').join(', ')}) fit neither the P&I nor the War P&I section and are not printed.` })
  }

  const data: MsigFormData = {
    reference,
    assured,
    vessels: d.vessels.map(mapVessel),
    period: period ?? '',
    pni: amounts.pni,
    war: amounts.war,
    issueDate,
    pniOverrides: { text, currency },
  }
  return { data, gaps, printed }
}

export function mapPniToMsig(d: PniQuotationDetail): PniTemplateRender<MsigDocument> {
  const { data, gaps, printed } = pniToMsig(d)
  return {
    document: buildMsigDocumentWithOverrides(MSIG_TEMPLATE, data),
    gaps,
    notPrinted: buildNotPrinted(d, printed),
    template: {
      insurerName: MSIG_TEMPLATE.insurerName,
      templateId: MSIG_TEMPLATE.templateId,
      templateVersion: MSIG_TEMPLATE.templateVersion,
      sourceNote: MSIG_TEMPLATE.sourceNote,
    },
  }
}

export const msigFileName = (d: PniQuotationDetail) =>
  `MSIG-Quotation-${(clean(d.referenceNumber) || d.quotation.quotationNumber || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`
