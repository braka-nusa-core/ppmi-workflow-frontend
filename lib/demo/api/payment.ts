// FILE: lib/demo/api/payment.ts
// DEMO FACADE for lib/api/payment.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/payment'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/payment'

export const fetchPaymentList: typeof real.fetchPaymentList = async (filters = {}) =>
  demoList(getDemoDataset().paymentList, filters, {
    searchFields: ['docNumber', 'invoiceNumber', 'voucherNumber', 'insuredName'],
    filters:      { paymentStatus: 'paymentStatus', verificationStatus: 'verificationStatus', division: 'division' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchPaymentList>>

export const fetchPaymentDetail: typeof real.fetchPaymentDetail = async (id) =>
  demoFind(getDemoDataset().payments, id, 'Payment')