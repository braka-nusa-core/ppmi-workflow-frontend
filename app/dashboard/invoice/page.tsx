import type { Metadata } from 'next'
import { MOCK_INVOICE_LIST, MOCK_INVOICE_PAGINATION } from '@/lib/mock/invoiceData'
import { InvoiceListClient } from '@/components/invoice/InvoiceListClient'

export const metadata: Metadata = { title: 'Invoices | PPMI Flow' }

export default function InvoiceListPage() {
  return (
    <div className="page-container">
      <InvoiceListClient
        initialData={MOCK_INVOICE_LIST}
        totalRecords={MOCK_INVOICE_PAGINATION.total}
      />
    </div>
  )
}
