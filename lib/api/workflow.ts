import { get, post, put, patch, del } from './client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  PaymentDocument, PaymentListItem, CreatePaymentPayload, PaymentInstallment,
} from '@/types/payment'
import type {
  VoucherDocument, VoucherListItem, CreateVoucherPayload,
} from '@/types/voucher'
import type {
  ShipmentDocument, ShipmentListItem,
} from '@/types/shipment'
import type { DocumentStatus, PaymentStatus } from '@/types/workflow'

// ─── VOUCHER ─────────────────────────────────────────────────────
const VOUCHER_BASE = '/vouchers'

export async function fetchVoucherList(params: ListQueryParams): Promise<PaginatedResponse<VoucherListItem>> {
  return get<PaginatedResponse<VoucherListItem>>(VOUCHER_BASE, { params })
}

export async function fetchVoucher(id: string): Promise<ApiResponse<VoucherDocument>> {
  return get<ApiResponse<VoucherDocument>>(`${VOUCHER_BASE}/${id}`)
}

export async function createVoucher(payload: CreateVoucherPayload): Promise<ApiResponse<VoucherDocument>> {
  return post<ApiResponse<VoucherDocument>>(VOUCHER_BASE, payload)
}

export async function updateVoucherStatus(id: string, status: DocumentStatus): Promise<ApiResponse<VoucherDocument>> {
  return patch<ApiResponse<VoucherDocument>>(`${VOUCHER_BASE}/${id}/status`, { status })
}

export async function deleteVoucher(id: string): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`${VOUCHER_BASE}/${id}`)
}

export async function advanceVoucherToPayment(id: string): Promise<ApiResponse<{ paymentId: string }>> {
  return post<ApiResponse<{ paymentId: string }>>(`${VOUCHER_BASE}/${id}/advance`)
}

// ─── PAYMENT ─────────────────────────────────────────────────────
const PAYMENT_BASE = '/payments'

export async function fetchPaymentList(params: ListQueryParams): Promise<PaginatedResponse<PaymentListItem>> {
  return get<PaginatedResponse<PaymentListItem>>(PAYMENT_BASE, { params })
}

export async function fetchPayment(id: string): Promise<ApiResponse<PaymentDocument>> {
  return get<ApiResponse<PaymentDocument>>(`${PAYMENT_BASE}/${id}`)
}

export async function createPayment(payload: CreatePaymentPayload): Promise<ApiResponse<PaymentDocument>> {
  return post<ApiResponse<PaymentDocument>>(PAYMENT_BASE, payload)
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<ApiResponse<PaymentDocument>> {
  return patch<ApiResponse<PaymentDocument>>(`${PAYMENT_BASE}/${id}/status`, { status })
}

export async function recordInstallment(
  paymentId: string,
  installmentId: string,
  data: { paidAmount: number; paidDate: string; referenceNumber?: string }
): Promise<ApiResponse<PaymentInstallment>> {
  return patch<ApiResponse<PaymentInstallment>>(
    `${PAYMENT_BASE}/${paymentId}/installments/${installmentId}`,
    data
  )
}

export async function fetchOverduePayments(params: ListQueryParams): Promise<PaginatedResponse<PaymentListItem>> {
  return get<PaginatedResponse<PaymentListItem>>(`${PAYMENT_BASE}/overdue`, { params })
}

// ─── SHIPMENT ────────────────────────────────────────────────────
const SHIPMENT_BASE = '/shipments'

export async function fetchShipmentList(params: ListQueryParams): Promise<PaginatedResponse<ShipmentListItem>> {
  return get<PaginatedResponse<ShipmentListItem>>(SHIPMENT_BASE, { params })
}

export async function fetchShipment(id: string): Promise<ApiResponse<ShipmentDocument>> {
  return get<ApiResponse<ShipmentDocument>>(`${SHIPMENT_BASE}/${id}`)
}

export async function updateShipment(
  id: string,
  data: Partial<ShipmentDocument>
): Promise<ApiResponse<ShipmentDocument>> {
  return put<ApiResponse<ShipmentDocument>>(`${SHIPMENT_BASE}/${id}`, data)
}

export async function updateShipmentStatus(id: string, status: DocumentStatus): Promise<ApiResponse<ShipmentDocument>> {
  return patch<ApiResponse<ShipmentDocument>>(`${SHIPMENT_BASE}/${id}/status`, { status })
}
