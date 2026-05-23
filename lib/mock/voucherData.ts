import type { VoucherListItem, VoucherDocument } from '@/types/voucher'

const now     = new Date()
const ago     = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const from    = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

// const baseActivity = (docNumber: string): VoucherActivity[] => [
//   {
//     id: `${docNumber}-a1`, type: 'created',
//     description: `${docNumber} created from approved invoice`,
//     actor: 'Andi Pratama', timestamp: ago(8),
//   },
//   {
//     id: `${docNumber}-a2`, type: 'submitted',
//     description: 'Submitted for finance approval',
//     actor: 'Andi Pratama', timestamp: ago(7),
//     meta: { fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL' },
//   },
//   {
//     id: `${docNumber}-a3`, type: 'approved',
//     description: 'Voucher approved by Finance Manager',
//     actor: 'Dewi Rahmawati', timestamp: ago(6),
//     meta: { fromStatus: 'PENDING_APPROVAL', toStatus: 'APPROVED' },
//   },
// ]

// ─── List items ──────────────────────────────────────────────────
export const MOCK_VOUCHER_LIST: VoucherListItem[] = [
  {
    id: 'vch-001', docNumber: 'VCH-2025-0099', division: 'PI',
    invoiceNumber: 'INV-2025-0138', qsNumber: 'QS-2025-0143',
    insuredName: 'PT Soechi Lines Tbk',
    paymentType: 'BANK_TRANSFER', bankName: 'Bank Mandiri',
    currency: 'USD', amount: 48500,
    status: 'PENDING_APPROVAL', approvalStatus: 'WAITING',
    hasPayment: false, createdAt: ago(3),
  },
  {
    id: 'vch-002', docNumber: 'VCH-2025-0098', division: 'HM',
    invoiceNumber: 'INV-2025-0137', qsNumber: 'QS-2025-0142',
    insuredName: 'PT Arpeni Pratama Ocean Line',
    paymentType: 'RTGS', bankName: 'Bank BNI',
    currency: 'USD', amount: 72000,
    status: 'PROCESSED', approvalStatus: 'APPROVED',
    hasPayment: true, paymentNumber: 'PAY-2025-0091',
    createdAt: ago(18),
  },
  {
    id: 'vch-003', docNumber: 'VCH-2025-0097', division: 'PI',
    invoiceNumber: 'INV-2025-0135', qsNumber: 'QS-2025-0139',
    insuredName: 'CV Mitra Bahari Sentosa',
    paymentType: 'BANK_TRANSFER', bankName: 'Bank BCA',
    currency: 'IDR', amount: 95000000,
    status: 'APPROVED', approvalStatus: 'APPROVED',
    hasPayment: false, createdAt: ago(12),
  },
  {
    id: 'vch-004', docNumber: 'VCH-2025-0096', division: 'HM',
    invoiceNumber: 'INV-2025-0134', qsNumber: 'QS-2025-0138',
    insuredName: 'PT Samudera Indonesia Tbk',
    paymentType: 'SWIFT', bankName: 'Bank Mandiri',
    currency: 'USD', amount: 91200,
    status: 'PROCESSED', approvalStatus: 'APPROVED',
    hasPayment: true, paymentNumber: 'PAY-2025-0088',
    createdAt: ago(28),
  },
  {
    id: 'vch-005', docNumber: 'VCH-2025-0095', division: 'PI',
    invoiceNumber: 'INV-2025-0133', qsNumber: 'QS-2025-0137',
    insuredName: 'PT Tanjung Priok Shipping',
    paymentType: 'BANK_TRANSFER', bankName: 'Bank BRI',
    currency: 'IDR', amount: 210000000,
    status: 'DRAFT', approvalStatus: 'WAITING',
    hasPayment: false, createdAt: ago(2),
  },
  {
    id: 'vch-006', docNumber: 'VCH-2025-0094', division: 'HM',
    invoiceNumber: 'INV-2025-0130', qsNumber: 'QS-2025-0134',
    insuredName: 'PT Berlian Laju Tanker Tbk',
    paymentType: 'SWIFT', bankName: 'Bank CIMB Niaga',
    currency: 'USD', amount: 155000,
    status: 'PROCESSED', approvalStatus: 'APPROVED',
    hasPayment: true, paymentNumber: 'PAY-2025-0085',
    createdAt: ago(35),
  },
  {
    id: 'vch-007', docNumber: 'VCH-2025-0093', division: 'PI',
    invoiceNumber: 'INV-2025-0127', qsNumber: 'QS-2025-0131',
    insuredName: 'PT Pelayaran Nasional Indonesia',
    paymentType: 'RTGS', bankName: 'Bank BNI',
    currency: 'IDR', amount: 185000000,
    status: 'PENDING_APPROVAL', approvalStatus: 'WAITING',
    hasPayment: false, createdAt: ago(5),
  },
  {
    id: 'vch-008', docNumber: 'VCH-2025-0092', division: 'HM',
    invoiceNumber: 'INV-2025-0128', qsNumber: 'QS-2025-0132',
    insuredName: 'PT Karya Sumber Energi',
    paymentType: 'BANK_TRANSFER', bankName: 'Bank Mandiri',
    currency: 'IDR', amount: 320000000,
    status: 'CANCELLED', approvalStatus: 'REJECTED',
    hasPayment: false, createdAt: ago(22),
  },
]

