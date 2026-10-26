// FILE: lib/quotation-templates/eagle/template.ts
// ═══════════════════════════════════════════════════════════════
// EAGLE OCEAN MARINE — P&I TEMPLATE (structure + short fixed labels)
//
// Long wording lives in clauses.ts (generated verbatim from the sample).
// Labels below are copied from the supplied sample “Draft-Quote PT. BHINA
// CITRA SUPLARINDO” (quotation 2025/18599, 09-OCT-2025), including its
// irregularities (the footer “Mail” line, “Officer Address”).
//
// Not modelled because PPMI has not confirmed any rule:
//   • which clauses are always present or optional — all printed as in the sample
//   • dropdown options — none exist
//   • calculations — the premium total is typed, never summed
//   • the handwritten signature image — left as a blank signing space
// ═══════════════════════════════════════════════════════════════

import {
  EAGLE_BODY, EAGLE_DISCLAIMER, EAGLE_FAIR_PRESENTATION, EAGLE_FAIR_PRESENTATION_REPEAT,
  EAGLE_INSURER_PARAGRAPHS, EAGLE_INTRO_PARAGRAPHS,
} from './clauses'
import { EAGLE_CLUB_FORMAT, type EagleTemplate } from './types'

export const EAGLE_TEMPLATE_ID = 'eagle-ocean-marine-pni'
export const EAGLE_TEMPLATE_VERSION = 'mock-sample-2025-18599'

export const EAGLE_TEMPLATE: EagleTemplate = {
  templateId: EAGLE_TEMPLATE_ID,
  clubFormat: EAGLE_CLUB_FORMAT,
  insurerName: 'Eagle Ocean Marine',
  templateVersion: EAGLE_TEMPLATE_VERSION,
  sourceNote: 'Reproduced from the supplied sample quotation 2025/18599 (09-OCT-2025). Not yet confirmed by PPMI as the approved current paper.',
  title: 'QUOTATION FOR INSURANCE',
  quotationNoLabel: 'QUOTATION No.',
  headerRows: [
    { label: 'Applicant:', field: 'applicant' },
    { label: 'Address', field: 'address' },
    { label: 'Vessel:', field: 'vesselHeading', suffix: ' and/or as per schedule attached' },
    { label: 'Period of Insurance:', field: 'period' },
    { label: 'Interest', fixed: 'Protection and Indemnity' },
    { label: 'Limits:', field: 'limitAmount', prefix: 'USD ', amount: true, suffix: ' combined single limit any one event and/or as per schedule attached' },
  ],
  intro: EAGLE_INTRO_PARAGRAPHS,
  signature: { byLabel: 'by', signatoryLabel: 'Authorised Signatory' },
  insurerParagraphs: EAGLE_INSURER_PARAGRAPHS,
  fairPresentation: EAGLE_FAIR_PRESENTATION,
  body: EAGLE_BODY,
  fairRepeat: EAGLE_FAIR_PRESENTATION_REPEAT,
  information: {
    bar: 'INFORMATION',
    vesselColumns: [
      { label: 'Id', key: 'vesselId', width: 31.2, align: 'left' },
      { label: 'Vessel', key: 'name', width: 118.4, align: 'left' },
      { label: 'IMO No.', key: 'imoNumber', width: 38.9, align: 'left' },
      { label: 'GT', key: 'grossTonnage', width: 36.3, align: 'right' },
      { label: 'Built', key: 'builtYear', width: 24.7, align: 'left' },
      { label: 'Type', key: 'vesselType', width: 67.2, align: 'left' },
      { label: 'Flag', key: 'flag', width: 68.0, align: 'left' },
      { label: 'Class', key: 'vesselClass', width: 123.9, align: 'left' },
    ],
    caption: 'Protection and Indemnity',
    premiumColumns: [
      { label: 'Vessel', key: 'name', width: 127.5, align: 'left' },
      { label: 'GT', key: 'grossTonnage', width: 36.7, align: 'right' },
      { label: 'Annual Premium USD', key: 'annualPremium', width: 93.6, align: 'right' },
      { label: 'Limit USD', key: 'limit', width: 70.1, align: 'right' },
    ],
  },
  acceptance: { label: 'Agreed and Accepted by', signatoryLabel: '- Authorised Signatory' },
  disclaimer: EAGLE_DISCLAIMER,
  coassureds: { bar: 'COASSUREDS AND OTHERS', columns: ['Vessel', 'Cover', 'Organisation and Role'], cover: 'Protection and Indemnity', roleJoiner: ' as ' },
  footer: [
    { heading: 'Phone Number', lines: [[{ text: '021-7975163' }], [{ text: '021-7975109' }]] },
    {
      heading: 'Officer Address',
      lines: [
        [{ text: 'MULTIKA BUILDING 2' }, { text: 'nd', sup: true }, { text: '\u00A0Floor #206' }],
        [{ text: 'Jl. Mampang Prapatan Raya Kav. 71-73,' }],
        [{ text: 'Jakarta 12790 - Indonesia' }],
      ],
    },
    { heading: 'Mail', lines: [[{ text: 'info.pandiproteksi.com' }], [{ text: 'www.pandiproteksimarine.co.id' }]] },
  ],
  amountSlots: [
    { slot: 'crewLimit', label: 'CREW LIMIT — US$ (each person, each accident or occurrence)' },
    { slot: 'wdcdSubLimit', label: 'WDCD SUB-LIMIT — US$ (per vessel per event and in the aggregate)' },
    { slot: 'crewClaims', label: 'DEDUCTIBLES — crew claims, USD' },
    { slot: 'cargoClaims', label: 'DEDUCTIBLES — cargo claims, USD' },
    { slot: 'collisionClaims', label: 'DEDUCTIBLES — collision claims (RDC), USD' },
    { slot: 'ffoClaims', label: 'DEDUCTIBLES — fixed & floating objects (F&FO), USD' },
    { slot: 'otherClaims', label: 'DEDUCTIBLES — other claims, USD' },
    { slot: 'totalLoss', label: 'DEDUCTIBLES — total loss further deduction, US$' },
  ],
}