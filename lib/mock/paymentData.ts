import type { PaymentListItem, PaymentDocument, PaymentInstallment } from '@/types/payment'

const now = new Date()
const ago = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const from = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

// ─── Mock installments ───────────────────────────────────────────
const makeInstallments = (
  paymentId: string,
  total: number,
  count: number,
  paidCount: number
): PaymentInstallment[] => {
  const perInstallment = total / count
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1
    const isPaid = num <= paidCount
    const dueOffset = -20 + (i * 30) // spread 30 days apart from 20 days ago
    return {
      id: `${paymentId}-inst-${num}`,
      paymentId,
      installmentNumber: num,
      dueDate: from(dueOffset),
      amount: perInstallment,
      paidAmount: isPaid ? perInstallment : 0,
      paidDate: isPaid ? ago(20 - i * 28) : undefined,
      paymentMethod: isPaid ? ('BANK_TRANSFER' as const) : undefined,
      referenceNumber: isPaid ? `REF-${paymentId.toUpperCase()}-${num}` : undefined,
      status: isPaid ? 'PAID' : dueOffset < 0 ? 'OVERDUE' : 'UNPAID',
      verifiedBy: isPaid ? 'Dewi Rahmawati' : undefined,
      verifiedAt: isPaid ? ago(19 - i * 28) : undefined,
    }
  })
}

// ─── List items ──────────────────────────────────────────────────
export const MOCK_PAYMENT_LIST: PaymentListItem[] = [
  {
    id: 'pay-001', docNumber: 'PAY-2025-0095', division: 'PI',
    voucherNumber: 'VCH-2025-0099', invoiceNumber: 'INV-2025-0138',
    insuredName: 'PT Soechi Lines Tbk', vesselName: 'MV Soechi Cilacap',
    currency: 'USD', totalAmount: 48500, paidAmount: 0, remainingAmount: 48500,
    dueDate: from(12), paymentStatus: 'UNPAID', verificationStatus: 'UNVERIFIED',
    isInstallment: false, hasShipment: false, createdAt: ago(3),
  },
  {
    id: 'pay-002', docNumber: 'PAY-2025-0094', division: 'HM',
    voucherNumber: 'VCH-2025-0098', invoiceNumber: 'INV-2025-0137',
    insuredName: 'PT Arpeni Pratama Ocean Line', vesselName: 'MV Artha Kencana',
    currency: 'USD', totalAmount: 72000, paidAmount: 72000, remainingAmount: 0,
    dueDate: ago(5), paymentStatus: 'PAID', verificationStatus: 'VERIFIED',
    isInstallment: false, hasShipment: true, shipmentNumber: 'SHP-2025-0041',
    createdAt: ago(20),
  },
  {
    id: 'pay-003', docNumber: 'PAY-2025-0093', division: 'PI',
    voucherNumber: 'VCH-2025-0097', invoiceNumber: 'INV-2025-0135',
    insuredName: 'CV Mitra Bahari Sentosa', vesselName: 'KM Mitra Sejahtera',
    currency: 'IDR', totalAmount: 95000000, paidAmount: 47500000, remainingAmount: 47500000,
    dueDate: from(4), paymentStatus: 'PARTIAL', verificationStatus: 'UNVERIFIED',
    isInstallment: true, installmentCount: 2, hasShipment: false, createdAt: ago(15),
  },
  {
    id: 'pay-004', docNumber: 'PAY-2025-0092', division: 'HM',
    voucherNumber: 'VCH-2025-0096', invoiceNumber: 'INV-2025-0134',
    insuredName: 'PT Samudera Indonesia Tbk', vesselName: 'MV Samudera Biru',
    currency: 'USD', totalAmount: 91200, paidAmount: 91200, remainingAmount: 0,
    dueDate: ago(15), paymentStatus: 'PAID', verificationStatus: 'VERIFIED',
    isInstallment: false, hasShipment: true, shipmentNumber: 'SHP-2025-0038',
    createdAt: ago(30),
  },
  {
    id: 'pay-005', docNumber: 'PAY-2025-0091', division: 'PI',
    voucherNumber: 'VCH-2025-0095', invoiceNumber: 'INV-2025-0133',
    insuredName: 'PT Tanjung Priok Shipping', vesselName: 'KM Priok Jaya',
    currency: 'IDR', totalAmount: 210000000, paidAmount: 0, remainingAmount: 210000000,
    dueDate: from(18), paymentStatus: 'UNPAID', verificationStatus: 'UNVERIFIED',
    isInstallment: false, hasShipment: false, createdAt: ago(5),
  },
  {
    id: 'pay-006', docNumber: 'PAY-2025-0090', division: 'HM',
    voucherNumber: 'VCH-2025-0094', invoiceNumber: 'INV-2025-0130',
    insuredName: 'PT Berlian Laju Tanker Tbk', vesselName: 'MT Berlian Ekuator',
    currency: 'USD', totalAmount: 155000, paidAmount: 155000, remainingAmount: 0,
    dueDate: ago(20), paymentStatus: 'PAID', verificationStatus: 'VERIFIED',
    isInstallment: false, hasShipment: true, shipmentNumber: 'SHP-2025-0035',
    createdAt: ago(38),
  },
  {
    id: 'pay-007', docNumber: 'PAY-2025-0089', division: 'PI',
    voucherNumber: 'VCH-2025-0093', invoiceNumber: 'INV-2025-0127',
    insuredName: 'PT Pelayaran Nasional Indonesia', vesselName: 'KM Nusantara Abadi',
    currency: 'IDR', totalAmount: 185000000, paidAmount: 0, remainingAmount: 185000000,
    dueDate: ago(6), paymentStatus: 'OVERDUE', verificationStatus: 'UNVERIFIED',
    isInstallment: true, installmentCount: 3, hasShipment: false, createdAt: ago(25),
  },
  {
    id: 'pay-008', docNumber: 'PAY-2025-0088', division: 'HM',
    voucherNumber: 'VCH-2025-0092', invoiceNumber: 'INV-2025-0128',
    insuredName: 'PT Karya Sumber Energi', vesselName: 'MT Karya Mandiri',
    currency: 'IDR', totalAmount: 320000000, paidAmount: 320000000, remainingAmount: 0,
    dueDate: ago(8), paymentStatus: 'PAID', verificationStatus: 'FLAGGED',
    isInstallment: false, hasShipment: false, createdAt: ago(28),
  },
  {
    id: 'pay-009', docNumber: 'PAY-2025-0087', division: 'PI',
    voucherNumber: 'VCH-2025-0091', invoiceNumber: 'INV-2025-0129',
    insuredName: 'PT Sinar Mas Shipping', vesselName: 'MV Sinar Nusantara',
    currency: 'USD', totalAmount: 63400, paidAmount: 0, remainingAmount: 63400,
    dueDate: from(3), paymentStatus: 'UNPAID', verificationStatus: 'UNVERIFIED',
    isInstallment: false, hasShipment: false, createdAt: ago(8),
  },
  {
    id: 'pay-010', docNumber: 'PAY-2025-0086', division: 'HM',
    voucherNumber: 'VCH-2025-0090', invoiceNumber: 'INV-2025-0126',
    insuredName: 'PT Djakarta Lloyd', vesselName: 'MV Lloyd Nusantara',
    currency: 'USD', totalAmount: 28500, paidAmount: 0, remainingAmount: 28500,
    dueDate: ago(11), paymentStatus: 'OVERDUE', verificationStatus: 'UNVERIFIED',
    isInstallment: false, hasShipment: false, createdAt: ago(22),
  },
]