// ─── Full detail document ────────────────────────────────────────
export const MOCK_VOUCHER_DETAIL: VoucherDocument = {
  id:             'vch-001',
  docNumber:      'VCH-2025-0099',
  division:       'PI',
  status:         'PENDING_APPROVAL',
  approvalStatus: 'WAITING',

  invoiceId:     'inv-001',
  invoiceNumber: 'INV-2025-0138',
  qsId:          'qs-001',
  qsNumber:      'QS-2025-0143',

  insuredName:  'PT Soechi Lines Tbk',
  vesselName:   'MV Soechi Cilacap',

  paymentType:   'BANK_TRANSFER',
  currency:      'USD',
  amount:        48500,

  bankName:      'Bank Mandiri',
  bankBranch:    'Jakarta Pusat — Thamrin Branch',
  accountNumber: '1234-5678-9012',
  accountName:   'PT Soechi Lines Tbk',
  swiftCode:     'BMRIIDJA',

  processingDate: from(5),

  approvalPIC:   'Dewi Rahmawati',
  approvalNotes: 'Standard P&I premium payment — please process by processing date.',

  approval: {
    id:           'appr-001',
    approverName: 'Dewi Rahmawati',
    approverRole: 'Finance Manager',
    status:       'WAITING',
  },

  internalNotes: 'USD payment via Bank Mandiri SWIFT. Confirm exchange rate with treasury before processing.',

  attachments: [
    {
      id: 'va-001',
      filename: 'VCH-2025-0099_PPMI.pdf',
      filesize: 198000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: ago(3),
    },
    {
      id: 'va-002',
      filename: 'INV-2025-0138_Reference.pdf',
      filesize: 284000,
      filetype: 'application/pdf',
      uploadedBy: 'Andi Pratama',
      uploadedAt: ago(3),
    },
  ],

  createdBy: 'Andi Pratama',
  createdAt: ago(3),
  updatedBy: 'Andi Pratama',
  updatedAt: ago(3),

  activity: [
    {
      id: 'vch-001-a1', type: 'created',
      description: 'VCH-2025-0099 created from INV-2025-0138',
      actor: 'Andi Pratama', timestamp: ago(3),
    },
    {
      id: 'vch-001-a2', type: 'submitted',
      description: 'Submitted for approval to Dewi Rahmawati (Finance Manager)',
      actor: 'Andi Pratama', timestamp: ago(2),
      meta: { fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL' },
    },
    {
      id: 'vch-001-a3', type: 'approval_requested',
      description: 'Approval notification sent to Finance Manager',
      actor: 'System', timestamp: ago(2),
    },
  ],
}

export const MOCK_VOUCHER_PAGINATION = {
  page: 1, pageSize: 25, total: 99, totalPages: 4,
}
