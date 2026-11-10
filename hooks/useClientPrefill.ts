// FILE: hooks/useClientPrefill.ts
// Reads `?clientId=` (set by Client Management → "Use Existing Client")
// and checks it against the REAL backend client list (GET /clients via
// useClients). The id is a genuine backend Client id; it is only applied
// if it exists in that list, so a stale/invalid id never reaches the
// quotation payload.
import { useEffect, useState } from 'react'
import type { Client } from '@/types/client'

export const CLIENT_ID_PARAM = 'clientId'

export type ClientPrefillState =
  | { status: 'none' }
  | { status: 'loading'; clientId: string }
  | { status: 'matched'; clientId: string; name: string }
  | { status: 'unmatched'; clientId: string }

export function useClientPrefill(
  clients: Client[] | undefined,
  onMatch: (clientId: string) => void,
  /** Called when an id was supplied but is not among the loaded clients. */
  onNoMatch?: () => void,
  /** True when the client list request failed (e.g. no `client:read`). */
  listFailed = false,
): ClientPrefillState {
  const [id, setId] = useState<string | null>(null)
  const [state, setState] = useState<ClientPrefillState>({ status: 'none' })

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(CLIENT_ID_PARAM)
    if (v && v.trim()) setId(v.trim())
  }, [])

  useEffect(() => {
    if (!id) return
    if (listFailed) { onNoMatch?.(); setState({ status: 'unmatched', clientId: id }); return }
    if (!clients) { setState({ status: 'loading', clientId: id }); return }
    const hit = clients.find((c) => c.id === id)
    if (hit) { onMatch(hit.id); setState({ status: 'matched', clientId: id, name: hit.name }) }
    else { onNoMatch?.(); setState({ status: 'unmatched', clientId: id }) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, clients, listFailed])

  return state
}
