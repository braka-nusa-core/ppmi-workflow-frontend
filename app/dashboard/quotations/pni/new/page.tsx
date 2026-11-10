// FILE: app/dashboard/quotations/pni/new/page.tsx
// Legacy P&I creation form — retired. P&I quotations are created on the insurer
// template page (ROUTES.quotations.pniNew); old links and bookmarks land there,
// query string (e.g. ?clientId=) included.
import { redirect } from 'next/navigation'
import { ROUTES } from '@/config/routes'

export default function LegacyPniNewPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === 'string') qs.set(k, v)
    else if (Array.isArray(v)) v.forEach((x) => qs.append(k, x))
  }
  const query = qs.toString()
  redirect(`${ROUTES.quotations.pniNew}${query ? `?${query}` : ''}`)
}
