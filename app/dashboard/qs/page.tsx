import type { Metadata } from 'next'
import { MOCK_QS_LIST, MOCK_QS_PAGINATION } from '@/lib/mock/qsData'
import { QSListClient } from '@/components/qs/QSListClient'

export const metadata: Metadata = { title: 'Quotation Sheets | PPMI Flow' }

export default function QSListPage() {
  // In production: fetch from API using searchParams for server-side filtering
  // const data = await fetchQSList(searchParams)
  return (
    <div className="page-container">
      <QSListClient
        initialData={MOCK_QS_LIST}
        totalRecords={MOCK_QS_PAGINATION.total}
      />
    </div>
  )
}
