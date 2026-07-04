import type { Metadata }       from 'next'
import { VoucherListClient }   from '@/components/voucher/VoucherListClient'

export const metadata: Metadata = { title: 'Vouchers | PPMI Flow' }

export default function VoucherListPage() {
  return (
    <div className="page-container">
      <VoucherListClient />
    </div>
  )
}