import type { Metadata } from 'next'
import { QuotationEditClient } from '@/components/quotations/QuotationEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit Quotation | PPMI Flow' }

export default function EditQuotationPage({ params }: Props) {
  return <QuotationEditClient id={params.id} />
}