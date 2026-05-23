import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_QS_DETAIL } from '@/lib/mock/qsData'
import { QSEditClient }   from '@/components/qs/QSEditClient'

interface Props {
  params: { id: string }
}

export const metadata: Metadata = { title: 'Edit QS | PPMI Flow' }

export default function QSEditPage({ params }: Props) {
  // In production: const qs = await fetchQSDetail(params.id)
  const qs = params.id === 'qs-002' ? MOCK_QS_DETAIL : null
  if (!qs) notFound()

  // Guard: only draft/revision can be edited
  if (qs.status !== 'DRAFT' && qs.status !== 'REVISION') {
    notFound()
  }

  return <QSEditClient qs={qs} />
}
