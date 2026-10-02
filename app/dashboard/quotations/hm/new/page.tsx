// FILE: app/dashboard/quotations/hm/new/page.tsx
import type { Metadata } from 'next'
import { HmQuotationForm } from '@/components/hm/HmQuotationForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'New H&M Quotation | PPMI Flow' }

export default function NewHmQuotationPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="New H&M Quotation"
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New H&M' },
        ]}
      />
      <HmQuotationForm mode="create" />
    </div>
  )
}