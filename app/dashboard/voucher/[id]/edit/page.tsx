import type { Metadata }      from 'next'
import { VoucherEditClient }  from '@/components/voucher/VoucherEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Voucher | PPMI Flow' }

export default function VoucherEditPage({ params }: Props) {
  // VoucherEditClient self-fetches, enforces the DRAFT/PENDING_APPROVAL
  // edit guard, and handles its own loading/error states.
  return <VoucherEditClient id={params.id} />
}