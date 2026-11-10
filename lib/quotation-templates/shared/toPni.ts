// FILE: lib/quotation-templates/shared/toPni.ts
// ═══════════════════════════════════════════════════════════════
// TEMPLATE FORM DATA → P&I BACKEND PAYLOAD (shared helpers)
//
// The reverse of shared/fromPni.ts. The insurer editors hold only what the
// paper shows; everything else already on the saved quotation (provisions,
// installments, other blocks …) is simply not sent, and the backend leaves
// rows that are not sent untouched. Rules this layer enforces, taken from the
// backend contract (pni.service.ts / pni.validation.ts):
//  • children with `id` are updated, without `id` created (new rows use `key`);
//  • a row is deleted only when listed under `remove`;
//  • optional text: `undefined` = unchanged, `''` = clear;
//  • numeric fields accept no null — a saved number cannot be cleared, so that
//    is reported as an issue instead of silently keeping the old value.
// ═══════════════════════════════════════════════════════════════

import { clean, isBlank } from './fromPni'

/** Which client and insurance type the quotation belongs to (not part of any paper). */
export interface PniClientContext {
  clientMode:      'existing' | 'new'
  clientId:        string
  newClient:       { name: string; address: string; phone: string; email: string; contactPerson: string }
  insuranceTypeId: string
}

export const emptyClientContext = (): PniClientContext => ({
  clientMode: 'existing',
  clientId: '',
  newClient: { name: '', address: '', phone: '', email: '', contactPerson: '' },
  insuranceTypeId: '',
})

/** Everything wrong with the data, reported together (shown to the user as-is). */
export class PniSaveError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join('\n'))
    this.name = 'PniSaveError'
  }
}

export function contextIssues(ctx: PniClientContext, creating: boolean): string[] {
  const issues: string[] = []
  if (!ctx.insuranceTypeId) issues.push('Select the insurance type.')
  if (creating && ctx.clientMode === 'new') {
    if (!clean(ctx.newClient.name)) issues.push('Enter the new client’s name.')
  } else if (!ctx.clientId) {
    issues.push(creating ? 'Select an existing client, or switch to “New client”.' : 'Select the quotation’s client.')
  }
  return issues
}

/** '10,000,000.00' → 10000000. Blank → undefined. Anything else is an issue, never a silent 0. */
export function parseAmount(label: string, value: string | undefined, issues: string[]): number | undefined {
  const s = (value ?? '').replace(/[,\s]/g, '')
  if (s === '') return undefined
  const n = Number(s)
  if (!Number.isFinite(n) || n < 0) { issues.push(`${label}: “${value}” is not a valid amount.`); return undefined }
  return n
}

export function parseWhole(label: string, value: string | undefined, issues: string[], min: number, max: number): number | undefined {
  const s = (value ?? '').trim()
  if (s === '') return undefined
  const n = Number(s)
  if (!Number.isInteger(n) || n < min || n > max) { issues.push(`${label}: “${value}” must be a whole number between ${min} and ${max}.`); return undefined }
  return n
}

/** A saved number cannot be cleared (the backend accepts no null) — say so instead of keeping the old value silently. */
export function unclearable(issues: string[], label: string, next: number | undefined, persisted: string | number | null | undefined, zeroIsEmpty = false): void {
  if (next !== undefined || persisted === null || persisted === undefined || persisted === '') return
  if (zeroIsEmpty && Number(persisted) === 0) return
  issues.push(`${label}: the saved value ${persisted} cannot be cleared (the backend stores numbers only) — enter a value, or edit it in the full P&I form.`)
}

/** Optional text on create: omitted when blank. On edit: '' only when clearing a value that was saved. */
export function textPatch(value: string | undefined, persisted: unknown, edit: boolean): string | undefined {
  const v = clean(value)
  if (v) return v
  return edit && !isBlank(persisted) ? '' : undefined
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** `details` with `details.template` replaced by `patch`; every other key (and unknown template keys) is kept. */
export function mergeTemplateDetails(original: unknown, patch: Record<string, unknown>): Record<string, unknown> {
  const base = isObject(original) ? original : {}
  const tpl = isObject(base.template) ? base.template : {}
  return { ...base, template: { ...tpl, ...patch } }
}

/** The quotation block shared by every insurer: client, insured text, pinned template version. */
export function quotationFields(
  ctx: PniClientContext,
  fields: { insured: string; address?: string },
  templateVersion: string,
  original?: { insured?: unknown; address?: unknown },
): Record<string, unknown> {
  const edit = Boolean(original)
  const out: Record<string, unknown> = {
    insured: textPatch(fields.insured, original?.insured, edit),
    templateVersion,
  }
  if (fields.address !== undefined) out.address = textPatch(fields.address, original?.address, edit)
  if (edit) {
    out.clientId = ctx.clientId
  } else if (ctx.clientMode === 'new') {
    out.client = {
      name: clean(ctx.newClient.name),
      address: clean(ctx.newClient.address) || undefined,
      phone: clean(ctx.newClient.phone) || undefined,
      email: clean(ctx.newClient.email) || undefined,
      contactPerson: clean(ctx.newClient.contactPerson) || undefined,
    }
  } else {
    out.clientId = ctx.clientId
  }
  return out
}
