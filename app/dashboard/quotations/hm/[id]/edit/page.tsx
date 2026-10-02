// FILE: app/dashboard/quotations/hm/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { HmQuotationEditClient } from '@/components/hm/HmQuotationEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit H&M Quotation | PPMI Flow' }

export default function EditHmQuotationPage({ params }: Props) {
  return <HmQuotationEditClient quotationId={params.id} />
}