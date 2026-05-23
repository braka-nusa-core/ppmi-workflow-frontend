import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Finance' }

export default function FinancePage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Payment Monitor"
        description="Payment tracking, installment monitoring, and finance verification"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payment Monitor' }]}
      />
      <p className="text-sm text-[#9aa3ad]">Finance monitor — implement per Stitch design</p>
    </div>
  )
}
