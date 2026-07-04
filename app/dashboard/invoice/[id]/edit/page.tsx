import type { Metadata } from 'next'
import { InvoiceEditClient } from '@/components/invoice/InvoiceEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Invoice | PPMI Flow' }

export default function InvoiceEditPage({ params }: Props) {
  // InvoiceEditClient owns the fetch via useQuery(['invoice-detail', id]).
  // Status guard (DRAFT/PENDING only) is enforced inside the client component
  // once real data is available — eliminates the mock dependency entirely.
  return <InvoiceEditClient id={params.id} />
}