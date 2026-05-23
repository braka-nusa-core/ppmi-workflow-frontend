import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_VOUCHER_DETAIL, MOCK_VOUCHER_LIST } from '@/lib/mock/voucherData'
import { VoucherDetailClient } from '@/components/voucher/VoucherDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = params.id === MOCK_VOUCHER_DETAIL.id
    ? MOCK_VOUCHER_DETAIL
    : MOCK_VOUCHER_LIST.find((v) => v.id === params.id)
  return { title: doc ? `${doc.docNumber} | PPMI Flow` : 'Voucher | PPMI Flow' }
}

export default function VoucherDetailPage({ params }: Props) {
  const vch = params.id === 'vch-001' ? MOCK_VOUCHER_DETAIL : null
  if (!vch) notFound()
  return <VoucherDetailClient vch={vch} />
}
