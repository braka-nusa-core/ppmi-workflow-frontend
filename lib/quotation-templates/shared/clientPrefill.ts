// FILE: lib/quotation-templates/shared/clientPrefill.ts
// ═══════════════════════════════════════════════════════════════
// EXISTING-CLIENT AUTO-FILL (pure planning logic)
//
// Selecting an existing client copies that client's REAL data (GET /clients)
// into the template fields that have a counterpart on the insurer's paper.
// Rules:
//  • nothing is invented: a client field that is null/empty yields '' — never a placeholder;
//  • a field the user has typed into is never overwritten (changing the client
//    later only replaces values that are still empty or still exactly what the
//    previous client auto-filled);
//  • the result is only a plan — the caller applies it with setValue, so the
//    live preview and the dirty state update through the normal form flow.
// ═══════════════════════════════════════════════════════════════

/** Which template form fields receive which client data. Only fields the paper actually has. */
export interface ClientFieldMap {
  /** Client name → the paper's Assured / Applicant field. */
  name:     { field: string; label: string }
  /** Client address → the paper's address field (Eagle only; MSIG prints none). */
  address?: { field: string; label: string }
}

/** The client data the prefill needs (a subset of types/client.ts Client). */
export interface PrefillClientData { name: string; address: string | null }

export interface ClientPrefillPlan {
  /** form field → value to set */
  set:         Record<string, string>
  /** form fields left alone because the user already typed something different */
  kept:        string[]
  /** form field → value this prefill is responsible for (feed back into the next call) */
  autofilled:  Record<string, string>
}

/** Client data → { form field: value } for one template. Missing client data becomes ''. */
export function clientToFields(map: ClientFieldMap, client: PrefillClientData): Record<string, string> {
  const out: Record<string, string> = { [map.name.field]: (client.name ?? '').trim() }
  if (map.address) out[map.address.field] = (client.address ?? '').trim()
  return out
}

export function planClientPrefill(args: {
  /** current form values of the target fields */
  current:    Record<string, string>
  /** what the newly selected client would put there */
  next:       Record<string, string>
  /** what the previous prefill put there (empty for the first one) */
  autofilled: Record<string, string>
}): ClientPrefillPlan {
  const set: Record<string, string> = {}
  const kept: string[] = []
  const autofilled: Record<string, string> = { ...args.autofilled }

  for (const [field, value] of Object.entries(args.next)) {
    const cur = (args.current[field] ?? '').trim()
    const prev = args.autofilled[field]
    const untouched = cur === '' || (prev !== undefined && cur === prev.trim())
    if (untouched) {
      if (cur !== value) set[field] = value
      autofilled[field] = value
    } else if (cur !== value) {
      kept.push(field)
      delete autofilled[field]
    } else {
      autofilled[field] = value // the user already typed exactly what the client has
    }
  }
  return { set, kept, autofilled }
}
