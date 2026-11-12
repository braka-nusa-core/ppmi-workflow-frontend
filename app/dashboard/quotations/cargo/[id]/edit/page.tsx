// FILE: app/dashboard/quotations/cargo/[id]/edit/page.tsx
// Cargo edit quotation entry — edit saved quotation.

import { ROUTES } from '@/config/routes'
import { redirect } from 'next/navigation'

export default function CargoEditPage() {
  // ponytail: Phase 2B implements backend repository to fetch quotation and validate edit access
  // For now, redirect to new page — real edit requires backend integration
  redirect(ROUTES.quotations.cargoNew)
}
