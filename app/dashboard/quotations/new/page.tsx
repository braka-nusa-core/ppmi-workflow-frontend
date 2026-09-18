import type { Metadata } from 'next'
import { QuotationForm } from '@/components/quotations/QuotationForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'New Quotation | PPMI Flow' }

export default function NewQuotationPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="New Quotation"
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New' },
        ]}
      />
      <QuotationForm mode="create" />
    </div>
  )
}