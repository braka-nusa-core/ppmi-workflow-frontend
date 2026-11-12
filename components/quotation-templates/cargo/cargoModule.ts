// FILE: components/quotation-templates/cargo/cargoModule.ts
// Cargo quotation module — isolated from P&I (MSIG/Eagle).
// Generic workspace (TemplateWorkspace) drives the UI flow.
// Data layer talks to CargoQuotation API endpoint.

import type { TemplateModule } from '@/components/quotation-templates/templateModule'
import { createBlankCargoData } from '@/lib/quotation-templates/cargo/fixtures'
import { validateCargoData } from '@/lib/quotation-templates/cargo/format'
import { buildCargoDocument } from '@/lib/quotation-templates/cargo/buildDocument'
import { renderCargoPdfBlob } from '@/lib/quotation-templates/cargo/exportPdf'
import type { CargoFormData, CargoDocument, CargoTemplate } from '@/lib/quotation-templates/cargo/types'
import { CargoTemplateRepository } from '@/lib/quotation-templates/cargo/repository'
import { CargoEditor } from './CargoEditor'
import { CargoPreview } from './CargoPreview'

// Temporary placeholder until official logo acquired
const LOGO_PLACEHOLDER = '/logo/placeholder-logo.png'

/**
 * Temporary placeholder logo URL — replaces official PPMI logo until acquired.
 * PDF export uses PpmiPageChrome which expects logo at `${assetBase}/ppmi-logo.{svg|png}`.
 * This placeholder reserves the space but does not masquerade as the real asset.
 */
export const CARGO_LOGO_PLACEHOLDER = LOGO_PLACEHOLDER

/**
 * Temporary cargo template definition until backend `/cargo/template` endpoint supplies official wording.
 * 6 main clauses + 39 additional clauses must match official paper exactly.
 * Use placeholder wording until backend provides real clause catalog.
 */
export const CARGO_TEMPLATE_ID = 'cargo-standard-2026'

export const CARGO_TEMPLATE: CargoTemplate = {
  templateId: CARGO_TEMPLATE_ID,
  templateVersion: '1.0.0',
  insurerName: 'PT Pandi Proteksi Marine Indonesia',
  // Placeholder clause catalog until backend supplies official wording
  // Main clauses: 6 Institute Cargo Clause options
  mainClauses: [
    { id: 'INSTITUTE_CARGO_A', code: 'INSTITUTE_CARGO_A', label: 'Institute Cargo Clauses (A)', section: 'TERMS_CONDITIONS' },
    { id: 'INSTITUTE_CARGO_B', code: 'INSTITUTE_CARGO_B', label: 'Institute Cargo Clauses (B)', section: 'TERMS_CONDITIONS' },
    { id: 'INSTITUTE_CARGO_C', code: 'INSTITUTE_CARGO_C', label: 'Institute Cargo Clauses (C)', section: 'TERMS_CONDITIONS' },
    { id: 'INSTITUTE_BULK_OIL', code: 'INSTITUTE_BULK_OIL', label: 'Institute Bulk Oil Clauses', section: 'TERMS_CONDITIONS' },
    { id: 'INSTITUTE_COAL', code: 'INSTITUTE_COAL', label: 'Institute Coal Clauses', section: 'TERMS_CONDITIONS' },
    { id: 'INSTITUTE_CARGO_AIR', code: 'INSTITUTE_CARGO_AIR', label: 'Institute Cargo Clauses (Air)', section: 'TERMS_CONDITIONS' },
  ] as const,
  // Placeholder: 39 additional clauses (exact wording from backend only)
  additionalClauses: [] as const,
}

export interface CargoContextBridge {
  actorId: string
  tenantId: string
  clientId: string
  insuranceTypeId: string
  onSaved?: (saved: any) => void
}

/**
 * Create Cargo template module for use with TemplateWorkspace.
 * Repository talks to CargoQuotation backend API.
 */
export function createCargoModule(context: CargoContextBridge): TemplateModule<CargoFormData, CargoTemplate, any> {
  const repo = new CargoTemplateRepository<CargoFormData, CargoTemplate>({
    template: CARGO_TEMPLATE,
    context,
    codec: {
      toData: (d) => d,
      labelData: ({ insured, insuredAddress }) => ({ insured, insuredAddress }),
      buildCreate: (data, _context) => ({
        insured: data.insured,
        address: data.insuredAddress,
        // ... other base fields
      }),
      buildUpdate: (data, _context) => ({
        insured: data.insured,
        address: data.insuredAddress,
        // ... other base fields
      }),
    },
  })

  return {
    code: 'CARGO',
    label: 'Cargo Quotation',
    templateId: CARGO_TEMPLATE_ID,
    repo: () => repo,
    createBlank: () => createBlankCargoData(),
    buildDocument: (template, data) => buildCargoDocument(template, data),
    validate: (data) => validateCargoData(data),
    Editor: CargoEditor,
    Preview: CargoPreview,
    renderPdf: (doc) => renderCargoPdfBlob(doc),
    fileName: (data) => `Cargo-Quotation-${(data.quotationNumber || 'draft').replace(/[^a-zA-Z0-9.-]+/g, '_')}.pdf`,
    insurerName: (template) => template.insurerName,
    savedLabel: (data) => `${data.insured || '(no insured)'} — ${data.quotationNumber || '(no number)'}`,
    clientFields: { name: { field: 'insured', label: 'Insured' } },
  }
}
