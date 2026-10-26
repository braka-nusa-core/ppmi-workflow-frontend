// FILE: lib/quotation-templates/eagle/fixtures.ts
// MOCK DATA ONLY — values from the supplied Eagle sample (quotation 2025/18599).
// They are NOT template defaults: opening a quotation never merges them in.

import type { EagleFormData, EagleRole, EagleVessel } from './types'

let seq = 0
export const newEagleId = (prefix = 'e') => `${prefix}-${Date.now().toString(36)}-${++seq}`

export const createBlankRole = (): EagleRole => ({ id: newEagleId('r'), organisation: '', role: '' })

export function createBlankEagleVessel(): EagleVessel {
  return {
    id: newEagleId('v'), vesselId: '', name: '', imoNumber: '', grossTonnage: '', builtYear: '', vesselType: '',
    flag: '', vesselClass: '', annualPremium: '', limit: '', roles: [],
  }
}

/** A new quotation starts empty; only fixed wording comes from the template. */
export function createBlankEagleData(): EagleFormData {
  return {
    reference: '', applicant: '', address: '', vesselHeading: '', period: '', limitAmount: '', issueDate: '',
    amounts: { crewLimit: '', wdcdSubLimit: '', crewClaims: '', cargoClaims: '', collisionClaims: '', ffoClaims: '', otherClaims: '', totalLoss: '' },
    premiumTotal: '', vessels: [createBlankEagleVessel()],
  }
}

export const EAGLE_SAMPLE_ID = 'mock-eagle-sample-2025-18599'

export function createEagleSampleData(): EagleFormData {
  return {
    reference: '2025/18599',
    applicant: 'PT. BHINA CITRA SUPLARINDO',
    address: '',
    vesselHeading: 'BRAVO SATU',
    period: 'To be advised',
    limitAmount: '10,000,000',
    issueDate: '2025-10-09',
    amounts: { crewLimit: '40,000', wdcdSubLimit: '2,000,000', crewClaims: '5,000', cargoClaims: '15,000', collisionClaims: '25,000', ffoClaims: '25,000', otherClaims: '10,000', totalLoss: '75,000' },
    premiumTotal: '18,500',
    vessels: [{
      id: 'sample-ev1', vesselId: '48085', name: 'BRAVO SATU', imoNumber: '-', grossTonnage: '176', builtYear: '2010',
      vesselType: 'Self-propelled dry barge', flag: 'Indonesia', vesselClass: 'Biro Klasifikasi Indonesia',
      annualPremium: '18,500', limit: '10,000,000',
      roles: [
        { id: 'sample-r1', organisation: 'PT. BHINA CITRA SUPLARINDO', role: 'Manager' },
        { id: 'sample-r2', organisation: 'PT. BHINA CITRA SUPLARINDO', role: 'Registered Owner' },
      ],
    }],
  }
}