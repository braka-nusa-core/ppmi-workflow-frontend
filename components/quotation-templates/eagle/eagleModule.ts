// FILE: components/quotation-templates/eagle/eagleModule.ts
// Wires the Eagle template pieces into the generic workspace.

import { buildEagleDocument } from '@/lib/quotation-templates/eagle/buildDocument'
import { renderEaglePdfBlob } from '@/lib/quotation-templates/eagle/exportPdf'
import { createBlankEagleData } from '@/lib/quotation-templates/eagle/fixtures'
import { validateEagleData } from '@/lib/quotation-templates/eagle/format'
import { createEagleRepository } from '@/lib/quotation-templates/eagle/repository'
import { EAGLE_TEMPLATE_ID } from '@/lib/quotation-templates/eagle/template'
import { EAGLE_CLUB_FORMAT, type EagleDocument, type EagleFormData, type EagleTemplate } from '@/lib/quotation-templates/eagle/types'
import type { TemplateModule } from '../templateModule'
import { EagleEditor } from './EagleEditor'
import { EaglePreview } from './EaglePreview'

export const eagleModule: TemplateModule<EagleFormData, EagleTemplate, EagleDocument> = {
  code: EAGLE_CLUB_FORMAT,
  label: 'Eagle Ocean Marine',
  templateId: EAGLE_TEMPLATE_ID,
  repo: createEagleRepository,
  createBlank: createBlankEagleData,
  buildDocument: buildEagleDocument,
  validate: validateEagleData,
  Editor: EagleEditor,
  Preview: EaglePreview,
  renderPdf: (doc) => renderEaglePdfBlob(doc),
  fileName: (d) => `Eagle-Quotation-${(d.reference || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`,
  insurerName: (t) => t?.insurerName ?? '',
  savedLabel: (d) => `${d.reference || '(no reference)'} — ${d.applicant || '(no applicant)'}`,
}