import type { InvoiceListItem, InvoiceDocument, InvoiceActivity } from '@/types/invoice'

const now      = new Date()
const daysAgo  = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const daysFrom = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

// ─── Activity trails ─────────────────────────────────────────────
const baseActivity = (docNumber: string): InvoiceActivity[] => [
  {
    id: `${docNumber}-a1`,
    type: 'created',
    description: `${docNumber} created from approved QS`,
    actor: 'Andi Pratama',
    timestamp: daysAgo(10),
  },
  {
    id: `${docNumber}-a2`,
    type: 'issued',
    description: 'Invoice issued — status changed to Issued',
    actor: 'Budi Santoso',
    timestamp: daysAgo(8),
    meta: { fromStatus: 'DRAFT', toStatus: 'ISSUED' },
  },
  {
    id: `${docNumber}-a3`,
    type: 'sent',
    description: 'Invoice sent to insured via email',
    actor: 'Budi Santoso',
    timestamp: daysAgo(7),
    meta: { fromStatus: 'ISSUED', toStatus: 'SENT' },
  },
]

// ─── List items ──────────────────────────────────────────────────
export const MOCK_INVOICE_LIST: InvoiceListItem[] = [
  {
    id: 'inv-001', docNumber: 'INV-2025-0138', division: 'HM',
    qsNumber: 'QS-2025-0143',
    insuredName: 'PT Soechi Lines Tbk', vesselName: 'MV Soechi Cilacap',
    currency: 'USD', totalAmount: 48500, paidAmount: 0, remainingAmount: 48500,
    dueDate: daysFrom(12), status: 'SENT', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(10),
  },
  {
    id: 'inv-002', docNumber: 'INV-2025-0137', division: 'PI',
    qsNumber: 'QS-2025-0142',
    insuredName: 'PT Arpeni Pratama Ocean Line', vesselName: 'MV Artha Kencana',
    currency: 'USD', totalAmount: 72000, paidAmount: 72000, remainingAmount: 0,
    dueDate: daysAgo(5), status: 'PAID', paymentStatus: 'PAID',
    hasVoucher: true, voucherNumber: 'VCH-2025-0089', createdAt: daysAgo(18),
  },
  {
    id: 'inv-003', docNumber: 'INV-2025-0136', division: 'HM',
    qsNumber: 'QS-2025-0140',
    insuredName: 'PT Meratus Line', vesselName: 'MV Meratus Jayapura',
    currency: 'USD', totalAmount: 34800, paidAmount: 0, remainingAmount: 34800,
    dueDate: daysAgo(6), status: 'OVERDUE', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(22),
  },
  {
    id: 'inv-004', docNumber: 'INV-2025-0135', division: 'PI',
    qsNumber: 'QS-2025-0139',
    insuredName: 'CV Mitra Bahari Sentosa', vesselName: 'KM Mitra Sejahtera',
    currency: 'IDR', totalAmount: 95000000, paidAmount: 47500000, remainingAmount: 47500000,
    dueDate: daysFrom(4), status: 'SENT', paymentStatus: 'PARTIAL',
    hasVoucher: true, voucherNumber: 'VCH-2025-0088', createdAt: daysAgo(14),
  },
  {
    id: 'inv-005', docNumber: 'INV-2025-0134', division: 'HM',
    qsNumber: 'QS-2025-0138',
    insuredName: 'PT Samudera Indonesia Tbk', vesselName: 'MV Samudera Biru',
    currency: 'USD', totalAmount: 91200, paidAmount: 91200, remainingAmount: 0,
    dueDate: daysAgo(15), status: 'PAID', paymentStatus: 'PAID',
    hasVoucher: true, voucherNumber: 'VCH-2025-0085', createdAt: daysAgo(30),
  },
  {
    id: 'inv-006', docNumber: 'INV-2025-0133', division: 'PI',
    qsNumber: 'QS-2025-0137',
    insuredName: 'PT Tanjung Priok Shipping', vesselName: 'KM Priok Jaya',
    currency: 'IDR', totalAmount: 210000000, paidAmount: 0, remainingAmount: 210000000,
    dueDate: daysFrom(18), status: 'ISSUED', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(5),
  },
  {
    id: 'inv-007', docNumber: 'INV-2025-0132', division: 'HM',
    qsNumber: 'QS-2025-0136',
    insuredName: 'PT Djakarta Lloyd', vesselName: 'MV Lloyd Nusantara',
    currency: 'USD', totalAmount: 28500, paidAmount: 0, remainingAmount: 28500,
    dueDate: daysAgo(11), status: 'OVERDUE', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(24),
  },
  {
    id: 'inv-008', docNumber: 'INV-2025-0131', division: 'PI',
    qsNumber: 'QS-2025-0135',
    insuredName: 'PT Bahtera Adhiguna', vesselName: 'TB Adhiguna Pusaka',
    currency: 'IDR', totalAmount: 145000000, paidAmount: 0, remainingAmount: 145000000,
    dueDate: daysFrom(25), status: 'DRAFT', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(2),
  },
  {
    id: 'inv-009', docNumber: 'INV-2025-0130', division: 'HM',
    qsNumber: 'QS-2025-0134',
    insuredName: 'PT Berlian Laju Tanker Tbk', vesselName: 'MT Berlian Ekuator',
    currency: 'USD', totalAmount: 155000, paidAmount: 155000, remainingAmount: 0,
    dueDate: daysAgo(20), status: 'PAID', paymentStatus: 'PAID',
    hasVoucher: true, voucherNumber: 'VCH-2025-0081', createdAt: daysAgo(35),
  },
  {
    id: 'inv-010', docNumber: 'INV-2025-0129', division: 'PI',
    qsNumber: 'QS-2025-0133',
    insuredName: 'PT Sinar Mas Shipping', vesselName: 'MV Sinar Nusantara',
    currency: 'USD', totalAmount: 63400, paidAmount: 0, remainingAmount: 63400,
    dueDate: daysFrom(3), status: 'SENT', paymentStatus: 'UNPAID',
    hasVoucher: false, createdAt: daysAgo(8),
  },
  {
    id: 'inv-011', docNumber: 'INV-2025-0128', division: 'HM',
    qsNumber: 'QS-2025-0132',
    insuredName: 'PT Karya Sumber Energi', vesselName: 'MT Karya Mandiri',
    currency: 'IDR', totalAmount: 320000000, paidAmount: 320000000, remainingAmount: 0,
    dueDate: daysAgo(8), status: 'PAID', paymentStatus: 'PAID',
    hasVoucher: true, voucherNumber: 'VCH-2025-0079', createdAt: daysAgo(28),
  },
  {
    id: 'inv-012', docNumber: 'INV-2025-0127', division: 'PI',
    qsNumber: 'QS-2025-0131',
    insuredName: 'PT Pelayaran Nasional Indonesia', vesselName: 'KM Nusantara Abadi',
    currency: 'IDR', totalAmount: 185000000, paidAmount: 92500000, remainingAmount: 92500000,
    dueDate: daysFrom(8), status: 'SENT', paymentStatus: 'PARTIAL',
    hasVoucher: false, createdAt: daysAgo(12),
  },
]

