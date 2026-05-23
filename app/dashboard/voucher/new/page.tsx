import type { Metadata } from 'next'
import { Suspense }      from 'react'
import { VoucherCreateClient } from '@/components/voucher/VoucherCreateClient'

export const metadata: Metadata = { title: 'New Voucher | PPMI Flow' }

export default function NewVoucherPage() {
  return (
    <Suspense>
      <VoucherCreateClient />
    </Suspense>
  )
}
