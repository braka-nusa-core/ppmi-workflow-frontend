// FILE: lib/adapters/quotationOverview.ts
// ═══════════════════════════════════════════════════════════════
// Quotation → Overview adapter.
//
// Pure function over the REAL GET /quotations list (QuotationListItem[],
// via the existing useQuotations() hook). No API calls, no demo data,
// no business rules: it only counts and sorts what the backend returned.
// ═══════════════════════════════════════════════════════════════

import type { QuotationListItem, QuotationStatus } from '@/types/quotation'

/** Workflow order — also the order used for the status distribution. */
export const QUOTATION_STATUS_ORDER: QuotationStatus[] = [
  'DRAFT',
  'WAITING_APPROVAL',
  'APPROVED',
  'SENT_TO_INSURANCE',
  'REVISION',
  'INSURANCE_APPROVED',
  'POLICY_ISSUED',
]

export interface QuotationTypeCount {
  name:  string
  count: number
}

export interface QuotationOverview {
  total:           number
  byStatus:        Record<QuotationStatus, number>
  byInsuranceType: QuotationTypeCount[]
  recent:          QuotationListItem[]
}

export function buildQuotationOverview(
  items: QuotationListItem[],
  recentLimit = 6
): QuotationOverview {
  const live = items.filter((q) => !q.deletedAt)

  const byStatus = QUOTATION_STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<QuotationStatus, number>
  )
  const typeCounts = new Map<string, number>()

  for (const q of live) {
    if (q.status in byStatus) byStatus[q.status] += 1
    const typeName = q.insuranceType?.name ?? 'Unspecified'
    typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1)
  }

  const byInsuranceType = Array.from(typeCounts, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const recent = [...live]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, recentLimit)

  return { total: live.length, byStatus, byInsuranceType, recent }
}
