// FILE: lib/quotation-templates/msig/exportPdf.ts
// Browser-side PDF generation. @react-pdf/renderer is loaded lazily so it
// never enters the main bundle or runs during server rendering.

import { DEFAULT_PDF_ASSET_BASE } from '../shared/pdf'
import type { MsigDocument } from './types'

export async function renderMsigPdfBlob(document: MsigDocument, assetBase: string = DEFAULT_PDF_ASSET_BASE): Promise<Blob> {
  const [{ pdf }, { createMsigPdfElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/quotation-templates/msig/MsigPdfDocument'),
  ])
  return pdf(createMsigPdfElement(document, assetBase)).toBlob()
}