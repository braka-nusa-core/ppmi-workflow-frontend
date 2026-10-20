// FILE: app/dashboard/quotations/pni/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { PniQuotationEditClient } from '@/components/pni/PniQuotationEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit P&I Quotation | PPMI Flow' }

export default function EditPniQuotationPage({ params }: Props) {
  return <PniQuotationEditClient quotationId={params.id} />
}