import type { Metadata } from 'next'
import { MOCK_VOUCHER_LIST, MOCK_VOUCHER_PAGINATION } from '@/lib/mock/voucherData'
import { VoucherListClient } from '@/components/voucher/VoucherListClient'

export const metadata: Metadata = { title: 'Vouchers | PPMI Flow' }

export default function VoucherListPage() {
  return (
    <div className="page-container">
      <VoucherListClient
        initialData={MOCK_VOUCHER_LIST}
        totalRecords={MOCK_VOUCHER_PAGINATION.total}
      />
    </div>
  )
}
