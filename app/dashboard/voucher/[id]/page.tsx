import type { Metadata }        from 'next'
import { VoucherDetailClient }  from '@/components/voucher/VoucherDetailClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Voucher Detail | PPMI Flow' }

export default function VoucherDetailPage({ params }: Props) {
  // VoucherDetailClient self-fetches via useQuery(fetchVoucherDetail).
  // JWT is stored in localStorage — cannot be accessed server-side.
  return <VoucherDetailClient id={params.id} />
}