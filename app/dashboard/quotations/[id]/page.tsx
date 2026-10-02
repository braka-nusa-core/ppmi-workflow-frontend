// FILE: app/dashboard/quotations/[id]/page.tsx
import type { Metadata } from 'next'
import { QuotationDetailDispatcher } from '@/components/quotations/QuotationDetailDispatcher'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Quotation Detail | PPMI Flow' }

export default function QuotationDetailPage({ params }: Props) {
  // Dispatches to the H&M detail view (embedded hmQuotation flag), the
  // P&I detail view (GET /pni/quotations/:id probe), or the existing
  // generic QuotationDetailClient — see QuotationDetailDispatcher's
  // own comment for the detection strategy (Phase 3C).
  return <QuotationDetailDispatcher id={params.id} />
}