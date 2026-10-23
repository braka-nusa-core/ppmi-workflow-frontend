// FILE: lib/quotation-templates/msig/template.ts
// ═══════════════════════════════════════════════════════════════
// MSIG SPECIALTY MARINE NV — P&I TEMPLATE CONTENT
//
// Every string below is copied from the supplied sample
// “Draft - Quotation PT. Karya Anugerah Inma” (reference 202604508,
// 17 Jun 2026), including its irregularities (mixed apostrophes,
// “Assureds”, “Version 1-2026” vs “1/2025”, the sentence split across
// two paragraphs in Warranties). Do NOT “correct” wording here without
// formal PPMI approval (Phase 2 decision 1).
//
// Not modelled because PPMI has not confirmed any rule:
//   • conditional inclusion of the Survey Warranty (M19/M20) — printed as in the sample
//   • selectable COVER RESTRICTED TO items (M16) — printed as in the sample
//   • any dropdown option list — none exists
// ═══════════════════════════════════════════════════════════════

import { MSIG_CLUB_FORMAT, type MsigTemplate } from './types'

export const MSIG_TEMPLATE_ID = 'msig-specialty-marine-pni'
export const MSIG_TEMPLATE_VERSION = 'mock-sample-202604508'

const SECURITY =
  'MSIG Europe, Koning Albert II-laan 37, 1030 Brussels, Belgium, represented by MSIG Specialty Marine NV. as authorized underwriting agent.'
const MAX_REMARK =
  'Any one accident or occurrence, combined single limit as detailed under the heading Security above.'

