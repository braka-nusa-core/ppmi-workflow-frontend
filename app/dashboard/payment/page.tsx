import type { Metadata } from 'next'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Payments | PPMI Flow' }

export default function PaymentListPage() {
  // PaymentListClient fetches its own data via useQuery(['payment-list', ...]).
  return (
    <div className="page-container">
      <PaymentListClient />
    </div>
  )
}