// ─── Full invoice detail ─────────────────────────────────────────
export const MOCK_INVOICE_DETAIL: InvoiceDocument = {
  id:            'inv-001',
  docNumber:     'INV-2025-0138',
  division:      'HM',
  status:        'SENT',
  paymentStatus: 'UNPAID',

  qsId:     'qs-001',
  qsNumber: 'QS-2025-0143',

  insuredName:    'PT Soechi Lines Tbk',
  vesselName:     'MV Soechi Cilacap',
  billingAddress: 'Jl. Letjen S. Parman Kav. 35, Jakarta Barat 11480',
  billingContact: '+62 21 5696 1234',

  currency:        'USD',
  subtotal:        47500,
  taxRate:         2.1,
  taxAmount:       997.5,
  discount:        0,
  totalAmount:     48500,
  paidAmount:      0,
  remainingAmount: 48500,

  issueDate: daysAgo(10),
  dueDate:   daysFrom(12),
  sentDate:  daysAgo(7),

  paymentTerms: 'Payment due within 30 days of invoice date. Late payment subject to 1.5% monthly interest.',
  bankInfo: {
    bankName:      'Bank Mandiri',
    accountNumber: '1234-5678-9012',
    accountName:   'PT Pandi Proteksi Marine Indonesia',
    bankBranch:    'Jakarta Pusat — Thamrin Branch',
    swiftCode:     'BMRIIDJA',
  },

  internalNotes: 'New H&M policy for MV Soechi Cilacap. Client confirmed coverage details via phone 14 Jan. Payment expected by end of month.',

  attachments: [
    {
      id: 'ia-001',
      filename: 'INV-2025-0138_PPMI.pdf',
      filesize: 284000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: daysAgo(10),
    },
    {
      id: 'ia-002',
      filename: 'Policy_Schedule_HM_MV_Soechi_Cilacap.pdf',
      filesize: 540000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: daysAgo(10),
    },
  ],

  createdBy: 'Andi Pratama',
  createdAt: daysAgo(10),
  updatedBy: 'Budi Santoso',
  updatedAt: daysAgo(7),

  activity: [
    ...baseActivity('INV-2025-0138'),
  ],
}

export const MOCK_INVOICE_PAGINATION = {
  page: 1, pageSize: 25, total: 138, totalPages: 6,
}
