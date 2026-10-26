// FILE: lib/quotation-templates/eagle/format.ts
// Formatting observed in the Eagle sample: whole-number amounts with thousands
// separators and no decimals (“USD 5,000”, “18,500”, “10,000,000”), dates as
// “09-OCT-2025”. Rules the sample does not show are PPMI questions, marked [CONFIRM].

import type { EagleAmountSlot, EagleFormData } from './types'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** yyyy-mm-dd → “DD-MON-YYYY” (upper-case, as in the sample). Blank/invalid → ''. */
export function formatDateEagle(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return ''
  const month = Number(m[2])
  return month >= 1 && month <= 12 ? `${m[3]}-${MONTHS[month - 1]}-${m[1]}` : ''
}

/** [CONFIRM] whole numbers only — the sample never prints decimals. Technical check, no business limits. */
export function wholeAmountError(raw: string): string | null {
  const s = raw.trim()
  if (s === '') return null
  return /^(\d{1,3}(,\d{3})+|\d+)$/.test(s) ? null : 'Enter a whole number, e.g. 12,500'
}

export function formatWhole(raw: string): string {
  const s = raw.trim()
  if (s === '' || wholeAmountError(s)) return ''
  return s.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function validateEagleData(d: EagleFormData): string[] {
  const errors: string[] = []
  const check = (label: string, v: string) => { const e = wholeAmountError(v ?? ''); if (e) errors.push(`${label}: ${e}`) }
  check('Limits amount', d.limitAmount)
  ;(Object.keys(d.amounts) as EagleAmountSlot[]).forEach((k) => check(k, d.amounts[k]))
  check('Premium total', d.premiumTotal)
  d.vessels.forEach((v, i) => { check(`Vessel ${i + 1} annual premium`, v.annualPremium); check(`Vessel ${i + 1} limit`, v.limit) })
  return errors
}