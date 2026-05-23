import { get, post, put, patch, del } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type { QSDocument, QSListItem, CreateQSPayload, UpdateQSPayload, QSStatus } from '@/types/qs'

const BASE = '/qs'

export async function fetchQSList(params: ListQueryParams): Promise<PaginatedResponse<QSListItem>> {
  return get<PaginatedResponse<QSListItem>>(BASE, { params })
}
export async function fetchQSDetail(id: string): Promise<ApiResponse<QSDocument>> {
  return get<ApiResponse<QSDocument>>(`${BASE}/${id}`)
}
export async function createQS(payload: CreateQSPayload): Promise<ApiResponse<QSDocument>> {
  return post<ApiResponse<QSDocument>>(BASE, payload)
}
export async function updateQS(id: string, payload: UpdateQSPayload): Promise<ApiResponse<QSDocument>> {
  return put<ApiResponse<QSDocument>>(`${BASE}/${id}`, payload)
}
export async function updateQSStatus(id: string, status: QSStatus): Promise<ApiResponse<QSDocument>> {
  return patch<ApiResponse<QSDocument>>(`${BASE}/${id}/status`, { status })
}
export async function deleteQS(id: string): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`${BASE}/${id}`)
}
export async function advanceToInvoice(id: string): Promise<ApiResponse<{ invoiceId: string; invoiceNumber: string }>> {
  return post<ApiResponse<{ invoiceId: string; invoiceNumber: string }>>(`${BASE}/${id}/advance`)
}
export async function previewQSNumber(division: string): Promise<ApiResponse<{ docNumber: string }>> {
  return get<ApiResponse<{ docNumber: string }>>(`${BASE}/preview-number`, { params: { division } })
}
