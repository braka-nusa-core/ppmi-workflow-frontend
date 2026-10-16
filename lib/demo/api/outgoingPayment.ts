// FILE: lib/demo/api/outgoingPayment.ts
// DEMO FACADE for lib/api/outgoingPayment.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/outgoingPayment'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/outgoingPayment'

export const fetchOutgoingPaymentList: typeof real.fetchOutgoingPaymentList = async (filters = {}) =>
  demoList(getDemoDataset().outgoing, filters, {
    searchFields: ['docNumber', 'invoiceNumber', 'insuredName', 'insuranceCompanyName'],
    filters:      { status: 'status', insuranceCompanyId: 'insuranceCompanyId' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchOutgoingPaymentList>>

export const fetchOutgoingPaymentDetail: typeof real.fetchOutgoingPaymentDetail = async (id) =>
  demoFind(getDemoDataset().outgoing, id, 'Outgoing payment')