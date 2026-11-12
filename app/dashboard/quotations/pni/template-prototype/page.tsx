// FILE: app/dashboard/quotations/pni/template-prototype/page.tsx
// The P&I quotation creation page (ROUTES.quotations.pniNew): the insurer
// template prototype, saving to the real P&I API.
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TemplatePrototypeClient } from '@/components/quotation-templates/TemplatePrototypeClient'
import { ROUTES } from '@/config/routes'

export const metadata: Metadata = { title: 'P&I Quotation | PPMI Flow' }

export default function PniTemplatePrototypePage({ searchParams }: { searchParams: { id?: string } }) {
  const editing = Boolean(searchParams.id)
  return (
    <div className="page-container">
      <PageHeader
        title={editing ? 'Edit P&I Quotation' : 'New P&I Quotation'}
        description={editing
          ? 'Edit the saved quotation on the insurer’s own paper. Changes update this quotation; the live preview and PDF follow your edits.'
          : 'Create a P&I quotation on the insurer’s own paper — MSIG Specialty Marine NV or Eagle Ocean Marine — with a live document preview and PDF.'}
        breadcrumbs={editing ? [
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'Quotation', href: ROUTES.quotations.detail(searchParams.id as string) },
          { label: 'Edit' },
        ] : [
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: 'New P&I quotation' },
        ]}
      />
      <TemplatePrototypeClient initialId={searchParams.id} />
    </div>
  )
}
