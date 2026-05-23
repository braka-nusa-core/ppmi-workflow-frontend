import { get, post, put, patch } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  VoucherDocument,
  VoucherListItem,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherStatus,
} from '@/types/voucher'

const BASE = '/vouchers'

export const fetchVoucherList = (params: ListQueryParams): Promise<PaginatedResponse<VoucherListItem>> =>
  get<PaginatedResponse<VoucherListItem>>(BASE, { params })

export const fetchVoucherDetail = (id: string): Promise<ApiResponse<VoucherDocument>> =>
  get<ApiResponse<VoucherDocument>>(`${BASE}/${id}`)

export const createVoucher = (payload: CreateVoucherPayload): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(BASE, payload)

export const createVoucherFromInvoice = (invoiceId: string): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(`${BASE}/from-invoice/${invoiceId}`)

export const updateVoucher = (id: string, payload: UpdateVoucherPayload): Promise<ApiResponse<VoucherDocument>> =>
  put<ApiResponse<VoucherDocument>>(`${BASE}/${id}`, payload)

export const updateVoucherStatus = (id: string, status: VoucherStatus): Promise<ApiResponse<VoucherDocument>> =>
  patch<ApiResponse<VoucherDocument>>(`${BASE}/${id}/status`, { status })

export const submitVoucherForApproval = (id: string): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(`${BASE}/${id}/submit`)

export const approveVoucher = (id: string, notes?: string): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(`${BASE}/${id}/approve`, { notes })

export const rejectVoucher = (id: string, reason: string): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(`${BASE}/${id}/reject`, { reason })

export const advanceToPayment = (id: string): Promise<ApiResponse<{ paymentId: string; paymentNumber: string }>> =>
  post<ApiResponse<{ paymentId: string; paymentNumber: string }>>(`${BASE}/${id}/advance`)

export const cancelVoucher = (id: string): Promise<ApiResponse<void>> =>
  patch<ApiResponse<void>>(`${BASE}/${id}/cancel`)

export const downloadVoucherPDF = (id: string): Promise<Blob> =>
  fetch(`${BASE}/${id}/pdf`).then((r) => r.blob())
