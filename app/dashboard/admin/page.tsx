import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Administration' }

export default function AdminPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Administration"
        description="User management, permissions, and system settings"
        breadcrumbs={[{ label: 'Administration' }]}
      />
      <p className="text-sm text-[#9aa3ad]">Admin dashboard — implement per Stitch design</p>
    </div>
  )
}
