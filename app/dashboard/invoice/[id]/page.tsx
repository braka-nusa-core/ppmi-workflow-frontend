import type { Metadata } from 'next'
import { InvoiceDetailClient } from '@/components/invoice/InvoiceDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Title is set dynamically inside InvoiceDetailClient once data loads.
  return { title: `Invoice ${params.id} | PPMI Flow` }
}

export default function InvoiceDetailPage({ params }: Props) {
  // InvoiceDetailClient owns the fetch via useQuery(['invoice-detail', id]).
  // No data is passed from the server — eliminates the mock dependency entirely.
  return <InvoiceDetailClient id={params.id} />
}