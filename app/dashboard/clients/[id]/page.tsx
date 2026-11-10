// FILE: app/dashboard/clients/[id]/page.tsx
import type { Metadata } from 'next'
import { ClientDetailClient } from '@/components/clients/ClientDetailClient'

export const metadata: Metadata = { title: 'Client Detail | PPMI Flow' }

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="page-container">
      <ClientDetailClient id={params.id} />
    </div>
  )
}
