import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PolicyCreateClient } from '@/components/policy/PolicyCreateClient'

export const metadata: Metadata = { title: 'New Policy | PPMI Flow' }

export default function NewPolicyPage() {
  return (
    <Suspense>
      <PolicyCreateClient />
    </Suspense>
  )
}