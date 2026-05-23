import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_INVOICE_DETAIL } from '@/lib/mock/invoiceData'
import { InvoiceEditClient }   from '@/components/invoice/InvoiceEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Invoice | PPMI Flow' }

export default function InvoiceEditPage({ params }: Props) {
  const invoice = params.id === 'inv-001' ? MOCK_INVOICE_DETAIL : null
  if (!invoice) notFound()
  if (invoice.status !== 'DRAFT' && invoice.status !== 'ISSUED') notFound()
  return <InvoiceEditClient invoice={invoice} />
}
