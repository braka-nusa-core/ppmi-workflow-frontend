// FILE: app/dashboard/clients/page.tsx
import type { Metadata } from 'next'
import { ClientDirectoryClient } from '@/components/clients/ClientDirectoryClient'

export const metadata: Metadata = { title: 'Client Management | PPMI Flow' }

export default function ClientsPage() {
  return (
    <div className="page-container [contain:inline-size]">
      <ClientDirectoryClient />
    </div>
  )
}
