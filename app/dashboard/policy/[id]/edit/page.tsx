import type { Metadata } from 'next'
import { PolicyEditClient } from '@/components/policy/PolicyEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit Policy | PPMI Flow' }

export default function PolicyEditPage({ params }: Props) {
  return <PolicyEditClient id={params.id} />
}