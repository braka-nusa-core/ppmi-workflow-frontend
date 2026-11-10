// FILE: lib/api/clientDirectory.ts
// Client Management API — thin wrappers over the existing axios client.
// Endpoints (verified against the backend source):
//   GET /clients            (client:read)         — via fetchClients()
//   GET /clients/:id        (client:read)
//   GET /vessel-policies    (vessel-policy:read)  — clientId,status,page,limit(≤200)
//   GET /vessels/:id        (vessel:read)
import { get } from './client'
import { fromWire } from './wireMapper'
import type { Client } from '@/types/client'
import type {
  DirectoryPolicy, DirectoryPolicyPage, DirectoryPolicyQuery, DirectoryVessel, VesselPolicyStatus,
} from '@/types/clientDirectory'

interface Envelope<T> { success: boolean; data: T }

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)
// Prisma Decimal serializes as a string; keep null as null, never default to 0.
const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function fetchDirectoryClient(id: string): Promise<Client> {
  const res = await get<Envelope<unknown>>(`/clients/${encodeURIComponent(id)}`)
  return fromWire<Client>(res.data)
}

function mapPolicy(w: Record<string, unknown>): DirectoryPolicy {
  const vessel = (w.vessel ?? null) as Record<string, unknown> | null
  return {
    id:              String(w.id),
    vesselId:        String(w.vesselId),
    clientId:        String(w.clientId),
    vesselName:      vessel ? str(vessel.name) : null,
    policyNumber:    str(w.policyNumber),
    policyNumberRaw: str(w.policyNumberRaw),
    insuredRaw:      str(w.insuredRaw),
    periodRaw:       str(w.periodRaw),
    periodStart:     str(w.periodStart),
    periodEnd:       str(w.periodEnd),
    clubCode:        str(w.clubCode),
    clubRaw:         str(w.clubRaw),
    status:          (str(w.status) as VesselPolicyStatus | null),
    statusRaw:       str(w.statusRaw),
  }
}

export async function fetchVesselPolicies(q: DirectoryPolicyQuery): Promise<DirectoryPolicyPage> {
  const res = await get<Envelope<{ items: unknown[]; total: number; page: number; limit: number }>>(
    '/vessel-policies',
    { params: { clientId: q.clientId, page: q.page, limit: q.limit, ...(q.status ? { status: q.status } : {}) } },
  )
  const d = fromWire<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }>(res.data)
  return { items: d.items.map(mapPolicy), total: d.total, page: d.page, limit: d.limit }
}

export async function fetchVessel(id: string): Promise<DirectoryVessel> {
  const res = await get<Envelope<unknown>>(`/vessels/${encodeURIComponent(id)}`)
  const w = fromWire<Record<string, unknown>>(res.data)
  return {
    id:           String(w.id),
    name:         String(w.name),
    vesselType:   str(w.vesselType),
    builtYear:    num(w.builtYear),
    grossTonnage: num(w.grossTonnage),
    vesselClass:  str(w.vesselClass),
  }
}
