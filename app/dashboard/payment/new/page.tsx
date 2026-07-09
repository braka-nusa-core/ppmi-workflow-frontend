import type { Metadata } from 'next'
import { Suspense }      from 'react'
import { PaymentCreateClient } from '@/components/payment/PaymentCreateClient'

export const metadata: Metadata = { title: 'New Payment | PPMI Flow' }

export default function NewPaymentPage() {
  return (
    <Suspense>
      <PaymentCreateClient />
    </Suspense>
  )
}