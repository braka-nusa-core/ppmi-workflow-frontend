// FILE: app/dashboard/finance/verification/page.tsx
import type { Metadata } from 'next'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Finance Verification | PPMI Flow' }

export default function VerificationPage() {
  // NEXT_PUBLIC_DEMO_MODE=true → read-only demo queue of received payments by verification state.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoPaymentQueuePage } = require('@/components/demo/pages/DemoPaymentQueuePage') as typeof import('@/components/demo/pages/DemoPaymentQueuePage')
    return <DemoPaymentQueuePage mode="verification" />
  }

  // PaymentListClient manages its own data; verification filter applied
  // via filter UI. Backend does not support verificationStatus query param.
  return (
    <div className="page-container">
      <PaymentListClient />
    </div>
  )
}