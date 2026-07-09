import type { Metadata } from 'next'
import { ShipmentEditClient } from '@/components/shipment/ShipmentEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Shipment | PPMI Flow' }

export default function ShipmentEditPage({ params }: Props) {
  // ShipmentEditClient self-fetches and handles its own loading/error states.
  return <ShipmentEditClient id={params.id} />
}