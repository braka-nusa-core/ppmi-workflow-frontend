import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_SHIPMENT_DETAIL } from '@/lib/mock/shipmentData'
import { ShipmentEditClient }   from '@/components/shipment/ShipmentEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Shipment | PPMI Flow' }

export default function ShipmentEditPage({ params }: Props) {
  const shp = params.id === 'shp-002' ? MOCK_SHIPMENT_DETAIL : null
  if (!shp) notFound()
  if (shp.status === 'COMPLETED' || shp.status === 'CANCELLED') notFound()
  return <ShipmentEditClient shp={shp} />
}
