// FILE: lib/quotation-templates/shared/vesselPrefill.ts
// ═══════════════════════════════════════════════════════════════
// VESSEL AUTO-FILL FROM EXISTING CLIENT
//
// When an existing client is selected, fetch their vessel policies,
// resolve vessel master data, and present candidates for the user
// to select into the quotation editor.
//
// Rules:
//  • Vessel status determines eligibility hints (no silent filtering)
//  • User explicitly selects which vessels to include
//  • Selected vessels append to the form (never replace user entries)
//  • Mapping is template-specific (MSIG vs Eagle field shapes)
// ═══════════════════════════════════════════════════════════════

import type { DirectoryVessel, DirectoryPolicy, VesselPolicyStatus } from '@/types/clientDirectory'

/** Status meanings confirmed from backend enum values. */
export const STATUS_LABELS: Record<VesselPolicyStatus, string> = {
  ON: 'Active',
  NEW_VESSEL: 'New',
  OFF: 'Off risk',
  CANCEL: 'Cancelled',
  SELL: 'Sold',
}

/** Statuses that typically indicate current/active insurance (business rule: prefer these). */
export const ACTIVE_STATUSES: VesselPolicyStatus[] = ['ON', 'NEW_VESSEL']

/** Candidate vessel with policy context for selection UI. */
export interface VesselCandidate {
  vessel: DirectoryVessel
  policy: DirectoryPolicy
  /** Derived from policy.status — UI hint, not a hard filter. */
  statusLabel: string
  /** True if status is ON or NEW_VESSEL. */
  isLikelyActive: boolean
}

/** Map DirectoryVessel → MSIG editor vessel fields. */
export function mapToMsigVessel(v: DirectoryVessel, policy: DirectoryPolicy): Record<string, string> {
  return {
    id: v.id,
    name: v.name ?? policy.vesselName ?? '',
    type: v.vesselType ?? '',
    imoNumber: '', // DirectoryVessel has no IMO; user types if known
    vesselClass: v.vesselClass ?? '',
    classNotApplicable: 'false',
    grossTonnage: v.grossTonnage?.toString() ?? '',
    builtYear: v.builtYear?.toString() ?? '',
    flag: '', // DirectoryVessel has no flag; user types if known
    portOfRegistry: '', // DirectoryVessel has no port; user types if known
  }
}

/** Map DirectoryVessel → Eagle editor vessel fields. */
export function mapToEagleVessel(v: DirectoryVessel, policy: DirectoryPolicy): Record<string, string> {
  return {
    id: v.id,
    vesselId: v.id,
    name: v.name ?? policy.vesselName ?? '',
    imoNumber: '', // DirectoryVessel has no IMO
    grossTonnage: v.grossTonnage?.toString() ?? '',
    builtYear: v.builtYear?.toString() ?? '',
    vesselType: v.vesselType ?? '',
    flag: '', // DirectoryVessel has no flag
    vesselClass: v.vesselClass ?? '',
    annualPremium: '',
    limit: '',
  }
}

/** Build candidates from policy list + vessel details. */
export function buildVesselCandidates(
  policies: DirectoryPolicy[],
  vesselDetails: Map<string, DirectoryVessel>,
): VesselCandidate[] {
  return policies
    .filter((p) => p.vesselId) // only policies with vessel linkage
    .map((p) => {
      const vessel = vesselDetails.get(p.vesselId)
      if (!vessel) return null
      const status = p.status
      return {
        vessel,
        policy: p,
        statusLabel: status ? STATUS_LABELS[status] : 'Unknown',
        isLikelyActive: status ? ACTIVE_STATUSES.includes(status) : false,
      }
    })
    .filter((c): c is VesselCandidate => c !== null)
}

/** Dedupe by vessel ID (same vessel may have multiple policies). */
export function dedupeCandidates(candidates: VesselCandidate[]): VesselCandidate[] {
  const seen = new Set<string>()
  const out: VesselCandidate[] = []
  for (const c of candidates) {
    if (!seen.has(c.vessel.id)) {
      seen.add(c.vessel.id)
      out.push(c)
    }
  }
  return out
}
