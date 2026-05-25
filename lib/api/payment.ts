import { get, post, put} from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  PaymentDocument, PaymentListItem, PaymentInstallment,
  CreatePaymentPayload, RecordPaymentPayload, RecordInstallmentPayload,
} from '@/types/payment'

const BASE = '/payments'

export const fetchPaymentList = (params: ListQueryParams): Promise<PaginatedResponse<PaymentListItem>> =>
  get<PaginatedResponse<PaymentListItem>>(BASE, { params })

export const fetchPaymentDetail = (id: string): Promise<ApiResponse<PaymentDocument>> =>
  get<ApiResponse<PaymentDocument>>(`${BASE}/${id}`)

export const fetchOverduePayments = (params: ListQueryParams): Promise<PaginatedResponse<PaymentListItem>> =>
  get<PaginatedResponse<PaymentListItem>>(`${BASE}/overdue`, { params })

export const createPayment = (payload: CreatePaymentPayload): Promise<ApiResponse<PaymentDocument>> =>
  post<ApiResponse<PaymentDocument>>(BASE, payload)

export const createPaymentFromVoucher = (voucherId: string): Promise<ApiResponse<PaymentDocument>> =>
  post<ApiResponse<PaymentDocument>>(`${BASE}/from-voucher/${voucherId}`)

export const recordPayment = (id: string, payload: RecordPaymentPayload): Promise<ApiResponse<PaymentDocument>> =>
  post<ApiResponse<PaymentDocument>>(`${BASE}/${id}/record`, payload)

export const recordInstallment = (
  paymentId: string,
  installmentId: string,
  payload: RecordInstallmentPayload
): Promise<ApiResponse<PaymentInstallment>> =>
  post<ApiResponse<PaymentInstallment>>(`${BASE}/${paymentId}/installments/${installmentId}/record`, payload)

export const verifyPayment = (id: string, notes?: string): Promise<ApiResponse<PaymentDocument>> =>
  post<ApiResponse<PaymentDocument>>(`${BASE}/${id}/verify`, { notes })

export const flagPayment = (id: string, reason: string): Promise<ApiResponse<PaymentDocument>> =>
  post<ApiResponse<PaymentDocument>>(`${BASE}/${id}/flag`, { reason })

export const advanceToShipment = (id: string): Promise<ApiResponse<{ shipmentId: string; shipmentNumber: string }>> =>
  post<ApiResponse<{ shipmentId: string; shipmentNumber: string }>>(`${BASE}/${id}/advance`)

export const updatePayment = (id: string, data: Partial<CreatePaymentPayload>): Promise<ApiResponse<PaymentDocument>> =>
  put<ApiResponse<PaymentDocument>>(`${BASE}/${id}`, data)
