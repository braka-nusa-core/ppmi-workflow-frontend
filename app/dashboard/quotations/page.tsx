import type { Metadata } from 'next'
import { QuotationListClient } from '@/components/quotations/QuotationListClient'

export const metadata: Metadata = { title: 'Quotations | PPMI Flow' }

export default function QuotationListPage() {
  // QuotationListClient fetches its own data via useQuotations()
  // (Phase 1 React Query hook) — no server-side fetch, matching the
  // rest of the app (JWT lives in localStorage, not accessible here).
  return (
    <div className="page-container">
      <QuotationListClient />
    </div>
  )
}