// FILE: components/quotation-templates/msig/msigModule.ts
// Wires the MSIG template pieces into the generic workspace.

import { buildMsigDocument } from '@/lib/quotation-templates/msig/buildDocument'
import { renderMsigPdfBlob } from '@/lib/quotation-templates/msig/exportPdf'
import { createBlankMsigData } from '@/lib/quotation-templates/msig/fixtures'
import { validateMsigData } from '@/lib/quotation-templates/msig/format'
import { createMsigRepository } from '@/lib/quotation-templates/msig/repository'
import { MSIG_TEMPLATE_ID } from '@/lib/quotation-templates/msig/template'
import { MSIG_CLUB_FORMAT, type MsigDocument, type MsigFormData, type MsigTemplate } from '@/lib/quotation-templates/msig/types'
import type { TemplateModule } from '../templateModule'
import { MsigEditor } from './MsigEditor'
import { MsigPreview } from './MsigPreview'

export const msigModule: TemplateModule<MsigFormData, MsigTemplate, MsigDocument> = {
  code: MSIG_CLUB_FORMAT,
  label: 'MSIG Specialty Marine NV',
  templateId: MSIG_TEMPLATE_ID,
  repo: createMsigRepository,
  createBlank: createBlankMsigData,
  buildDocument: buildMsigDocument,
  validate: validateMsigData,
  Editor: MsigEditor,
  Preview: MsigPreview,
  renderPdf: (doc) => renderMsigPdfBlob(doc),
  fileName: (d) => `MSIG-Quotation-${(d.reference || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`,
  insurerName: (t) => t?.insurerName ?? '',
  savedLabel: (d) => `${d.reference || '(no reference)'} — ${d.assured || '(no assured)'}`,
}