import type { Metadata } from 'next'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Finance Verification | PPMI Flow' }

export default function VerificationPage() {
  // PaymentListClient manages its own data; verification filter applied
  // via filter UI. Backend does not support verificationStatus query param.
  return (
    <div className="page-container">
      <PaymentListClient />
    </div>
  )
}