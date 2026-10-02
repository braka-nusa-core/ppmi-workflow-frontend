// FILE: app/dashboard/quotations/cargo/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { CargoQuotationEditClient } from '@/components/cargo/CargoQuotationEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit Cargo Quotation | PPMI Flow' }

export default function EditCargoQuotationPage({ params }: Props) {
  return <CargoQuotationEditClient quotationId={params.id} />
}