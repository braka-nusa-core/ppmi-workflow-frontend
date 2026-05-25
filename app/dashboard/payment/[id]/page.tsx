import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_PAYMENT_DETAIL, MOCK_PAYMENT_LIST } from '@/lib/mock/paymentData'
import { PaymentDetailClient } from '@/components/payment/PaymentDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = params.id === MOCK_PAYMENT_DETAIL.id
    ? MOCK_PAYMENT_DETAIL
    : MOCK_PAYMENT_LIST.find((p) => p.id === params.id)
  return { title: doc ? `${doc.docNumber} | PPMI Flow` : 'Payment | PPMI Flow' }
}

export default function PaymentDetailPage({ params }: Props) {
  const pay = params.id === 'pay-003' ? MOCK_PAYMENT_DETAIL : null
  if (!pay) notFound()
  return <PaymentDetailClient pay={pay} />
}
