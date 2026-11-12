// FILE: components/pni/PniEditEntry.tsx
// Entry for /dashboard/quotations/pni/:id/edit. Every P&I quotation whose club has an
// insurer template is edited in the template editor (ROUTES.quotations.pniTemplateEdit);
// only a quotation of a club WITHOUT a template (no paper exists yet) still opens the
// legacy P&I form, so it remains editable at all.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/feedback/ErrorState'
import { PageSpinner } from '@/components/ui/Spinner'
import { getPniTemplateAdapter } from '@/components/quotation-templates/pniTemplates'
import { PniQuotationEditClient } from '@/components/pni/PniQuotationEditClient'
import { ROUTES } from '@/config/routes'
import { usePniQuotation } from '@/hooks/usePni'
import type { ApiError } from '@/types/api'

export function PniEditEntry({ quotationId }: { quotationId: string }) {
  const router = useRouter()
  const { data: pni, isLoading, isError, error, refetch } = usePniQuotation(quotationId)
  const hasTemplate = Boolean(getPniTemplateAdapter(pni?.club.code))

  useEffect(() => {
    if (hasTemplate) router.replace(ROUTES.quotations.pniTemplateEdit(quotationId))
  }, [hasTemplate, quotationId, router])

  if (isLoading || hasTemplate) return <div className="page-container"><PageSpinner label="Opening the quotation editor…" /></div>
  if (isError || !pni) {
    return (
      <div className="page-container">
        <ErrorState message={(error as ApiError | undefined)?.message ?? 'Failed to load P&I quotation'} description="An error occurred while loading this quotation. Please try again." onRetry={() => refetch()} />
      </div>
    )
  }
  return <PniQuotationEditClient quotationId={quotationId} /> // legacy form: this club has no insurer template yet
}
