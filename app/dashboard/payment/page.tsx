import type { Metadata } from 'next'
import { MOCK_PAYMENT_LIST, MOCK_PAYMENT_PAGINATION } from '@/lib/mock/paymentData'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Payments | PPMI Flow' }

export default function PaymentListPage() {
  return (
    <div className="page-container">
      <PaymentListClient
        initialData={MOCK_PAYMENT_LIST}
        totalRecords={MOCK_PAYMENT_PAGINATION.total}
      />
    </div>
  )
}
