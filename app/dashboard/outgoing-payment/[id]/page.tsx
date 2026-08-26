import type { Metadata } from 'next'
import { OutgoingPaymentDetailClient } from '@/components/outgoing-payment/OutgoingPaymentDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Outgoing Payment ${params.id} | PPMI Flow` }
}

export default function OutgoingPaymentDetailPage({ params }: Props) {
  return <OutgoingPaymentDetailClient id={params.id} />
}
