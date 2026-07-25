import type { Metadata } from 'next'
import { ShipmentDetailClient } from '@/components/shipment/ShipmentDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Shipment ${params.id} | PPMI Flow` }
}

export default function ShipmentDetailPage({ params }: Props) {
  // ShipmentDetailClient self-fetches via useQuery(['shipment-detail', id]).
  return <ShipmentDetailClient id={params.id} />
} 