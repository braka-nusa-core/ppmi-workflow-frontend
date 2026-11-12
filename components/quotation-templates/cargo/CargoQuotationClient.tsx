// FILE: components/quotation-templates/cargo/CargoQuotationClient.tsx
// Cargo quotation workspace entry point — wrapper around TemplateWorkspace.
// Talks to cargoModule via TemplateRepository interface.

'use client'

import { TemplateWorkspace } from '@/components/quotation-templates/TemplateWorkspace'
import type { TemplateModule } from '@/components/quotation-templates/templateModule'
import { createCargoModule } from './cargoModule'
import { createBlankCargoData } from '@/lib/quotation-templates/cargo/fixtures'
import { ROUTES } from '@/config/routes'
import { useCallback, useMemo } from 'react'
import type { CargoFormData, CargoTemplate } from '@/lib/quotation-templates/cargo/types'
import type { SavedTemplateQuotation } from '@/lib/quotation-templates/shared/repositoryTypes'
import { useRouter } from 'next/navigation'

interface CargoQuotationClientProps {
  initialId?: string
  onSaved?: (rec: SavedTemplateQuotation<CargoFormData>) => void
  onNew?: () => void
}

/**
 * Cargo quotation workspace — main entry for new/edit.
 * Wraps generic TemplateWorkspace with Cargo-specific module.
 */
export function CargoQuotationClient({ initialId, onSaved, onNew }: CargoQuotationClientProps) {
  const router = useRouter()

  // ponytail: Phase 2B implements real context bridge (actorId, tenantId, clientId, insuranceTypeId from session)
  const contextBridge = useMemo(() => ({
    actorId: 'system',
    tenantId: 'default',
    clientId: '', // ponytail: populate from selected client in actual flow
    insuranceTypeId: 'CARGO',
    onSaved: onSaved as any,
  }), [onSaved])

  const cargoModule = useMemo(
    () => createCargoModule(contextBridge),
    [contextBridge]
  ) as TemplateModule<CargoFormData, CargoTemplate, any>

  const handleNew = useCallback(() => {
    onNew?.()
    router.push(ROUTES.quotations.cargoNew)
  }, [onNew, router])

  return (
    <TemplateWorkspace
      module={cargoModule}
      initialId={initialId}
      onSaved={onSaved as any}
      onNew={handleNew}
    />
  )
}
