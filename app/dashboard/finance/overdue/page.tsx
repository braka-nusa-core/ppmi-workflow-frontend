// FILE: app/dashboard/finance/overdue/page.tsx
import type { Metadata } from 'next'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Overdue Payments | PPMI Flow' }

export default function OverduePage() {
  // NEXT_PUBLIC_DEMO_MODE=true → read-only demo queue showing ONLY overdue payments.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoPaymentQueuePage } = require('@/components/demo/pages/DemoPaymentQueuePage') as typeof import('@/components/demo/pages/DemoPaymentQueuePage')
    return <DemoPaymentQueuePage mode="overdue" />
  }

  // PaymentListClient manages its own data; OVERDUE filter is pre-set
  // via activeFilters on mount — left to the user to apply via filter UI,
  // or wired to a defaultFilters prop if needed in future.
  return (
    <div className="page-container">
      <PaymentListClient />
    </div>
  )
}