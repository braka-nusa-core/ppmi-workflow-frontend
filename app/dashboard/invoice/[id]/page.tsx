import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_INVOICE_DETAIL, MOCK_INVOICE_LIST } from '@/lib/mock/invoiceData'
import { InvoiceDetailClient } from '@/components/invoice/InvoiceDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = params.id === MOCK_INVOICE_DETAIL.id
    ? MOCK_INVOICE_DETAIL
    : MOCK_INVOICE_LIST.find((i) => i.id === params.id)
  return { title: doc ? `${doc.docNumber} | PPMI Flow` : 'Invoice | PPMI Flow' }
}

export default function InvoiceDetailPage({ params }: Props) {
  const invoice = params.id === 'inv-001' ? MOCK_INVOICE_DETAIL : null
  if (!invoice) notFound()
  return <InvoiceDetailClient invoice={invoice} />
}
