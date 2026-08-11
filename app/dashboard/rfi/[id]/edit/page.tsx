import type { Metadata } from 'next'
import { RfiEditClient } from '@/components/rfi/RfiEditClient'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Edit RFI | PPMI Flow' }

export default function RfiEditPage({ params }: Props) {
  return <RfiEditClient id={params.id} />
}