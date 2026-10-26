// FILE: lib/quotation-templates/msig/repository.ts
// MSIG adapter boundary. Uses the shared local mock (see
// shared/localMockRepository.ts). Same storage key as Phase 3, so quotations
// saved earlier in this browser remain available.
//
// Contract points the backend still has to define (unverified):
//   • how templates are stored/served and versioned (getTemplate)
//   • whether a quotation records templateId + templateVersion (saved record)
//   • whether old template versions stay retrievable (getTemplate with version)

import { LocalMockTemplateRepository, type SavedTemplateQuotation, type TemplateRepository } from '../shared/localMockRepository'
import { MSIG_SAMPLE_ID, createMsigSampleData } from './fixtures'
import { MSIG_TEMPLATE } from './template'
import type { MsigFormData, MsigTemplate } from './types'

export type MsigSavedQuotation = SavedTemplateQuotation<MsigFormData>
export type MsigQuotationRepository = TemplateRepository<MsigFormData, MsigTemplate>

/** Single switch point: replace with an API-backed repository when the backend contract exists. */
export function createMsigRepository(): MsigQuotationRepository {
  return new LocalMockTemplateRepository<MsigFormData, MsigTemplate>({
    storeKey: 'ppmi.msigPrototype.mock.v1',
    idPrefix: 'mock-msig',
    template: MSIG_TEMPLATE,
    seed: () => [{
      id: MSIG_SAMPLE_ID, templateId: MSIG_TEMPLATE.templateId, templateVersion: MSIG_TEMPLATE.templateVersion,
      data: createMsigSampleData(), savedAt: '2026-06-17T00:00:00.000Z',
    }],
  })
}