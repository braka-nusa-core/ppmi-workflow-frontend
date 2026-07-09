import { get, post, patch } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  VoucherDocument,
  VoucherListItem,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from '@/types/voucher'
import type {
  BackendVoucherStatus,
  BackendVoucherListEnvelope,
  BackendVoucherDetailEnvelope,
} from '@/types/backend/voucher'
import {
  mapCreateVoucherPayload,
  mapUpdateVoucherPayload,
  mapVoucherListItem,
  mapVoucherDetail,
} from '@/lib/adapters/voucher'

const BASE = '/vouchers'

export async function fetchVoucherList(params: ListQueryParams): Promise<PaginatedResponse<VoucherListItem>> {
  const envelope = await get<BackendVoucherListEnvelope>(BASE, { params })
  const pageSize = (params.pageSize ?? 25)
  return {
    success: true,
    data:    envelope.data.items.map(mapVoucherListItem),
    pagination: {
      page:       envelope.data.current_page,
      pageSize,
      total:      envelope.data.total_pages * pageSize,
      totalPages: envelope.data.total_pages,
    },
  }
}

export const fetchVoucherDetail = (id: string): Promise<ApiResponse<VoucherDocument>> =>
  get<BackendVoucherDetailEnvelope>(`${BASE}/${id}`).then((envelope) => ({
    success: envelope.success,
    data:    mapVoucherDetail(envelope.data),
  }))

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
 * PATCH /vouchers/:id
 * Uses mapUpdateVoucherPayload to convert camelCase → snake_case PATCH body.
 */
export async function updateVoucher(
  id: string,
  payload: UpdateVoucherPayload,
): Promise<ApiResponse<VoucherDocument>> {
  return patch<ApiResponse<VoucherDocument>>(`${BASE}/${id}`, mapUpdateVoucherPayload(payload))
}

export const cancelVoucher = (id: string): Promise<ApiResponse<void>> =>
  patch<ApiResponse<void>>(`${BASE}/${id}/cancel`)

export const downloadVoucherPDF = (id: string): Promise<Blob> =>
  fetch(`${BASE}/${id}/pdf`).then((r) => r.blob())