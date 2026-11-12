// FILE: lib/quotation-templates/cargo/exportPdf.ts
// Cargo PDF export — stub until Phase 2B implements react-pdf rendering.

import type { CargoDocument } from './types'

/**
 * Export Cargo document to PDF blob.
 * STUB: Returns empty PDF until Phase 2B implements react-pdf rendering.
 * Real implementation uses @react-pdf/renderer with CargoPdfDocument component.
 */
export async function renderCargoPdfBlob(_document: CargoDocument): Promise<Blob> {
  // ponytail: Phase 2B implements CargoPdfDocument with react-pdf rendering
  // Will render 3-page PDF matching official Cargo paper structure
  return new Blob(['PDF export not implemented'], { type: 'application/pdf' })
}
