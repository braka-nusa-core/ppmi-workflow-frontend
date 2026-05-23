import type { QSListItem, QSDocument, QSActivity } from '@/types/qs'

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

// ─── Activity trails ─────────────────────────────────────────────
const makeActivity = (docNumber: string, status: string): QSActivity[] => [
  {
    id: `${docNumber}-act-1`,
    type: 'created',
    description: `${docNumber} created and saved as draft`,
    actor: 'Andi Pratama',
    timestamp: daysAgo(14),
  },
  {
    id: `${docNumber}-act-2`,
    type: 'updated',
    description: 'Vessel information updated — GRT and IMO number added',
    actor: 'Andi Pratama',
    timestamp: daysAgo(13),
  },
  {
    id: `${docNumber}-act-3`,
    type: 'submitted',
    description: 'Submitted for approval',
    actor: 'Andi Pratama',
    timestamp: daysAgo(12),
    meta: { fromStatus: 'DRAFT', toStatus: 'PENDING' },
  },
  ...(status === 'APPROVED' || status === 'COMPLETED' ? [{
    id: `${docNumber}-act-4`,
    type: 'approved' as const,
    description: 'Approved by finance team',
    actor: 'Budi Santoso',
    timestamp: daysAgo(10),
    meta: { fromStatus: 'PENDING' as const, toStatus: 'APPROVED' as const },
  }] : []),
  ...(status === 'REVISION' ? [{
    id: `${docNumber}-act-4`,
    type: 'revision_requested' as const,
    description: 'Revision requested — premium amount needs adjustment',
    actor: 'Budi Santoso',
    timestamp: daysAgo(10),
    meta: { fromStatus: 'PENDING' as const, toStatus: 'REVISION' as const },
  }] : []),
]

// ─── List items (table rows) ─────────────────────────────────────
export const MOCK_QS_LIST: QSListItem[] = [
  {
    id: 'qs-001', docNumber: 'QS-2025-0143', type: 'NEW', division: 'HM',
    insuredName: 'PT Soechi Lines Tbk', vesselName: 'MV Soechi Cilacap',
    insuranceType: 'H&M', currency: 'USD', premiumAmount: 48500,
    status: 'PENDING', createdAt: daysAgo(2), updatedAt: daysAgo(1),
    hasInvoice: false,
  },
  {
    id: 'qs-002', docNumber: 'QS-2025-0142', type: 'RENEW', division: 'PI',
    insuredName: 'PT Arpeni Pratama Ocean Line', vesselName: 'MV Artha Kencana',
    insuranceType: 'P&I', currency: 'USD', premiumAmount: 72000,
    status: 'APPROVED', createdAt: daysAgo(5), updatedAt: daysAgo(3),
    hasInvoice: true, invoiceNumber: 'INV-2025-0138',
  },
  {
    id: 'qs-003', docNumber: 'QS-2025-0141', type: 'NEW', division: 'PI',
    insuredName: 'PT Pelayaran Nasional Indonesia', vesselName: 'KM Nusantara Abadi',
    insuranceType: 'P&I', currency: 'IDR', premiumAmount: 185000000,
    status: 'DRAFT', createdAt: daysAgo(6), updatedAt: daysAgo(6),
    hasInvoice: false,
  },
  {
    id: 'qs-004', docNumber: 'QS-2025-0140', type: 'RENEW', division: 'HM',
    insuredName: 'PT Meratus Line', vesselName: 'MV Meratus Jayapura',
    insuranceType: 'H&M', currency: 'USD', premiumAmount: 34800,
    status: 'APPROVED', createdAt: daysAgo(8), updatedAt: daysAgo(6),
    hasInvoice: true, invoiceNumber: 'INV-2025-0135',
  },
  {
    id: 'qs-005', docNumber: 'QS-2025-0139', type: 'NEW', division: 'PI',
    insuredName: 'CV Mitra Bahari Sentosa', vesselName: 'KM Mitra Sejahtera',
    insuranceType: 'FD&D', currency: 'IDR', premiumAmount: 95000000,
    status: 'REVISION', createdAt: daysAgo(10), updatedAt: daysAgo(7),
    hasInvoice: false,
  },
  {
    id: 'qs-006', docNumber: 'QS-2025-0138', type: 'RENEW', division: 'HM',
    insuredName: 'PT Samudera Indonesia Tbk', vesselName: 'MV Samudera Biru',
    insuranceType: 'H&M', currency: 'USD', premiumAmount: 91200,
    status: 'COMPLETED', createdAt: daysAgo(15), updatedAt: daysAgo(9),
    hasInvoice: true, invoiceNumber: 'INV-2025-0131',
  },
  {
    id: 'qs-007', docNumber: 'QS-2025-0137', type: 'NEW', division: 'PI',
    insuredName: 'PT Tanjung Priok Shipping', vesselName: 'KM Priok Jaya',
    insuranceType: 'P&I', currency: 'IDR', premiumAmount: 210000000,
    status: 'COMPLETED', createdAt: daysAgo(18), updatedAt: daysAgo(12),
    hasInvoice: true, invoiceNumber: 'INV-2025-0128',
  },
  {
    id: 'qs-008', docNumber: 'QS-2025-0136', type: 'NEW', division: 'HM',
    insuredName: 'PT Djakarta Lloyd', vesselName: 'MV Lloyd Nusantara',
    insuranceType: 'War Risk', currency: 'USD', premiumAmount: 28500,
    status: 'PENDING', createdAt: daysAgo(9), updatedAt: daysAgo(8),
    hasInvoice: false,
  },
  {
    id: 'qs-009', docNumber: 'QS-2025-0135', type: 'RENEW', division: 'PI',
    insuredName: 'PT Bahtera Adhiguna', vesselName: 'TB Adhiguna Pusaka',
    insuranceType: 'P&I', currency: 'IDR', premiumAmount: 145000000,
    status: 'APPROVED', createdAt: daysAgo(12), updatedAt: daysAgo(10),
    hasInvoice: false,
  },
  {
    id: 'qs-010', docNumber: 'QS-2025-0134', type: 'NEW', division: 'HM',
    insuredName: 'PT Berlian Laju Tanker Tbk', vesselName: 'MT Berlian Ekuator',
    insuranceType: 'H&M', currency: 'USD', premiumAmount: 155000,
    status: 'COMPLETED', createdAt: daysAgo(22), updatedAt: daysAgo(15),
    hasInvoice: true, invoiceNumber: 'INV-2025-0124',
  },
  {
    id: 'qs-011', docNumber: 'QS-2025-0133', type: 'RENEW', division: 'PI',
    insuredName: 'PT Sinar Mas Shipping', vesselName: 'MV Sinar Nusantara',
    insuranceType: 'P&I', currency: 'USD', premiumAmount: 63400,
    status: 'DRAFT', createdAt: daysAgo(3), updatedAt: daysAgo(3),
    hasInvoice: false,
  },
  {
    id: 'qs-012', docNumber: 'QS-2025-0132', type: 'NEW', division: 'HM',
    insuredName: 'PT Karya Sumber Energi', vesselName: 'MT Karya Mandiri',
    insuranceType: 'H&M', currency: 'IDR', premiumAmount: 320000000,
    status: 'APPROVED', createdAt: daysAgo(20), updatedAt: daysAgo(16),
    hasInvoice: true, invoiceNumber: 'INV-2025-0121',
  },
]

