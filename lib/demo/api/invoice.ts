// FILE: lib/demo/api/invoice.ts
// DEMO FACADE for lib/api/invoice.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/invoice'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/invoice'

export const fetchInvoiceList: typeof real.fetchInvoiceList = async (filters = {}) =>
  demoList(getDemoDataset().invoiceList, filters, {
    searchFields: ['docNumber', 'voucherInvoiceNumber', 'insuredName', 'vesselName'],
    filters:      { status: 'status', paymentStatus: 'paymentStatus', division: 'division' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchInvoiceList>>

export const fetchInvoiceDetail: typeof real.fetchInvoiceDetail = async (id) =>
  demoFind(getDemoDataset().invoices, id, 'Invoice')