// FILE: lib/quotation-templates/eagle/repository.ts
// Eagle adapter boundary — local mock only (see shared/localMockRepository.ts).
// No endpoint is assumed; an API-backed repository must implement the same interface.

import { LocalMockTemplateRepository, type SavedTemplateQuotation, type TemplateRepository } from '../shared/localMockRepository'
import { EAGLE_SAMPLE_ID, createEagleSampleData } from './fixtures'
import { EAGLE_TEMPLATE } from './template'
import type { EagleFormData, EagleTemplate } from './types'

export type EagleSavedQuotation = SavedTemplateQuotation<EagleFormData>
export type EagleQuotationRepository = TemplateRepository<EagleFormData, EagleTemplate>

export function createEagleRepository(): EagleQuotationRepository {
  return new LocalMockTemplateRepository<EagleFormData, EagleTemplate>({
    storeKey: 'ppmi.eaglePrototype.mock.v1',
    idPrefix: 'mock-eagle',
    template: EAGLE_TEMPLATE,
    seed: () => [{
      id: EAGLE_SAMPLE_ID, templateId: EAGLE_TEMPLATE.templateId, templateVersion: EAGLE_TEMPLATE.templateVersion,
      data: createEagleSampleData(), savedAt: '2025-10-09T00:00:00.000Z',
    }],
  })
}