// ─── Full detail document ────────────────────────────────────────
export const MOCK_QS_DETAIL: QSDocument = {
  id:           'qs-002',
  docNumber:    'QS-2025-0142',
  division:     'PI',
  status:       'APPROVED',
  type:         'RENEW',

  effectiveDate: daysFromNow(30),
  expiryDate:    daysFromNow(395),
  broker:        'Marsh Indonesia',

  insuredName:    'PT Arpeni Pratama Ocean Line',
  insuredAddress: 'Jl. Tanah Abang III No. 10, Jakarta Pusat 10160',
  insuredContact: '+62 21 3865 1234',

  vesselName:     'MV Artha Kencana',
  vesselFlag:     'Indonesia',
  vesselType:     'General Cargo',
  vesselGRT:      12480,
  vesselBuiltYear:2018,
  imoNumber:      'IMO 9812345',

  insuranceType:   'P&I',
  coverageDetail:  'Full P&I Cover — 20/20ths entry, including: personal injury crew, cargo liability, collision liability, pollution liability.',
  deductible:      50000,

  currency:       'USD',
  premiumAmount:  72000,
  exchangeRate:   15850,
  premiumIDR:     1141200000,

  internalNotes:  'Renewal from previous policy QS-2024-0098. Client requested same terms and conditions. Broker confirmed coverage scope unchanged.',

  invoiceId:     'inv-138',
  invoiceNumber: 'INV-2025-0138',

  createdBy:  'Andi Pratama',
  createdAt:  daysAgo(14),
  updatedBy:  'Budi Santoso',
  updatedAt:  daysAgo(3),

  attachments: [
    {
      id: 'att-001',
      filename: 'Certificate_of_Registry_MV_Artha_Kencana.pdf',
      filesize: 842000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: daysAgo(14),
    },
    {
      id: 'att-002',
      filename: 'Classification_Certificate_BKI_2024.pdf',
      filesize: 1240000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: daysAgo(13),
    },
    {
      id: 'att-003',
      filename: 'Previous_Policy_QS2024-0098.pdf',
      filesize: 560000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: daysAgo(12),
    },
  ],

  activity: makeActivity('QS-2025-0142', 'APPROVED'),
}

// ─── Pagination meta ─────────────────────────────────────────────
export const MOCK_QS_PAGINATION = {
  page:       1,
  pageSize:   25,
  total:      142,
  totalPages: 6,
}
