import type { Metadata } from 'next'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Overdue Payments | PPMI Flow' }

export default function OverduePage() {
  // PaymentListClient manages its own data; OVERDUE filter is pre-set
  // via activeFilters on mount — left to the user to apply via filter UI,
  // or wired to a defaultFilters prop if needed in future.
  return (
    <div className="page-container">
      <PaymentListClient />
    </div>
  )
}
