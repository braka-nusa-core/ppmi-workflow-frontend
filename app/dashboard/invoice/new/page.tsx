import type { Metadata } from 'next'
import { Suspense }      from 'react'
import { InvoiceCreateClient } from '@/components/invoice/InvoiceCreateClient'

export const metadata: Metadata = { title: 'New Invoice | PPMI Flow' }

export default function NewInvoicePage() {
  // Wrapped in Suspense because InvoiceCreateClient uses useSearchParams
  return (
    <Suspense>
      <InvoiceCreateClient />
    </Suspense>
  )
}
