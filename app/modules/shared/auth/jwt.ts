/**
 * Helpers JWT (sem libs).
 * Responsabilidade:
 * - Decodificar payload
 * - Verificar expiração
 */

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")

    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Retorna true se:
 * - token inválido
 * - não tem exp
 * - ou exp já passou
 */
export function isJwtExpired(token: string): boolean {
  const payload = parseJwtPayload(token)
  const exp = payload?.exp

  if (!exp || typeof exp !== "number") return true

  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec
}
