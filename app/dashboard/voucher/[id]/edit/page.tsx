import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_VOUCHER_DETAIL } from '@/lib/mock/voucherData'
import { VoucherEditClient }   from '@/components/voucher/VoucherEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Voucher | PPMI Flow' }

export default function VoucherEditPage({ params }: Props) {
  const vch = params.id === 'vch-001' ? MOCK_VOUCHER_DETAIL : null
  if (!vch) notFound()
  if (vch.status !== 'DRAFT' && vch.status !== 'PENDING_APPROVAL') notFound()
  return <VoucherEditClient vch={vch} />
}
