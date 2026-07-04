import type { Metadata } from 'next'
import { PaymentDetailClient } from '@/components/payment/PaymentDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Payment ${params.id} | PPMI Flow` }
}

export default function PaymentDetailPage({ params }: Props) {
  // PaymentDetailClient owns the fetch via useQuery(['payment-detail', id]).
  return <PaymentDetailClient id={params.id} />
}