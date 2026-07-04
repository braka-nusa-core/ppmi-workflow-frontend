import { get, post, put, patch } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  VoucherDocument,
  VoucherListItem,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherStatus,
} from '@/types/voucher'
import type { BackendVoucherStatus } from '@/types/backend/voucher'
import {
  mapCreateVoucherPayload,
  mapUpdateVoucherPayload,
} from '@/lib/adapters/voucher'

const BASE = '/vouchers'

// ─── Backend envelope shape ───────────────────────────────────────
interface BackendVoucherListData {
  items:        VoucherListItem[]
  total_pages:  number
  current_page: number
}

interface BackendVoucherListEnvelope {
  success:     boolean
  status_code: number
  data:        BackendVoucherListData
}

export async function fetchVoucherList(params: ListQueryParams): Promise<PaginatedResponse<VoucherListItem>> {
  const envelope = await get<BackendVoucherListEnvelope>(BASE, { params })
  const pageSize = (params.pageSize ?? 25)
  return {
    success: true,
    data:    envelope.data.items,
    pagination: {
      page:       envelope.data.current_page,
      pageSize,
      total:      envelope.data.total_pages * pageSize,
      totalPages: envelope.data.total_pages,
    },
  }
}

export const fetchVoucherDetail = (id: string): Promise<ApiResponse<VoucherDocument>> =>
  get<ApiResponse<VoucherDocument>>(`${BASE}/${id}`)

/**
 * POST /vouchers
 * @param payload  Frontend form data (camelCase)
 * @param status   'DRAFT' | 'SUBMITTED' — required by backend Zod schema
 */
export async function createVoucher(
  payload: CreateVoucherPayload,
  status: BackendVoucherStatus = 'DRAFT',
): Promise<ApiResponse<VoucherDocument>> {
  return post<ApiResponse<VoucherDocument>>(BASE, mapCreateVoucherPayload(payload, status))
}

export const createVoucherFromInvoice = (invoiceId: string): Promise<ApiResponse<VoucherDocument>> =>
  post<ApiResponse<VoucherDocument>>(`${BASE}/from-invoice/${invoiceId}`)

/**
 * PUT /vouchers/:id
 * Uses mapUpdateVoucherPayload to convert camelCase → snake_case PATCH body.
 */
export async function updateVoucher(
  id: string,
  payload: UpdateVoucherPayload,
): Promise<ApiResponse<VoucherDocument>> {
  return put<ApiResponse<VoucherDocument>>(`${BASE}/${id}`, mapUpdateVoucherPayload(payload))
}

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