export const MSIG_TEMPLATE: MsigTemplate = {
  templateId: MSIG_TEMPLATE_ID,
  clubFormat: MSIG_CLUB_FORMAT,
  insurerName: 'MSIG Specialty Marine NV',
  templateVersion: MSIG_TEMPLATE_VERSION,
  sourceNote: 'Reproduced from the supplied sample quotation 202604508 (17 Jun 2026). Not yet confirmed by PPMI as the approved current paper.',
  companyName: 'PT.Pandi Proteksi Marine Indonesia',
  vesselFields: [
    { label: 'Name', key: 'name' },
    { label: 'Type', key: 'type' },
    { label: 'IMO Number', key: 'imoNumber' },
    { label: 'Class', key: 'class' },
    { label: 'GT/GRT', key: 'grossTonnage' },
    { label: 'Built', key: 'builtYear' },
    { label: 'Flag', key: 'flag' },
    { label: 'Port of Registry', key: 'portOfRegistry' },
  ],
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
    { heading: 'Mail', lines: [[{ text: 'www.pandiproteksi.com' }], [{ text: 'info@pandiproteksimarine.co.id' }]] },
  ],
  elements: [
    // ── Page 1 ────────────────────────────────────────────────
    { kind: 'title', id: 'M01', section: 'quotation', text: 'QUOTATION' },
    { kind: 'lead', id: 'M02', section: 'quotation', text: 'We are pleased to offer our quotation on the following terms and conditions.' },
    { kind: 'field', id: 'M03', gapBefore: 5.5, section: 'quotation', label: 'Our Reference', field: 'reference' },
    { kind: 'field', id: 'M04', gapBefore: 0, section: 'quotation', label: 'Assured(s)', field: 'assured' },
    { kind: 'vessels', id: 'M05', gapBefore: 0, section: 'quotation', label: 'Insured Vessel' },
    { kind: 'field', id: 'M06', gapBefore: 4.5, section: 'quotation', label: 'Period', field: 'period' },
    {
      kind: 'text', id: 'M07', gapBefore: 12.5, section: 'quotation', label: 'Trading Limits',
      paragraphs: [{ text: 'Warranted trading within Indonesian waters including Timor Leste only, always within International Navigating Conditions (01/11/2003) and limitations of the Classification Society of the vessel and/or applicable Statutory Regulations, whichever is the lesser.' }],
    },
    {
      kind: 'text', id: 'M08', gapBefore: 27.5, section: 'quotation', label: 'Premium Warranty',
      paragraphs: [
        { text: 'Warranted annual premium is payable in two (2) equal instalments. First instalment to be paid prior to inception. Second instalment to be paid within 180 days of inception.' },
        { text: 'Warranted full annual premium to be paid in case of an Actual Total Loss and/or Constructive Total Loss of Vessel.' },
        { text: 'The premium mentioned is due to the insurer. Any local taxes must be added to the amount and paid separately. They may not be deducted from the premium due to the insurer.' },
        { text: 'Breach of premium warranty may lead to rejection of all claims whether arising before or after the breach: Part 4, Section 33 of the applicable Marine Liability Policy for Shipowners.' },
      ],
    },
    // ── Page 2 ────────────────────────────────────────────────
    { kind: 'text', id: 'M10', gapBefore: 12.5, section: 'quotation', label: 'Class Warranty', paragraphs: [{ text: 'Warranted vessels holding valid Seaworthiness Certificate issued by a competent authority.' }] },
    { kind: 'text', id: 'M11', gapBefore: 22.5, section: 'quotation', label: 'Application Form Warranty', paragraphs: [{ text: 'Warranted fully completed and duly signed application form per vessel to be received prior to inception and issuance of Certificate of Insurance.' }] },
    { kind: 'text', id: 'M12', gapBefore: 15.5, section: 'quotation', label: 'Information required and to be approved by the Company prior to final confirmation of cover', paragraphs: [{ text: 'Completion of enclosed application form and customer information form.' }] },
    // ── P&I coverage block ────────────────────────────────────
    { kind: 'text', id: 'M13', gapBefore: 0, section: 'pni', label: 'Type Insurance', paragraphs: [{ text: 'Protection & Indemnity for Shipowners - Class 1' }] },
    { kind: 'text', id: 'M14', gapBefore: 2.5, section: 'pni', label: 'Security', labelAlign: 'middle', paragraphs: [{ text: SECURITY }] },
    {
      kind: 'text', id: 'M15', gapBefore: 25.5, section: 'pni', label: 'Conditions',
      paragraphs: [
        { text: 'As per Shipowners’ P&I Policy Wording Version 1-2026, attached.' },
        { text: 'Cancelling returns only.' },
        { text: 'No lay up returns.' },
        { text: 'COVER RESTRICTED TO:', bold: true },
        { text: '- Compulsory Wreck Removal - Part 1, Section 12' },
        { text: '- Pollution liability - Part 1, Section 15' },
        { text: '- Sue & Labour - Part 1, Section 18' },
        { text: 'Including War Risk P&I as per Part 3, of the applicable Marine Liability Policy for Shipowners, but excluding Iran and Breach Areas / Joint War Committee (JWC) Listed Areas. No (re)insurer shall be deemed to provide cover and no (re)insurer shall be liable to pay any claim or provide any benefit hereunder to the extent that the provision of such cover, payment of such claim or provision of such benefit would expose that (re)insurer to any sanction, prohibition or restriction under United Nations resolutions or the trade or economic sanctions, laws or regulations of the European Union, United Kingdom or United States of America.' },
      ],
    },
    // ── Page 3 ────────────────────────────────────────────────
    {
      kind: 'text', id: 'M18', gapBefore: 13.5, section: 'pni', label: 'Warranties',
      paragraphs: [
        { text: 'The Assureds warrant that the ownership of the assured vessel does not and will not have any ownership connection with the Democratic Peoples Republic of Korea, or any other sanction related entity or individual(s) for the duration of the insurance policy.' },
        { text: 'Warranted vessels to be insured for H&M including salvage.' },
        { text: 'The Assured’s attention is drawn to Section 55.2 (a)-(f) of the policy' },
        { text: 'which excludes Sections 8, 10, 11, 13, 13A and 14 of the Insurance Act 2015.' },
        { text: 'Warranted no rig tows and no double and/or multiple tows.' },
        { text: 'For vessels in excess of 15 years of age and over 800 Gross Ton the survey warranty reads as:' },
      ],
    },
    {
      kind: 'text', id: 'M20', gapBefore: 12.5, section: 'pni', label: 'Survey Warranty',
      paragraphs: [
        { text: 'Warranted wreck removal condition survey to be completed by a MSIG Specialty Marine NV approved surveyor, in accordance with our condition survey guidelines and all recommendations arising therefrom must be complied with. In the meantime the Insurer reserves the right to reject in whole or in part any claim for reimbursement where, in the opinion of a Surveyor, any defect which would have been discovered had the condition survey already taken place, caused or contributed to the loss in respect of which the claim is made.' },
        { text: 'Furthermore, if upon receipt of the Surveyor’s comments or report, the Insurer is of the opinion that the vessel is not in a fit or proper condition, the insurer reserves the right to terminate the cover from inception.' },
      ],
    },
    { kind: 'amount', id: 'M21', gapBefore: 8.5, section: 'pni', label: 'Maximum amount insured', currency: 'USD', coverage: 'pni', field: 'maximumAmount', remark: MAX_REMARK },
    { kind: 'amount', id: 'M22', gapBefore: 3.5, section: 'pni', label: 'Deductible(s)', currency: 'USD', coverage: 'pni', field: 'deductibleAmount', remark: 'In respect of all claims, any one accident or occurrence.' },
    { kind: 'amount', id: 'M23', gapBefore: 3.5, section: 'pni', label: 'Premium', currency: 'USD', coverage: 'pni', field: 'premiumAmount', remark: 'per vessel, per annum or pro rata.' },
    // ── War P&I coverage block ────────────────────────────────
    { kind: 'text', id: 'M24', gapBefore: 5.5, section: 'war', label: 'Type Insurance', paragraphs: [{ text: 'War Protection and Indemnity Cover' }] },
    { kind: 'text', id: 'M25', gapBefore: 4.5, section: 'war', label: 'Security', labelAlign: 'middle', paragraphs: [{ text: SECURITY }] },
    { kind: 'text', id: 'M26', gapBefore: 8.5, section: 'war', label: 'Trading Area', paragraphs: [{ text: 'Warranted trading as per Protection and Indemnity Certificate of Insurance and/or Protection and Indemnity quotation.' }] },
    {
      kind: 'text', id: 'M27', gapBefore: 13.5, section: 'war', label: 'Conditions',
      paragraphs: [
        { text: 'As per Shipowners’ P&I Policy Wording Version 1/2025.' },
        { text: "Including War Risk P&I as per Part 3, of the applicable Shipowners' P&I wording, but excluding Iran and Breach Areas / Joint War Committee (JWC) Listed Areas." },
      ],
    },
    { kind: 'text', id: 'M29', gapBefore: 10.5, section: 'war', label: 'Premium Warranty', paragraphs: [{ text: 'Warranted full annual premium is payable As per Protection and Indemnity Certificate of insurance and/or Protection and Indemnity quotation.' }] },
    { kind: 'amount', id: 'M30', gapBefore: 46.5, section: 'war', label: 'Maximum amount insured', currency: 'USD', coverage: 'war', field: 'maximumAmount', remark: MAX_REMARK },
    { kind: 'amount', id: 'M31', gapBefore: 4.5, section: 'war', label: 'Deductible(s)', currency: 'USD', coverage: 'war', field: 'deductibleAmount', remark: 'As per Protection and Indemnity Certificate of Insurance.' },
    { kind: 'amount', id: 'M32', gapBefore: 3.5, section: 'war', label: 'Premium', currency: 'USD', coverage: 'war', field: 'premiumAmount', remark: 'in full for the cover, excluding applicable insurance taxes, if any.' },
    // ── Page 4 closing ────────────────────────────────────────
    {
      kind: 'text', id: 'M33', gapBefore: 9.5, fullWidth: true, section: 'closing',
      paragraphs: [{ text: 'This quotation is valid 30 days as from below mentioned date.\nThis is not a confirmation of cover. The insurance can only be underwritten if all required information by the Company, is provided to and accepted by the Company. Any alteration to the above information must be reported to PT.Pandi Proteksi Marine Indonesia immediately with full details of the alterations. We trust that everything is in order and look forward to receiving your further instructions.' }],
    },
    { kind: 'signature', id: 'M35', gapBefore: 57.5, section: 'closing', eoe: 'E. & O.E.', acceptLabel: 'Agreed and Accepted by', signatoryLabel: 'Authorised Signatory' },
  ],
}