import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { MOCK_QS_DETAIL, MOCK_QS_LIST } from '@/lib/mock/qsData'
import { QSDetailClient } from '@/components/qs/QSDetailClient'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = params.id === MOCK_QS_DETAIL.id
    ? MOCK_QS_DETAIL
    : MOCK_QS_LIST.find((q) => q.id === params.id)
  return {
    title: doc ? `${doc.docNumber} | PPMI Flow` : 'QS Detail | PPMI Flow',
  }
}

export default function QSDetailPage({ params }: Props) {
  // In production: const qs = await fetchQSDetail(params.id)
  const qs = params.id === 'qs-002' ? MOCK_QS_DETAIL : null
  if (!qs) notFound()
  return <QSDetailClient qs={qs} />
}
