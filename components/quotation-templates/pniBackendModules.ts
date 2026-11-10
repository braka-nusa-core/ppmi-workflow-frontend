// FILE: components/quotation-templates/pniBackendModules.ts
// The two insurer templates wired to the REAL P&I API instead of the local
// prototype repository. Same editors, previews and PDF renderers — only the
// data source (repo) and the document builder (which also applies the saved
// quotation's own Security / Trading text) differ from msigModule / eagleModule.
// Deliberately imports no localStorage code.
import { buildEagleDocumentWithOverrides, pniToEagle } from '@/lib/quotation-templates/eagle/fromPni'
import { renderEaglePdfBlob } from '@/lib/quotation-templates/eagle/exportPdf'
import { createBlankEagleData } from '@/lib/quotation-templates/eagle/fixtures'
import { validateEagleData } from '@/lib/quotation-templates/eagle/format'
import { EAGLE_TEMPLATE, EAGLE_TEMPLATE_ID } from '@/lib/quotation-templates/eagle/template'
import { buildEagleCreate, buildEagleUpdate } from '@/lib/quotation-templates/eagle/toPni'
import { EAGLE_CLUB_FORMAT, type EagleDocument, type EagleFormData, type EagleTemplate } from '@/lib/quotation-templates/eagle/types'
import { buildMsigDocumentWithOverrides, pniToMsig } from '@/lib/quotation-templates/msig/fromPni'
import { renderMsigPdfBlob } from '@/lib/quotation-templates/msig/exportPdf'
import { createBlankMsigData } from '@/lib/quotation-templates/msig/fixtures'
import { validateMsigData } from '@/lib/quotation-templates/msig/format'
import { MSIG_TEMPLATE, MSIG_TEMPLATE_ID } from '@/lib/quotation-templates/msig/template'
import { buildMsigCreate, buildMsigUpdate } from '@/lib/quotation-templates/msig/toPni'
import { MSIG_CLUB_FORMAT, type MsigDocument, type MsigFormData, type MsigTemplate } from '@/lib/quotation-templates/msig/types'
import { PniBackendTemplateRepository, type PniContextBridge } from '@/lib/quotation-templates/shared/pniBackendRepository'
import type { TemplateModule } from './templateModule'
import { EagleEditor } from './eagle/EagleEditor'
import { EaglePreview } from './eagle/EaglePreview'
import { MsigEditor } from './msig/MsigEditor'
import { MsigPreview } from './msig/MsigPreview'

export type PniBackendModule =
  | TemplateModule<MsigFormData, MsigTemplate, MsigDocument>
  | TemplateModule<EagleFormData, EagleTemplate, EagleDocument>

export function createPniBackendModules(context: PniContextBridge) {
  const msigRepo = new PniBackendTemplateRepository<MsigFormData, MsigTemplate>({
    template: MSIG_TEMPLATE, context,
    codec: {
      clubCode: MSIG_CLUB_FORMAT,
      toData: (d) => pniToMsig(d).data,
      labelData: ({ reference, insured }) => ({ ...createBlankMsigData(), reference, assured: insured }),
      buildCreate: buildMsigCreate, buildUpdate: buildMsigUpdate,
    },
  })
  const eagleRepo = new PniBackendTemplateRepository<EagleFormData, EagleTemplate>({
    template: EAGLE_TEMPLATE, context,
    codec: {
      clubCode: EAGLE_CLUB_FORMAT,
      toData: (d) => pniToEagle(d).data,
      labelData: ({ reference, insured }) => ({ ...createBlankEagleData(), reference, applicant: insured }),
      buildCreate: buildEagleCreate, buildUpdate: buildEagleUpdate,
    },
  })

  const msig: TemplateModule<MsigFormData, MsigTemplate, MsigDocument> = {
    code: MSIG_CLUB_FORMAT,
    label: 'MSIG Specialty Marine NV',
    templateId: MSIG_TEMPLATE_ID,
    repo: () => msigRepo,
    createBlank: createBlankMsigData,
    buildDocument: buildMsigDocumentWithOverrides,
    validate: validateMsigData,
    Editor: MsigEditor,
    Preview: MsigPreview,
    renderPdf: (doc) => renderMsigPdfBlob(doc),
    fileName: (d) => `MSIG-Quotation-${(d.reference || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`,
    insurerName: (t) => t?.insurerName ?? '',
    savedLabel: (d) => `${d.reference || '(no reference)'} — ${d.assured || '(no assured)'}`,
  }
  const eagle: TemplateModule<EagleFormData, EagleTemplate, EagleDocument> = {
    code: EAGLE_CLUB_FORMAT,
    label: 'Eagle Ocean Marine',
    templateId: EAGLE_TEMPLATE_ID,
    repo: () => eagleRepo,
    createBlank: createBlankEagleData,
    buildDocument: buildEagleDocumentWithOverrides,
    validate: validateEagleData,
    Editor: EagleEditor,
    Preview: EaglePreview,
    renderPdf: (doc) => renderEaglePdfBlob(doc),
    fileName: (d) => `Eagle-Quotation-${(d.reference || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`,
    insurerName: (t) => t?.insurerName ?? '',
    savedLabel: (d) => `${d.reference || '(no reference)'} — ${d.applicant || '(no applicant)'}`,
  }
  return { msig, eagle }
}
