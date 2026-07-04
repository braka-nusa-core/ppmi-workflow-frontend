import type { Metadata } from 'next'
import { QSEditClient }   from '@/components/qs/QSEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit QS | PPMI Flow' }

export default function QSEditPage({ params }: Props) {
  // QSEditClient fetches its own data, enforces the DRAFT/REJECTED edit guard,
  // and handles loading/error states. JWT is in localStorage — must run client-side.
  return <QSEditClient id={params.id} />
}