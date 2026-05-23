import type { Metadata } from 'next'
import { QSCreateClient } from '@/components/qs/QSCreateClient'

export const metadata: Metadata = { title: 'New Quotation Sheet | PPMI Flow' }

export default function NewQSPage() {
  return <QSCreateClient />
}
