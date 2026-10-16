// FILE: app/dashboard/finance/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Finance' }

export default function FinancePage() {
  // NEXT_PUBLIC_DEMO_MODE=true → read-only demo Payment Monitor. The inline
  // comparison + require lets the bundler drop the demo module when the flag is off.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoFinanceMonitorPage } = require('@/components/demo/pages/DemoFinanceMonitorPage') as typeof import('@/components/demo/pages/DemoFinanceMonitorPage')
    return <DemoFinanceMonitorPage />
  }

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