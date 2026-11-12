// FILE: lib/quotation-templates/cargo/buildDocument.ts
// Transform CargoFormData + CargoTemplate into CargoDocument (3-page structure).

import type { CargoFormData, CargoTemplate, CargoDocument } from './types'

/**
 * Build rendered document from form data and template.
 * Splits 18 fields across 3 pages (matching official paper).
 * Page 1: Header + Insurance Details
 * Page 2: Terms & Conditions
 * Page 3: Signature areas
 */
export function buildCargoDocument(template: CargoTemplate, data: CargoFormData): CargoDocument {
  return {
    pages: [
      {
        type: 'page1',
        content: {
          quotationNumber: data.quotationNumber,
          quotationDate: data.quotationDate ? new Date(data.quotationDate).toISOString().split('T')[0] : undefined,
          recipient: data.recipient,
          attentionTo: data.attentionTo,
          insured: data.insured,
          insuredAddress: data.insuredAddress,
          interestInsured: data.interestInsured,
          voyageFrom: data.voyageFrom,
          voyageTo: data.voyageTo,
          etd: data.etd ? new Date(data.etd).toISOString().split('T')[0] : undefined,
          eta: data.eta ? new Date(data.eta).toISOString().split('T')[0] : undefined,
          conveyance: data.conveyance,
          sumInsured: data.sumInsured,
          sumInsuredCurrency: data.sumInsuredCurrency,
          rate: data.rate,
          deductible: data.deductible,
          deductibleText: data.deductibleText,
          brokerage: data.brokerage,
        },
      },
      {
        type: 'page2',
        content: {
          mainClause: data.instituteCargoClause,
          additionalClauses: (data.additionalClauses || []).map((c: any) => ({
            id: c.id,
            code: c.code,
            label: c.label,
            section: c.section,
          })),
        },
      },
      {
        type: 'page3',
        content: {
          confirmedAcceptedBy: data.confirmedAcceptedBy,
          signedFor: 'PT Pandi Proteksi Marine Indonesia',
        },
      },
    ],
    template,
    formData: data,
  }
}
