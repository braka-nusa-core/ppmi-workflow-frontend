// FILE: components/quotation-templates/pniTemplates.ts
// Registry for the integrated flow: which insurer paper renders a saved P&I
// quotation, chosen by the quotation's own club code (`pni.club.code`).
// Deliberately independent of the prototype modules (msigModule / eagleModule),
// which carry the local-storage repository — nothing here reads or writes
// browser storage. Adding an insurer = one more entry; no other club is
// registered (no HYDOR / Inigo paper exists yet).
import type { ComponentType } from 'react'
import { renderEaglePdfBlob } from '@/lib/quotation-templates/eagle/exportPdf'
import { eagleFileName, mapPniToEagle } from '@/lib/quotation-templates/eagle/fromPni'
import { EAGLE_CLUB_FORMAT, type EagleDocument } from '@/lib/quotation-templates/eagle/types'
import { renderMsigPdfBlob } from '@/lib/quotation-templates/msig/exportPdf'
import { mapPniToMsig, msigFileName } from '@/lib/quotation-templates/msig/fromPni'
import { MSIG_CLUB_FORMAT, type MsigDocument } from '@/lib/quotation-templates/msig/types'
import type { PniTemplateRender } from '@/lib/quotation-templates/shared/fromPni'
import type { PniQuotationDetail } from '@/types/pni'
import { EaglePreview } from './eagle/EaglePreview'
import { MsigPreview } from './msig/MsigPreview'

export interface PniTemplateAdapter {
  code:     string
  label:    string
  render:   (d: PniQuotationDetail) => PniTemplateRender<unknown>
  Preview:  ComponentType<{ document: unknown }>
  renderPdf: (document: unknown) => Promise<Blob>
  fileName: (d: PniQuotationDetail) => string
}

/** Keeps each insurer's document type checked at its own boundary; the registry itself is document-agnostic. */
function adapter<TDoc>(a: {
  code: string; label: string
  render: (d: PniQuotationDetail) => PniTemplateRender<TDoc>
  Preview: ComponentType<{ document: TDoc }>
  renderPdf: (document: TDoc) => Promise<Blob>
  fileName: (d: PniQuotationDetail) => string
}): PniTemplateAdapter {
  return a as unknown as PniTemplateAdapter
}

export const PNI_TEMPLATE_ADAPTERS: PniTemplateAdapter[] = [
  adapter<MsigDocument>({
    code: MSIG_CLUB_FORMAT, label: 'MSIG Specialty Marine NV',
    render: mapPniToMsig, Preview: MsigPreview, renderPdf: (doc) => renderMsigPdfBlob(doc), fileName: msigFileName,
  }),
  adapter<EagleDocument>({
    code: EAGLE_CLUB_FORMAT, label: 'Eagle Ocean Marine',
    render: mapPniToEagle, Preview: EaglePreview, renderPdf: (doc) => renderEaglePdfBlob(doc), fileName: eagleFileName,
  }),
]

export const getPniTemplateAdapter = (clubCode: string | undefined): PniTemplateAdapter | undefined =>
  PNI_TEMPLATE_ADAPTERS.find((a) => a.code === clubCode)
