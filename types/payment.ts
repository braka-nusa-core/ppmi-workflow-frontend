import type { WorkflowDocument, DocumentStatus, Division, PaymentStatus } from './workflow'

// ─── VOUCHER ─────────────────────────────────────────────────────
export interface VoucherDocument extends WorkflowDocument {
  invoiceId: string
  invoiceNumber: string
  clientName: string

  currency: 'IDR' | 'USD'
  amount: number
  bankName?: string
  accountNumber?: string
  accountName?: string

  issueDate: string
  paymentId?: string
  notes?: string
}

export interface VoucherListItem {
  id: string
  docNumber: string
  division: Division
  invoiceNumber: string
  clientName: string
  currency: 'IDR' | 'USD'
  amount: number
  status: DocumentStatus
  issueDate: string
  createdAt: string
}

export interface CreateVoucherPayload {
  invoiceId: string
  division: Division
  currency: 'IDR' | 'USD'
  amount: number
  bankName?: string
  accountNumber?: string
  accountName?: string
  issueDate: string
  notes?: string
}

// ─── PAYMENT ─────────────────────────────────────────────────────
export interface PaymentInstallment {
  id: string
  paymentId: string
  installmentNumber: number
  dueDate: string
  amount: number
  paidAmount?: number
  paidDate?: string
  status: PaymentStatus
  notes?: string
}

export interface PaymentDocument extends WorkflowDocument {
  voucherId: string
  voucherNumber: string
  invoiceId: string
  invoiceNumber: string
  clientName: string

  currency: 'IDR' | 'USD'
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: PaymentStatus

  isInstallment: boolean
  installmentCount?: number
  installments?: PaymentInstallment[]

  dueDate: string
  paidDate?: string
  paymentMethod?: string
  referenceNumber?: string
  notes?: string

  shipmentId?: string
}

export interface PaymentListItem {
  id: string
  docNumber: string
  division: Division
  voucherNumber: string
  clientName: string
  currency: 'IDR' | 'USD'
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  dueDate: string
  isInstallment: boolean
  createdAt: string
}

export interface CreatePaymentPayload {
  voucherId: string
  division: Division
  currency: 'IDR' | 'USD'
  totalAmount: number
  dueDate: string
  isInstallment: boolean
  installmentCount?: number
  paymentMethod?: string
  notes?: string
}

// ─── SHIPMENT ────────────────────────────────────────────────────
export interface ShipmentDocument extends WorkflowDocument {
  paymentId: string
  paymentNumber: string
  clientName: string
  vesselName?: string

  // Shipment details
  shipmentDate?: string
  portOfLoading?: string
  portOfDischarge?: string
  blNumber?: string         // Bill of Lading
  containerNumber?: string

  // Document tracking
  documentsReceived: boolean
  documentsReceivedDate?: string
  documentsForwarded: boolean
  documentsForwardedDate?: string

  notes?: string
}

export interface ShipmentListItem {
  id: string
  docNumber: string
  division: Division
  paymentNumber: string
  clientName: string
  vesselName?: string
  status: DocumentStatus
  shipmentDate?: string
  blNumber?: string
  documentsReceived: boolean
  documentsForwarded: boolean
  createdAt: string
}
