// FILE: app/dashboard/admin/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Administration' }

export default function AdminPage() {
  // NEXT_PUBLIC_DEMO_MODE=true → strictly read-only demo overview (fictional users).
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoAdminPage } = require('@/components/demo/pages/DemoAdminPage') as typeof import('@/components/demo/pages/DemoAdminPage')
    return <DemoAdminPage />
  }

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