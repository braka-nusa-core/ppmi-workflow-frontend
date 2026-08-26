import type { Metadata } from 'next'
import { OutgoingPaymentListClient } from '@/components/outgoing-payment/OutgoingPaymentListClient'

export const metadata: Metadata = { title: 'Outgoing Payment | PPMI Flow' }

export default function OutgoingPaymentPage() {
  return <OutgoingPaymentListClient />
}
