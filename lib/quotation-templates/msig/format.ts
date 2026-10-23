// FILE: lib/quotation-templates/msig/format.ts
// Formatting observed in the MSIG sample (Phase 2 §3): dates “17 Jun 2026”,
// amounts with thousands separators and exactly two decimals. Rules the
// sample does not show (single-digit days, blank values) are PPMI questions;
// the choices below are marked [CONFIRM].

import type { MsigFormData } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** yyyy-mm-dd → “dd Mon yyyy”. [CONFIRM] zero-padded day (the sample only shows “17”). Blank/invalid → ''. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return ''
  const month = Number(m[2])
  if (month < 1 || month > 12) return ''
  return `${m[3]} ${MONTHS[month - 1]} ${m[1]}`
}

/** Returns an error message, or null when empty/valid. Technical check only — no business limits. */
export function amountError(raw: string): string | null {
  const s = raw.trim()
  if (s === '') return null
  if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(s)) return 'Enter a plain number, e.g. 12,500.00'
  if (/\.\d{3,}$/.test(s)) return 'Use at most 2 decimals'
  return null
}

/** “12500” → “12,500.00”. [CONFIRM] blank stays blank. Invalid input prints nothing (export is blocked by validateMsigData). */
export function formatAmount(raw: string): string {
  const s = raw.trim()
  if (s === '' || amountError(s)) return ''
  const [int, dec = ''] = s.replace(/,/g, '').split('.')
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${(dec + '00').slice(0, 2)}`
}

/** Field-level technical validation. No required-field or business rules are enforced (none confirmed). */
export function validateMsigData(data: MsigFormData): string[] {
  const errors: string[] = []
  for (const cov of ['pni', 'war'] as const) {
    for (const key of ['maximumAmount', 'deductibleAmount', 'premiumAmount'] as const) {
      const e = amountError(data[cov][key] ?? '')
      if (e) errors.push(`${cov === 'pni' ? 'P&I' : 'War P&I'} ${key}: ${e}`)
    }
  }
  return errors
}