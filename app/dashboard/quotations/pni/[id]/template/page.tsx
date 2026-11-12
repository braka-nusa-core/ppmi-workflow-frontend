// FILE: app/dashboard/quotations/pni/[id]/template/page.tsx
// The insurer paper is now the P&I quotation detail page itself; this legacy URL just forwards to it.
import { redirect } from 'next/navigation'
import { ROUTES } from '@/config/routes'

export default function PniTemplateRedirectPage({ params }: { params: { id: string } }) {
  redirect(ROUTES.quotations.detail(params.id))
}
