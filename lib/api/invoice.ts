import { get, post, put, patch, del } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  InvoiceDocument,
  InvoiceListItem,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceStatus
} from '@/types/invoice'

const BASE = '/invoices'

export async function fetchInvoiceList(params: ListQueryParams): Promise<PaginatedResponse<InvoiceListItem>> {
  return get<PaginatedResponse<InvoiceListItem>>(BASE, { params })
}

export async function fetchInvoiceDetail(id: string): Promise<ApiResponse<InvoiceDocument>> {
  return get<ApiResponse<InvoiceDocument>>(`${BASE}/${id}`)
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<ApiResponse<InvoiceDocument>> {
  return post<ApiResponse<InvoiceDocument>>(BASE, payload)
}

export async function createInvoiceFromQS(qsId: string): Promise<ApiResponse<InvoiceDocument>> {
  return post<ApiResponse<InvoiceDocument>>(`${BASE}/from-qs/${qsId}`)
}

export async function updateInvoice(id: string, payload: UpdateInvoicePayload): Promise<ApiResponse<InvoiceDocument>> {
  return put<ApiResponse<InvoiceDocument>>(`${BASE}/${id}`, payload)
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<ApiResponse<InvoiceDocument>> {
  return patch<ApiResponse<InvoiceDocument>>(`${BASE}/${id}/status`, { status })
}

export async function markInvoiceSent(id: string): Promise<ApiResponse<InvoiceDocument>> {
  return patch<ApiResponse<InvoiceDocument>>(`${BASE}/${id}/mark-sent`)
}

export async function advanceToVoucher(id: string): Promise<ApiResponse<{ voucherId: string; voucherNumber: string }>> {
  return post<ApiResponse<{ voucherId: string; voucherNumber: string }>>(`${BASE}/${id}/advance`)
}

export async function deleteInvoice(id: string): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`${BASE}/${id}`)
}

export async function downloadInvoicePDF(id: string): Promise<Blob> {
  const res = await fetch(`${BASE}/${id}/pdf`)
  return res.blob()
}
