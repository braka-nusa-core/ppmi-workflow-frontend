// FILE: types/clientDirectory.ts
// Client Management directory types — mirror the backend as it exists:
//   GET /clients, GET /clients/:id          → Client (types/client.ts)
//   GET /vessel-policies?clientId=…         → VesselPolicy (+ vessel {id,name})
//   GET /vessels/:id                        → Vessel
// Nothing here is derived from the Excel; fields the backend does not
// store (e.g. source month / record number) are intentionally absent.
export type { Client as DirectoryClient } from '@/types/client'

import type { VesselPolicyStatus } from '@/lib/clientDirectory/statuses'

/** Backend enum `VesselPolicyStatus` — values live in lib/clientDirectory/statuses.ts. */
export type { VesselPolicyStatus }

export interface DirectoryVessel {
  id:           string
  name:         string
  vesselType:   string | null
  builtYear:    number | null
  grossTonnage: number | null   // backend Decimal (string on the wire) → number
  vesselClass:  string | null
}

/** One policy row. `*Raw` fields hold the original spreadsheet text. */
export interface DirectoryPolicy {
  id:              string
  vesselId:        string
  clientId:        string
  vesselName:      string | null   // policy.vessel.name
  policyNumber:    string | null   // normalized by backend
  policyNumberRaw: string | null
  insuredRaw:      string | null
  periodRaw:       string | null
  periodStart:     string | null
  periodEnd:       string | null
  clubCode:        string | null
  clubRaw:         string | null
  status:          VesselPolicyStatus | null
  statusRaw:       string | null
}

export interface DirectoryPolicyPage {
  items: DirectoryPolicy[]
  total: number
  page:  number
  limit: number
}

export interface DirectoryPolicyQuery {
  clientId: string
  page:     number
  limit:    number
  status?:  VesselPolicyStatus
}

export interface ClientDirectoryQuery {
  page:     number
  pageSize: number
  search?:  string
  sortBy?:  'name' | 'clientCode' | 'createdAt'
  sortDir?: 'asc' | 'desc'
}
