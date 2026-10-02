// FILE: app/dashboard/quotations/pni/new/page.tsx
import type { Metadata } from 'next'
import { PniQuotationForm } from '@/components/pni/PniQuotationForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'New P&I Quotation | PPMI Flow' }

export default function NewPniQuotationPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="New P&I Quotation"
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New P&I' },
        ]}
      />
      <PniQuotationForm mode="create" />
    </div>
  )
}