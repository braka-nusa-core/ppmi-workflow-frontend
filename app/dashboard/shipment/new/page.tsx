import type { Metadata } from 'next'
import { Suspense }      from 'react'
import { ShipmentCreateClient } from '@/components/shipment/ShipmentCreateClient'

export const metadata: Metadata = { title: 'New Shipment | PPMI Flow' }

export default function NewShipmentPage() {
  return (
    <Suspense>
      <ShipmentCreateClient />
    </Suspense>
  )
}