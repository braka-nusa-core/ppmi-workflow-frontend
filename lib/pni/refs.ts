// FILE: lib/pni/refs.ts

// Small helpers for the P&I key/ref pattern (see types/pni.ts's
// IdOrKey doc comment, and pni.service.ts's resolveVesselRef/
// resolveBlockRef). A row that already has a persisted `id` is
// referenced by that `id`; a row the user just added in this session
// has no `id` yet, so it's referenced by a client-generated `key`
// instead — the backend resolves whichever is present.

/** Client-only temporary identifier for an unsaved vessel/insuranceBlock row. Never sent as `id`, only ever as `key` / `*Ref`. */
export function createPniKey(): string {
  return `tmp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/** The ref a vessel/block row should be addressed by elsewhere in the same payload: its real `id` if persisted, otherwise its client-side `key`. */
export function refOf(row: { id?: string; key?: string }): string {
  return row.id ?? row.key ?? ''
}