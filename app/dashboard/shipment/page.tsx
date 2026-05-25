import type { Metadata } from 'next'
import { MOCK_SHIPMENT_LIST, MOCK_SHIPMENT_PAGINATION } from '@/lib/mock/shipmentData'
import { ShipmentListClient } from '@/components/shipment/ShipmentListClient'

export const metadata: Metadata = { title: 'Shipments | PPMI Flow' }

export default function ShipmentListPage() {
  return (
    <div className="page-container">
      <ShipmentListClient
        initialData={MOCK_SHIPMENT_LIST}
        totalRecords={MOCK_SHIPMENT_PAGINATION.total}
      />
    </div>
  )
}
