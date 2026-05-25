import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_SHIPMENT_DETAIL, MOCK_SHIPMENT_LIST } from '@/lib/mock/shipmentData'
import { ShipmentDetailClient } from '@/components/shipment/ShipmentDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = params.id === MOCK_SHIPMENT_DETAIL.id
    ? MOCK_SHIPMENT_DETAIL
    : MOCK_SHIPMENT_LIST.find((s) => s.id === params.id)
  return { title: doc ? `${doc.docNumber} | PPMI Flow` : 'Shipment | PPMI Flow' }
}

export default function ShipmentDetailPage({ params }: Props) {
  // In production: const shp = await fetchShipmentDetail(params.id)
  const shp = params.id === 'shp-002' ? MOCK_SHIPMENT_DETAIL : null
  if (!shp) notFound()
  return <ShipmentDetailClient shp={shp} />
}
