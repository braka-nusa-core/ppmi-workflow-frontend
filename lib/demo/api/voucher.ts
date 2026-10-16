// FILE: lib/demo/api/voucher.ts
// DEMO FACADE for lib/api/voucher.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/voucher'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/voucher'

export const fetchVoucherList: typeof real.fetchVoucherList = async (params) =>
  demoList(getDemoDataset().voucherList, params, {
    searchFields: ['docNumber', 'rfiNumber', 'insuredName', 'bankName'],
    filters:      { status: 'status', division: 'division', paymentType: 'paymentType' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchVoucherList>>

export const fetchVoucherDetail: typeof real.fetchVoucherDetail = async (id) => ({
  success: true,
  data:    demoFind(getDemoDataset().vouchers, id, 'Voucher'),
})