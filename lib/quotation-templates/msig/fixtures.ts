// FILE: lib/quotation-templates/msig/fixtures.ts
// MOCK DATA ONLY. The sample values come from the supplied MSIG sample
// quotation (202604508). They exist to demonstrate the workflow and are
// NOT template defaults: opening a quotation never merges these into it.

import type { MsigFormData, MsigVessel } from './types'

let seq = 0
export function newMsigId(prefix = 'v'): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

export function createBlankVessel(): MsigVessel {
  return {
    id: newMsigId(), name: '', type: '', imoNumber: '', vesselClass: '', classNotApplicable: false,
    grossTonnage: '', builtYear: '', flag: '', portOfRegistry: '',
  }
}

/** A new quotation starts empty; only fixed wording comes from the template. */
export function createBlankMsigData(): MsigFormData {
  const empty = { maximumAmount: '', deductibleAmount: '', premiumAmount: '' }
  return {
    reference: '', assured: '', vessels: [createBlankVessel()], period: '',
    pni: { ...empty }, war: { ...empty }, issueDate: '',
  }
}

export const MSIG_SAMPLE_ID = 'mock-msig-sample-202604508'

export function createMsigSampleData(): MsigFormData {
  return {
    reference: '202604508',
    assured: 'PT. Karya Anugerah Inma',
    vessels: [
      { id: 'sample-v1', name: 'Setia Makmur II', type: 'Tug', imoNumber: '9049956', vesselClass: 'Biro Klasifikasi Indonesia', classNotApplicable: false, grossTonnage: '135', builtYear: '2004', flag: 'INDONESIA', portOfRegistry: 'SAMARINDA' },
      { id: 'sample-v2', name: 'Yuheti Jaya I', type: 'Tug', imoNumber: '8898037', vesselClass: '', classNotApplicable: true, grossTonnage: '197', builtYear: '1995', flag: 'INDONESIA', portOfRegistry: 'SAMARINDA' },
    ],
    period: '12 months as from date to be advised.',
    pni: { maximumAmount: '10,000,000.00', deductibleAmount: '12,500.00', premiumAmount: '2,500.00' },
    war: { maximumAmount: '10,000,000.00', deductibleAmount: '0.00', premiumAmount: '0.00' },
    issueDate: '2026-06-17',
  }
}