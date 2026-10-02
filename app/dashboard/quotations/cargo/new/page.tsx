// FILE: app/dashboard/quotations/cargo/new/page.tsx
import type { Metadata } from 'next'
import { CargoQuotationForm } from '@/components/cargo/CargoQuotationForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'New Cargo Quotation | PPMI Flow' }

export default function NewCargoQuotationPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="New Cargo Quotation"
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New Cargo' },
        ]}
      />
      <CargoQuotationForm mode="create" />
    </div>
  )
}