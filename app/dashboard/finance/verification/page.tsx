import type { Metadata } from 'next'
import { MOCK_PAYMENT_LIST } from '@/lib/mock/paymentData'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Finance Verification | PPMI Flow' }

const unverified = MOCK_PAYMENT_LIST.filter(
  (p) => p.verificationStatus === 'UNVERIFIED' || p.verificationStatus === 'FLAGGED'
)

export default function VerificationPage() {
  return (
    <div className="page-container">
      <PaymentListClient
        initialData={unverified}
        totalRecords={unverified.length}
      />
    </div>
  )
}
