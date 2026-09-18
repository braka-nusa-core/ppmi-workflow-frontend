import type { Metadata } from 'next'
import { QuotationDetailClient } from '@/components/quotations/QuotationDetailClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Quotation Detail | PPMI Flow' }

export default function QuotationDetailPage({ params }: Props) {
  // QuotationDetailClient fetches via useQuotation(id) (Phase 1 hook).
  // No server-side fetch — JWT lives in localStorage, not accessible here.
  return <QuotationDetailClient id={params.id} />
}