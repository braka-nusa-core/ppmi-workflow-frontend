import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
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
