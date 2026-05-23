import type { Metadata } from 'next'
import LoginPage from './LoginPage'

export const metadata: Metadata = {
  title: 'Sign In | PPMI Flow',
  description: 'Sign in to PPMI Flow — Operational Management System',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginPage />
}
