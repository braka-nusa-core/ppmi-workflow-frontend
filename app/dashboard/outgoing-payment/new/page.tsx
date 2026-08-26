import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OutgoingPaymentCreateClient } from '@/components/outgoing-payment/OutgoingPaymentCreateClient'

export const metadata: Metadata = { title: 'New Outgoing Payment | PPMI Flow' }

export default function NewOutgoingPaymentPage() {
  return (
    <Suspense>
      <OutgoingPaymentCreateClient />
    </Suspense>
  )
}
