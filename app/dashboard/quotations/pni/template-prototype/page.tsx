// FILE: app/dashboard/quotations/pni/template-prototype/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TemplatePrototypeClient } from '@/components/quotation-templates/TemplatePrototypeClient'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'P&I Template Prototype | PPMI Flow' }

export default function PniTemplatePrototypePage() {
  return (
    <div className="page-container">
      <PageHeader
        title="P&I Quotation Template Prototype"
        description="Phase 3 prototype on mock data — MSIG Specialty Marine NV and Eagle Ocean Marine templates."
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'P&I template prototype' },
        ]}
      />
      <TemplatePrototypeClient />
    </div>
  )
}