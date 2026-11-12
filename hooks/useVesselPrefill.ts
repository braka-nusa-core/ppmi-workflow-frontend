// FILE: hooks/useVesselPrefill.ts
// ═══════════════════════════════════════════════════════════════
// Vessel auto-fill for P&I template editors (MSIG/Eagle).
//
// Selecting an existing client triggers:
//   1. Fetch vessel policies via useClientPolicies
//   2. Fetch vessel details via useVesselDetails
//   3. Present candidates via buildVesselCandidates
//   4. User selects → append to vessels array
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useClientPolicies, useVesselDetails } from '@/hooks/useClientDirectory'
import type { DirectoryVessel } from '@/types/clientDirectory'
import { buildVesselCandidates, dedupeCandidates, type VesselCandidate } from '@/lib/quotation-templates/shared/vesselPrefill'

export type { VesselCandidate }

/**
 * Hook to orchestrate vessel policy + vessel detail queries and prepare candidates.
 * Call when client selection changes.
 */
export function useVesselPrefill(clientId: string | undefined) {
  const policiesQ = useClientPolicies(
    { clientId: clientId ?? '', page: 1, limit: 200 },
    Boolean(clientId),
  )

  const vesselIds = useMemo(
    () => policiesQ.data?.items.map((p) => p.vesselId).filter((id): id is string => Boolean(id)) ?? [],
    [policiesQ.data],
  )
  const vesselQs = useVesselDetails(vesselIds, policiesQ.isSuccess)

  const loading = policiesQ.isLoading || vesselQs.some((q) => q.isLoading)
  const error = policiesQ.isError ? 'Vessel policies could not be loaded.' : vesselQs.some((q) => q.isError) ? 'Vessel details could not be loaded.' : null

  const vesselDetails = useMemo(() => {
    const map = new Map<string, DirectoryVessel>()
    vesselQs.forEach((q) => {
      if (q.data) map.set(q.data.id, q.data)
    })
    return map
  }, [vesselQs])

  const candidates = useMemo(() => {
    if (!policiesQ.data) return []
    const raw = buildVesselCandidates(policiesQ.data.items, vesselDetails)
    return dedupeCandidates(raw)
  }, [policiesQ.data, vesselDetails])

  return {
    loading,
    policiesLoading: policiesQ.isLoading,
    vesselsLoading: vesselQs.some((q) => q.isLoading),
    candidates,
    error,
  }
}
