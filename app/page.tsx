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
        description="Save the quotation first — the insurer template (MSIG, Eagle Ocean Marine) is then available from the saved quotation’s page."
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New P&I' },
        ]}
      />
      <PniQuotationForm mode="create" />
    </div>
  )
}