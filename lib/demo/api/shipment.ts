// FILE: lib/demo/api/shipment.ts
// DEMO FACADE for lib/api/shipment.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/shipment'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/shipment'

export const fetchShipmentList: typeof real.fetchShipmentList = async (filters = {}) =>
  demoList(getDemoDataset().shipmentList, filters, {
    searchFields: ['docNumber', 'invoiceNumber', 'courier', 'trackingNumber'],
    filters:      { invoiceId: 'invoiceId', paymentId: 'paymentId' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchShipmentList>>

export const fetchShipmentDetail: typeof real.fetchShipmentDetail = async (id) =>
  demoFind(getDemoDataset().shipments, id, 'Shipment')