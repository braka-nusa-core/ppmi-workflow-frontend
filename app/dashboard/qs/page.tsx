import type { Metadata } from 'next'
import { QSListClient } from '@/components/qs/QSListClient'

export const metadata: Metadata = { title: 'Quotation Sheets | PPMI Flow' }

export default function QSListPage() {
  // QSListClient fetches its own data from the real API (lib/api/qs.ts)
  // using table state (page/search/sort/filters) as query params.
  return (
    <div className="page-container">
      <QSListClient />
    </div>
  )
}