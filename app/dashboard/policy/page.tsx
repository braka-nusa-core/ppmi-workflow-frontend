import type { Metadata } from 'next'
import { PolicyListClient } from '@/components/policy/PolicyListClient'

export const metadata: Metadata = { title: 'Policy Placement | PPMI Flow' }

export default function PolicyPage() {
  return <PolicyListClient />
}