// ─── Full detail document ────────────────────────────────────────
const installments = makeInstallments('pay-003', 95000000, 2, 1)

export const MOCK_PAYMENT_DETAIL: PaymentDocument = {
  id: 'pay-003',
  docNumber: 'PAY-2025-0093',
  division: 'PI',
  paymentStatus: 'PARTIAL',
  verificationStatus: 'UNVERIFIED',

  voucherId: 'vch-003',
  voucherNumber: 'VCH-2025-0097',
  invoiceId: 'inv-004',
  invoiceNumber: 'INV-2025-0135',
  qsId: 'qs-005',
  qsNumber: 'QS-2025-0139',

  insuredName: 'CV Mitra Bahari Sentosa',
  vesselName: 'KM Mitra Sejahtera',

  currency: 'IDR',
  totalAmount: 95000000,
  paidAmount: 47500000,
  remainingAmount: 47500000,

  dueDate: from(4),

  isInstallment: true,
  installmentCount: 2,
  installments,

  lastPaymentDate: ago(5),
  lastPaymentAmount: 47500000,
  lastPaymentMethod: 'BANK_TRANSFER',
  lastReferenceNumber: 'REF-PAY003-1',

  internalNotes: '2-installment arrangement confirmed with client. First installment received on time. Second installment due in 4 days.',

  createdBy: 'Andi Pratama',
  createdAt: ago(15),
  updatedBy: 'Dewi Rahmawati',
  updatedAt: ago(5),

  activity: [
    {
      id: 'pay-003-a1', type: 'created',
      description: 'PAY-2025-0093 created from VCH-2025-0097',
      actor: 'Andi Pratama', timestamp: ago(15),
    },
    {
      id: 'pay-003-a2', type: 'installment_recorded',
      description: 'Installment 1/2 recorded — IDR 47,500,000',
      actor: 'Dewi Rahmawati', timestamp: ago(5),
      meta: { amount: 47500000, currency: 'IDR', installmentNumber: 1, referenceNumber: 'REF-PAY003-1' },
    },
    {
      id: 'pay-003-a3', type: 'updated',
      description: 'Payment status updated to Partial',
      actor: 'System', timestamp: ago(5),
      meta: { fromStatus: 'UNPAID', toStatus: 'PARTIAL' },
    },
  ],
}

export const MOCK_PAYMENT_PAGINATION = {
  page: 1, pageSize: 25, total: 95, totalPages: 4,
}
