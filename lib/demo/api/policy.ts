// FILE: lib/demo/api/policy.ts
// ═══════════════════════════════════════════════════════════════
// DEMO FACADE for lib/api/policy.ts — active ONLY when the app is built
// with NEXT_PUBLIC_DEMO_MODE=true (next.config.mjs aliases the import
// '@/lib/api/policy' to this file). The READ functions below serve the
// local demo registry; everything else is re-exported from the real
// module untouched. Mutations stay real functions, but are hidden in the
// UI and rejected by the Phase B request guard.
// ═══════════════════════════════════════════════════════════════
import * as real from '../../api/policy'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/policy'

export const fetchPolicyList: typeof real.fetchPolicyList = async (filters = {}) =>
  demoList(getDemoDataset().policies, filters, {
    searchFields: ['policyNumber', 'quotationNumber', 'insured'],
    filters:      { status: 'status' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchPolicyList>>

export const fetchPolicyDetail: typeof real.fetchPolicyDetail = async (id) =>
  demoFind(getDemoDataset().policies, id, 'Policy')

export const fetchPolicyHistory: typeof real.fetchPolicyHistory = async (id) =>
  getDemoDataset().policyHistory[id] ?? []