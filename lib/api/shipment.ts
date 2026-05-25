import { get, post, put, patch } from '@/lib/api/client'
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api'
import type {
  ShipmentDocument, ShipmentListItem,
  CreateShipmentPayload, UpdateShipmentPayload, ShipmentStatus,
} from '@/types/shipment'

const BASE = '/shipments'

export const fetchShipmentList = (params: ListQueryParams): Promise<PaginatedResponse<ShipmentListItem>> =>
  get<PaginatedResponse<ShipmentListItem>>(BASE, { params })

export const fetchShipmentDetail = (id: string): Promise<ApiResponse<ShipmentDocument>> =>
  get<ApiResponse<ShipmentDocument>>(`${BASE}/${id}`)

export const createShipment = (payload: CreateShipmentPayload): Promise<ApiResponse<ShipmentDocument>> =>
  post<ApiResponse<ShipmentDocument>>(BASE, payload)

export const createShipmentFromPayment = (paymentId: string): Promise<ApiResponse<ShipmentDocument>> =>
  post<ApiResponse<ShipmentDocument>>(`${BASE}/from-payment/${paymentId}`)

export const updateShipment = (id: string, payload: UpdateShipmentPayload): Promise<ApiResponse<ShipmentDocument>> =>
  put<ApiResponse<ShipmentDocument>>(`${BASE}/${id}`, payload)

export const markDocumentsReceived = (
  id: string, data: { receivedDate: string; receivedBy: string }
): Promise<ApiResponse<ShipmentDocument>> =>
  patch<ApiResponse<ShipmentDocument>>(`${BASE}/${id}/documents-received`, data)

export const markDocumentsForwarded = (
  id: string, data: { forwardedDate: string; forwardedTo: string; forwardedBy: string }
): Promise<ApiResponse<ShipmentDocument>> =>
  patch<ApiResponse<ShipmentDocument>>(`${BASE}/${id}/documents-forwarded`, data)

export const completeShipment = (id: string): Promise<ApiResponse<ShipmentDocument>> =>
  post<ApiResponse<ShipmentDocument>>(`${BASE}/${id}/complete`)

export const cancelShipment = (id: string): Promise<ApiResponse<void>> =>
  patch<ApiResponse<void>>(`${BASE}/${id}/cancel`)
