// FILE: lib/quotation-templates/msig/toPni.ts
// ═══════════════════════════════════════════════════════════════
// MSIG: EDITOR FORM DATA → P&I BACKEND PAYLOAD
//
// Paper field                  → backend field
//   M03 Our Reference          → pni.referenceNumber
//   M04 Assured(s)             → quotation.insured
//   M05 Insured Vessel (rows)  → pni.vessels[]
//   M06 Period (free text)     → quotation.periodText   (saved by the caller through PATCH /quotations/:id —
//                                the P&I endpoints do not accept it)
//   M35 date                   → pni.signatureDate
//   M21–M23  P&I amounts       → P&I block: maximumInsured · FLAT deductible · premium
//   M30–M32  War P&I amounts   → War block (created only once a War amount is entered; inherits the P&I block)
//   block type / currency      → the paper’s own wording of M13 / M24 and the amount rows’ currency
//   pinned template version    → quotation.templateVersion
//
// Roles of the two blocks match lib/quotation-templates/shared/fromPni.ts splitBlocks():
// the first block that does not inherit is P&I, the one inheriting from it is War P&I.
// ═══════════════════════════════════════════════════════════════

import type { PniInsuranceBlock, PniQuotationDetail } from '@/types/pni'
import { clean, splitBlocks } from '../shared/fromPni'
import {
  contextIssues, parseAmount, parseWhole, PniSaveError, quotationFields, textPatch, unclearable,
  type PniClientContext,
} from '../shared/toPni'
import { MSIG_TEMPLATE } from './template'
import type { MsigCoverageAmounts, MsigFormData, MsigVessel } from './types'

type Role = 'pni' | 'war'
type Loose = Record<string, unknown>

const fixedText = (id: string): string => {
  const el = MSIG_TEMPLATE.elements.find((e) => e.id === id)
  return el && el.kind === 'text' ? el.paragraphs[0].text : ''
}
const amountElement = (coverage: Role) => MSIG_TEMPLATE.elements.find((e) => e.kind === 'amount' && e.coverage === coverage)
const SECTION: Record<Role, { label: string; typeText: string; key: string }> = {
  pni: { label: 'P&I', typeText: fixedText('M13'), key: 'pni' },
  war: { label: 'War P&I', typeText: fixedText('M24'), key: 'war' },
}
const currencyOf = (role: Role): string => {
  const el = amountElement(role)
  return el && el.kind === 'amount' ? el.currency : 'USD'
}

interface Parsed { max?: number; ded?: number; prem?: number }
function parseCoverage(role: Role, a: MsigCoverageAmounts, issues: string[]): Parsed {
  const l = SECTION[role].label
  return {
    max: parseAmount(`${l} maximum amount`, a.maximumAmount, issues),
    ded: parseAmount(`${l} deductible`, a.deductibleAmount, issues),
    prem: parseAmount(`${l} premium`, a.premiumAmount, issues),
  }
}
const any = (p: Parsed) => p.max !== undefined || p.ded !== undefined || p.prem !== undefined

function vesselFields(v: MsigVessel, i: number, edit: boolean, persisted: Loose | undefined, issues: string[]): Loose {
  const n = i + 1
  if (!clean(v.name)) issues.push(`Vessel ${n} needs a name.`)
  const gt = parseAmount(`Vessel ${n} GT/NT`, v.grossTonnage, issues)
  const built = parseWhole(`Vessel ${n} year built`, v.builtYear, issues, 1800, 3000)
  if (edit) {
    unclearable(issues, `Vessel ${n} GT/NT`, gt, persisted?.grossTonnage as string | null)
    unclearable(issues, `Vessel ${n} year built`, built, persisted?.builtYear as number | null)
  }
  return {
    name: clean(v.name),
    vesselType: textPatch(v.type, persisted?.vesselType, edit),
    imoNumber: textPatch(v.imoNumber, persisted?.imoNumber, edit),
    vesselClass: textPatch(v.vesselClass, persisted?.vesselClass, edit),
    classNotApplicable: v.classNotApplicable,
    grossTonnage: gt,
    builtYear: built,
    flag: textPatch(v.flag, persisted?.flag, edit),
    portOfRegistry: textPatch(v.portOfRegistry, persisted?.portOfRegistry, edit),
    sortOrder: i,
  }
}

export interface PniWrite { payload: Loose; periodText: string | undefined }

