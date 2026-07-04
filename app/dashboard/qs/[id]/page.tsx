import type { Metadata } from 'next'
import { QSDetailClient } from '@/components/qs/QSDetailClient'

interface Props {
  params: { id: string }
}

// Static title; QSDetailClient will render the actual docNumber once loaded.
export const metadata: Metadata = { title: 'QS Detail | PPMI Flow' }

export default function QSDetailPage({ params }: Props) {
  // QSDetailClient fetches its own data via useQuery(fetchQSDetail).
  // Data cannot be fetched server-side: JWT is stored in localStorage.
  return <QSDetailClient id={params.id} />
}