// FILE: lib/clientDirectory/statuses.ts
// Runtime values for VesselPolicy.status. Kept out of `types/` on purpose:
// a types module is erased by the compiler and not typechecked by `next dev`,
// so a runtime export living there can silently resolve to `undefined`
// (this is what crashed the Client Detail page).
//
// Source of truth: backend prisma `enum VesselPolicyStatus` and
// vessel-policies.validation.ts `statusSchema` — exactly these five values.
export const VESSEL_POLICY_STATUSES = ['ON', 'NEW_VESSEL', 'OFF', 'CANCEL', 'SELL'] as const

export type VesselPolicyStatus = (typeof VESSEL_POLICY_STATUSES)[number]
