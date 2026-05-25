import type { ShipmentListItem, ShipmentDocument } from '@/types/shipment'

const now  = new Date()
const ago  = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const from = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

export const MOCK_SHIPMENT_LIST: ShipmentListItem[] = [
  {
    id: 'shp-001', docNumber: 'SHP-2025-0041', division: 'HM',
    paymentNumber: 'PAY-2025-0094', invoiceNumber: 'INV-2025-0137',
    insuredName: 'PT Arpeni Pratama Ocean Line', vesselName: 'MV Artha Kencana',
    status: 'COMPLETED', shipmentDate: ago(10), blNumber: 'BL-2025-041-APL',
    documentsReceived: true, documentsForwarded: true, createdAt: ago(12),
  },
  {
    id: 'shp-002', docNumber: 'SHP-2025-0040', division: 'HM',
    paymentNumber: 'PAY-2025-0092', invoiceNumber: 'INV-2025-0134',
    insuredName: 'PT Samudera Indonesia Tbk', vesselName: 'MV Samudera Biru',
    status: 'DOCUMENTS_RECEIVED', shipmentDate: ago(5), blNumber: 'BL-2025-040-SMD',
    documentsReceived: true, documentsForwarded: false, createdAt: ago(8),
  },
  {
    id: 'shp-003', docNumber: 'SHP-2025-0039', division: 'HM',
    paymentNumber: 'PAY-2025-0090', invoiceNumber: 'INV-2025-0130',
    insuredName: 'PT Berlian Laju Tanker Tbk', vesselName: 'MT Berlian Ekuator',
    status: 'COMPLETED', shipmentDate: ago(22), blNumber: 'BL-2025-039-BLT',
    documentsReceived: true, documentsForwarded: true, createdAt: ago(25),
  },
  {
    id: 'shp-004', docNumber: 'SHP-2025-0038', division: 'PI',
    paymentNumber: 'PAY-2025-0088', invoiceNumber: 'INV-2025-0128',
    insuredName: 'PT Karya Sumber Energi', vesselName: 'MT Karya Mandiri',
    status: 'IN_PROGRESS', shipmentDate: from(3),
    documentsReceived: false, documentsForwarded: false, createdAt: ago(3),
  },
  {
    id: 'shp-005', docNumber: 'SHP-2025-0037', division: 'PI',
    paymentNumber: 'PAY-2025-0086', invoiceNumber: 'INV-2025-0126',
    insuredName: 'PT Bahtera Adhiguna', vesselName: 'TB Adhiguna Pusaka',
    status: 'COMPLETED', shipmentDate: ago(30), blNumber: 'BL-2025-037-BAH',
    documentsReceived: true, documentsForwarded: true, createdAt: ago(33),
  },
  {
    id: 'shp-006', docNumber: 'SHP-2025-0036', division: 'HM',
    paymentNumber: 'PAY-2025-0085', invoiceNumber: 'INV-2025-0125',
    insuredName: 'PT Meratus Line', vesselName: 'MV Meratus Jayapura',
    status: 'DOCUMENTS_FORWARDED', shipmentDate: ago(8), blNumber: 'BL-2025-036-MRT',
    documentsReceived: true, documentsForwarded: true, createdAt: ago(10),
  },
  {
    id: 'shp-007', docNumber: 'SHP-2025-0035', division: 'PI',
    paymentNumber: 'PAY-2025-0084', invoiceNumber: 'INV-2025-0123',
    insuredName: 'CV Mitra Bahari Sentosa', vesselName: 'KM Mitra Sejahtera',
    status: 'DRAFT', createdAt: ago(1),
    documentsReceived: false, documentsForwarded: false,
  },
]

export const MOCK_SHIPMENT_DETAIL: ShipmentDocument = {
  id:         'shp-002',
  docNumber:  'SHP-2025-0040',
  division:   'HM',
  status:     'DOCUMENTS_RECEIVED',

  paymentId:     'pay-004',
  paymentNumber: 'PAY-2025-0092',
  voucherId:     'vch-004',
  voucherNumber: 'VCH-2025-0096',
  invoiceId:     'inv-005',
  invoiceNumber: 'INV-2025-0134',
  qsId:          'qs-006',
  qsNumber:      'QS-2025-0138',

  insuredName:  'PT Samudera Indonesia Tbk',
  vesselName:   'MV Samudera Biru',
  vesselFlag:   'Indonesia',

  shipmentDate:      ago(5),
  portOfLoading:     'Tanjung Priok, Jakarta',
  portOfDischarge:   'Port Klang, Malaysia',
  blNumber:          'BL-2025-040-SMD',
  voyageNumber:      'SMD-V025-2025',

  documentsReceived:      true,
  documentsReceivedDate:  ago(3),
  documentsReceivedBy:    'Siti Nurhaliza',
  documentsForwarded:     false,

  insuranceType: 'H&M',
  currency:      'USD',
  premiumAmount: 91200,

  internalNotes: 'Documents received from broker. Awaiting instruction from insured for forwarding address.',

  createdBy: 'Andi Pratama',
  createdAt: ago(8),
  updatedBy: 'Siti Nurhaliza',
  updatedAt: ago(3),

  activity: [
    {
      id: 'shp-002-a1', type: 'created',
      description: 'SHP-2025-0040 created from PAY-2025-0092',
      actor: 'Andi Pratama', timestamp: ago(8),
    },
    {
      id: 'shp-002-a2', type: 'documents_received',
      description: 'Policy documents received from broker',
      actor: 'Siti Nurhaliza', timestamp: ago(3),
      meta: { fromStatus: 'IN_PROGRESS', toStatus: 'DOCUMENTS_RECEIVED' },
    },
  ],
}

export const MOCK_SHIPMENT_PAGINATION = {
  page: 1, pageSize: 25, total: 87, totalPages: 4,
}
