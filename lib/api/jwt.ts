export interface JwtPayload {
  id?:        string
  is_admin?:  boolean
  fullname?:  string
  divisions?: string[] | null
  roles?:     string[] | null
  iat?:       number
  exp?:       number
}

/**
 * Decode a JWT's payload segment (middle part between the two dots).
 * Returns null if the token is missing, malformed, or not parseable.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Convert base64url → base64 → add padding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded  = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    )

    // atob is available in all modern browsers and Node 16+
    const json =
      typeof window !== 'undefined'
        ? decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
              .join('')
          )
        : Buffer.from(padded, 'base64').toString('utf-8')

    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Returns true if the JWT's `exp` claim is in the past.
 * Returns false if the token has no `exp` claim (treated as non-expiring).
 * Returns false if the token cannot be decoded (let the server decide).
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}