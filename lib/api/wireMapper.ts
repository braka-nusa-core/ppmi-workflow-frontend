// Shared helper — the backend's global TransformIdInterceptor renames
// every `id` key to `_id` on the wire. This maps it back to `id`
// recursively so API modules can expose clean, consistent domain
// types. Used by lib/api/quotations.ts, clients.ts, insuranceTypes.ts.
export function fromWire<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((v) => fromWire(v)) as unknown as T
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key === '_id' ? 'id' : key] = fromWire(val)
    }
    return out as T
  }
  return value as T
}