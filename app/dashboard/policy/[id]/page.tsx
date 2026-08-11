import type { Metadata } from 'next'
import { PolicyDetailClient } from '@/components/policy/PolicyDetailClient'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Policy ${params.id} | PPMI Flow` }
}

export default function PolicyDetailPage({ params }: Props) {
  return <PolicyDetailClient id={params.id} />
}