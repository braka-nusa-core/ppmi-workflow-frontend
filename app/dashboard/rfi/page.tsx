import type { Metadata } from 'next'
import { RfiListClient } from '@/components/rfi/RfiListClient'

export const metadata: Metadata = { title: 'Request For Invoice | PPMI Flow' }

export default function RfiPage() {
  return <RfiListClient />
}