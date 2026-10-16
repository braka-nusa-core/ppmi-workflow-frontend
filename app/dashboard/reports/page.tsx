// FILE: app/dashboard/reports/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  // NEXT_PUBLIC_DEMO_MODE=true → read-only demo reports derived from the demo records.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoReportsPage } = require('@/components/demo/pages/DemoReportsPage') as typeof import('@/components/demo/pages/DemoReportsPage')
    return <DemoReportsPage />
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Reports"
        description="Operational reports and analytics"
        breadcrumbs={[{ label: 'Reports' }]}
      />
      <p className="text-sm text-[#9aa3ad]">Reports — implement per Stitch design</p>
    </div>
  )
}