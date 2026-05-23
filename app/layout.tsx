import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/context/Providers'

export const metadata: Metadata = {
  title: {
    template: '%s | PPMI Flow',
    default: 'PPMI Flow — PT Pandi Proteksi Marine Indonesia',
  },
  description: 'Internal operational management system for PT Pandi Proteksi Marine Indonesia.',
  robots: { index: false, follow: false }, // Internal system — no indexing
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
