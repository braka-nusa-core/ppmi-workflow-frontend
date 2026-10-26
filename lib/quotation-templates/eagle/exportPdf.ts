// FILE: lib/quotation-templates/eagle/exportPdf.ts
// Browser-side Eagle PDF generation; @react-pdf/renderer is loaded lazily.

import { DEFAULT_PDF_ASSET_BASE } from '../shared/pdf'
import type { EagleDocument } from './types'

export async function renderEaglePdfBlob(document: EagleDocument, assetBase: string = DEFAULT_PDF_ASSET_BASE): Promise<Blob> {
  const [{ pdf }, { createEaglePdfElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/quotation-templates/eagle/EaglePdfDocument'),
  ])
  return pdf(createEaglePdfElement(document, assetBase)).toBlob()
}