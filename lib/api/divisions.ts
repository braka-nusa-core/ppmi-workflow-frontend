/**
 * lib/api/divisions.ts
 *
 * Minimal divisions API — used to resolve division UUIDs required by
 * POST /qs and PATCH /qs/:id (when changing division).
 *
 * Backend endpoint: GET /divisions
 * Returns: { success, status_code, data: BackendDivision[] }
 *
 * Division UUIDs are stable seeded values — they change only on DB reset.
 * Results are cached aggressively (STALE_TIME_LONG) to avoid redundant calls.
 */

import { get } from '@/lib/api/client'
import type { Division } from '@/types/workflow'

interface BackendDivision {
  id:         string
  name:       string    // e.g. "P&I", "H&M"
  created_at: string
  updated_at: string
}

interface DivisionsEnvelope {
  success:     boolean
  status_code: number
  data:        BackendDivision[]
}

// ─── Fetch all divisions ─────────────────────────────────────────
export async function fetchDivisions(): Promise<BackendDivision[]> {
  const envelope = await get<DivisionsEnvelope>('/divisions')
  return envelope.data
}

// ─── Resolve division UUID ────────────────────────────────────────
/**
 * Given a frontend Division code ('PI' | 'HM'), returns the backend UUID.
 * Throws if no matching division is found.
 *
 * Usage in forms:
 *   const divisionId = await resolveDivisionId('PI')
 *   await createQS(payload, divisionId)
 */
export async function resolveDivisionId(division: Division): Promise<string> {
  const divisionName = division === 'PI' ? 'P&I' : 'H&M'
  const divisions = await fetchDivisions()
  const match = divisions.find(
    (d) => d.name.toUpperCase().trim() === divisionName.toUpperCase()
  )
  if (!match) {
    throw new Error(`Division "${divisionName}" not found. Available: ${divisions.map((d) => d.name).join(', ')}`)
  }
  return match.id
}