export function buildMsigCreate(data: MsigFormData, ctx: PniClientContext, templateVersion: string): PniWrite {
  const issues = contextIssues(ctx, true)
  const cov: Record<Role, Parsed> = { pni: parseCoverage('pni', data.pni, issues), war: parseCoverage('war', data.war, issues) }
  const vessels = data.vessels.map((v, i) => ({ key: v.id, ...vesselFields(v, i, false, undefined, issues) }))
  if (issues.length) throw new PniSaveError(issues)

  const insuranceBlocks: Loose[] = [{ key: 'pni', typeOfInsurance: SECTION.pni.typeText, currency: currencyOf('pni'), maximumInsured: cov.pni.max, premium: cov.pni.prem, sortOrder: 0 }]
  const deductibles: Loose[] = []
  if (cov.pni.ded !== undefined) deductibles.push({ insuranceBlockRef: 'pni', scope: 'FLAT', amount: cov.pni.ded, currency: currencyOf('pni') })
  if (any(cov.war)) {
    insuranceBlocks.push({ key: 'war', typeOfInsurance: SECTION.war.typeText, currency: currencyOf('war'), inheritsFromBlockRef: 'pni', maximumInsured: cov.war.max, premium: cov.war.prem, sortOrder: 1 })
    if (cov.war.ded !== undefined) deductibles.push({ insuranceBlockRef: 'war', scope: 'FLAT', amount: cov.war.ded, currency: currencyOf('war') })
  }
  return {
    payload: {
      quotation: { ...quotationFields(ctx, { insured: data.assured }, templateVersion), insuranceTypeId: ctx.insuranceTypeId },
      pni: { clubCode: 'MSIG', referenceNumber: clean(data.reference) || undefined, signatureDate: clean(data.issueDate) || undefined },
      vessels, insuranceBlocks, deductibles,
    },
    periodText: clean(data.period) || undefined,
  }
}

export function buildMsigUpdate(data: MsigFormData, ctx: PniClientContext, templateVersion: string, original: PniQuotationDetail): PniWrite {
  const issues = contextIssues(ctx, false)
  const cov: Record<Role, Parsed> = { pni: parseCoverage('pni', data.pni, issues), war: parseCoverage('war', data.war, issues) }

  // vessels: saved rows by id, new rows by key; rows dropped in the editor are removed
  const savedVessels = new Map(original.vessels.map((v) => [v.id, v as unknown as Loose]))
  const vessels = data.vessels.map((v, i) => {
    const saved = savedVessels.get(v.id)
    const fields = vesselFields(v, i, Boolean(saved), saved, issues)
    return saved ? { id: v.id, ...fields } : { key: v.id, ...fields }
  })
  const keep = new Set(data.vessels.map((v) => v.id))
  const removedVessels = original.vessels.filter((v) => !keep.has(v.id)).map((v) => v.id)

  // blocks
  const { main, war } = splitBlocks(original.insuranceBlocks)
  const saved: Record<Role, PniInsuranceBlock | null> = { pni: main, war }
  const insuranceBlocks: Loose[] = []
  const deductibles: Loose[] = []
  const removedDeductibles: string[] = []
  let mainRef = main?.id ?? 'pni'

  for (const role of ['pni', 'war'] as Role[]) {
    const c = cov[role]; const b = saved[role]; const sec = SECTION[role]
    const ref = b?.id ?? sec.key
    if (b) {
      unclearable(issues, `${sec.label} maximum amount`, c.max, b.maximumInsured)
      unclearable(issues, `${sec.label} premium`, c.prem, b.premium, true)
      // typeOfInsurance is required on every block row, updates included (same child schema as create)
      insuranceBlocks.push({ id: b.id, typeOfInsurance: b.typeOfInsurance, maximumInsured: c.max, premium: c.prem })
    } else if (role === 'pni' || any(c)) {
      insuranceBlocks.push({
        key: sec.key, typeOfInsurance: sec.typeText, currency: currencyOf(role), maximumInsured: c.max, premium: c.prem,
        sortOrder: role === 'pni' ? 0 : 1, ...(role === 'war' ? { inheritsFromBlockRef: mainRef } : {}),
      })
    } else continue
    if (role === 'pni') mainRef = ref

    const flat = (b?.deductibles ?? []).filter((x) => x.scope === 'FLAT')
    if (flat.length === 1) {
      if (c.ded !== undefined) deductibles.push({ id: flat[0].id, insuranceBlockRef: ref, scope: 'FLAT', amount: c.ded })
      else removedDeductibles.push(flat[0].id)
    } else if (flat.length > 1) {
      if (c.ded !== undefined) issues.push(`${sec.label} deductible: several flat deductibles are saved on this block — edit them in the full P&I form.`)
    } else if (c.ded !== undefined) {
      deductibles.push({ insuranceBlockRef: ref, scope: 'FLAT', amount: c.ded, currency: b?.currency ?? currencyOf(role) })
    }
  }
  if (issues.length) throw new PniSaveError(issues)

  const remove: Loose = {}
  if (removedVessels.length) remove.vesselIds = removedVessels
  if (removedDeductibles.length) remove.deductibleIds = removedDeductibles
  const q = original.quotation as Loose
  return {
    payload: {
      // insuranceTypeId is fixed at creation (the P&I update schema does not accept it)
      quotation: quotationFields(ctx, { insured: data.assured }, templateVersion, q),
      pni: {
        referenceNumber: textPatch(data.reference, original.referenceNumber, true),
        signatureDate: textPatch(data.issueDate, original.signatureDate, true),
      },
      vessels, insuranceBlocks, deductibles,
      ...(Object.keys(remove).length ? { remove } : {}),
    },
    periodText: textPatch(data.period, q.periodText, true),
  }
}
