import type { Metadata } from 'next'
import { InvoiceListClient } from '@/components/invoice/InvoiceListClient'

export const metadata: Metadata = { title: 'Invoices | PPMI Flow' }

export default function InvoiceListPage() {
  // InvoiceListClient fetches its own data from the real API (lib/api/invoice.ts)
  // using table state (page/search/sort/filters) as query params.
  return (
    <div className="page-container">
      <InvoiceListClient />
    </div>
  )
}