import type { Metadata } from 'next'
import { PageHeader }    from '@/components/layout/PageHeader'
import { MOCK_PAYMENT_LIST } from '@/lib/mock/paymentData'
import { PaymentListClient } from '@/components/payment/PaymentListClient'

export const metadata: Metadata = { title: 'Overdue Payments | PPMI Flow' }

const overdueOnly = MOCK_PAYMENT_LIST.filter((p) => p.paymentStatus === 'OVERDUE')

export default function OverduePage() {
  return (
    <div className="page-container">
      <PaymentListClient
        initialData={overdueOnly}
        totalRecords={overdueOnly.length}
      />
    </div>
  )
}
