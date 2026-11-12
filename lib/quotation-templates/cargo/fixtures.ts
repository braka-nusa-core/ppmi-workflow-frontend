// FILE: lib/quotation-templates/cargo/fixtures.ts
// Blank Cargo quotation template — initial form state.

import type { CargoFormData } from './types'

export function createBlankCargoData(): CargoFormData {
  return {
    quotationNumber: '',
    quotationDate: new Date(),
    recipient: '',
    attentionTo: '',
    insured: '',
    insuredAddress: '',
    sumInsured: undefined,
    sumInsuredCurrency: 'USD',
    rate: undefined,
    deductible: undefined,
    deductibleText: '',
    deductibleBasis: 'Each and every loss',
    brokerage: undefined,
    interestInsured: '',
    voyageFrom: '',
    voyageTo: '',
    etd: undefined,
    eta: undefined,
    conveyance: '',
    instituteCargoClause: undefined,
    confirmedAcceptedBy: '',
    selectedTerms: [],
    additionalClauses: [],
  }
}
