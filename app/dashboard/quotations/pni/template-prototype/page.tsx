// FILE: app/dashboard/quotations/pni/template-prototype/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { MsigPrototypeClient } from '@/components/quotation-templates/msig/MsigPrototypeClient'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'P&I Template Prototype | PPMI Flow' }

export default function PniTemplatePrototypePage() {
  return (
    <div className="page-container">
      <PageHeader
        title="P&I Quotation Template Prototype"
        description="Phase 3 prototype on mock data — MSIG Specialty Marine NV template only."
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'P&I template prototype' },
        ]}
      />
      <MsigPrototypeClient />
    </div>
  )
}