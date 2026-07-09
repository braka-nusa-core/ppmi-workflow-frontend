import type { Metadata } from 'next'
import { ShipmentListClient } from '@/components/shipment/ShipmentListClient'

export const metadata: Metadata = { title: 'Shipments | PPMI Flow' }

export default function ShipmentPage() {
  // ShipmentListClient self-fetches via useQuery(['shipment-list', params]).
  return <ShipmentListClient />
}