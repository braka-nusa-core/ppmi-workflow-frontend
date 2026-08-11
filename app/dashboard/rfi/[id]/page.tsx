import type { Metadata } from 'next'
import { RfiDetailClient } from '@/components/rfi/RfiDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `RFI ${params.id} | PPMI Flow` }
}

export default function RfiDetailPage({ params }: Props) {
  return <RfiDetailClient id={params.id} />
}