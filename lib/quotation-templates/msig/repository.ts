// FILE: lib/quotation-templates/msig/repository.ts
// ═══════════════════════════════════════════════════════════════
// DATA-SOURCE ADAPTER BOUNDARY (MOCK)
//
// The UI talks only to `MsigQuotationRepository`. The implementation below
// is a LOCAL MOCK: template comes from the bundled module, saved quotations
// live in this browser's localStorage. No HTTP call is made and no endpoint
// is assumed. A future API-backed repository must implement the same
// interface (and map to/from the backend contract in one place); nothing in
// components/ or the renderers should need to change.
//
// Contract points the backend still has to define (unverified):
//   • how templates are stored/served and versioned (getTemplate)
//   • whether a quotation records templateId + templateVersion (saved record)
//   • whether old template versions stay retrievable (getTemplate with version)
// ═══════════════════════════════════════════════════════════════

import { MSIG_SAMPLE_ID, createMsigSampleData, newMsigId } from './fixtures'
import { MSIG_TEMPLATE } from './template'
import type { MsigFormData, MsigTemplate } from './types'

export interface MsigSavedQuotation {
  id: string
  templateId: string
  /** Pinned at creation; opening/saving never silently switches it. */
  templateVersion: string
  data: MsigFormData
  savedAt: string
}

export interface MsigSaveInput {
  id?: string
  templateId: string
  templateVersion: string
  data: MsigFormData
}

export interface MsigQuotationRepository {
  /** `version` omitted → latest available; given → exactly that version or null. */
  getTemplate(templateId: string, version?: string): Promise<MsigTemplate | null>
  listQuotations(): Promise<MsigSavedQuotation[]>
  getQuotation(id: string): Promise<MsigSavedQuotation | null>
  saveQuotation(input: MsigSaveInput): Promise<MsigSavedQuotation>
}

const STORE_KEY = 'ppmi.msigPrototype.mock.v1'
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

class LocalMockMsigRepository implements MsigQuotationRepository {
  private mem: MsigSavedQuotation[] | null = null

  private read(): MsigSavedQuotation[] {
    if (this.mem) return this.mem
    let list: MsigSavedQuotation[] | null = null
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORE_KEY) : null
      if (raw) list = JSON.parse(raw) as MsigSavedQuotation[]
    } catch { /* storage unavailable or corrupt → fall back to seed */ }
    this.mem = list ?? [{
      id: MSIG_SAMPLE_ID, templateId: MSIG_TEMPLATE.templateId, templateVersion: MSIG_TEMPLATE.templateVersion,
      data: createMsigSampleData(), savedAt: '2026-06-17T00:00:00.000Z',
    }]
    return this.mem
  }

  private write(): void {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(STORE_KEY, JSON.stringify(this.mem)) } catch { /* best effort */ }
  }

  async getTemplate(templateId: string, version?: string) {
    if (templateId !== MSIG_TEMPLATE.templateId) return null
    if (version && version !== MSIG_TEMPLATE.templateVersion) return null
    return clone(MSIG_TEMPLATE)
  }

  async listQuotations() { return clone(this.read()) }

  async getQuotation(id: string) {
    const found = this.read().find((q) => q.id === id)
    return found ? clone(found) : null
  }

  async saveQuotation(input: MsigSaveInput) {
    const list = this.read()
    const record: MsigSavedQuotation = {
      id: input.id ?? newMsigId('mock-msig'),
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      data: clone(input.data),
      savedAt: new Date().toISOString(),
    }
    const i = list.findIndex((q) => q.id === record.id)
    if (i >= 0) list[i] = record
    else list.push(record)
    this.write()
    return clone(record)
  }
}

/** Single switch point: replace with an API-backed repository when the backend contract exists. */
export function createMsigRepository(): MsigQuotationRepository {
  return new LocalMockMsigRepository()
}