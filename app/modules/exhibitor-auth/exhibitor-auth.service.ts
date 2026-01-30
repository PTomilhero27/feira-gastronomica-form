/**
 * Service de auth do expositor (portal).
 *
 * Responsabilidade:
 * - Centralizar chamadas ao backend e parsing com Zod
 * - Evitar contratos implícitos (sempre validar resposta)
 *
 * Observação:
 * - validate-token / set-password são públicos (token-based)
 * - login também é público (email+senha)
 */
import { api } from "../shared/http/api"
import {
  ExhibitorLoginPayloadSchema,
  SetPasswordWithTokenPayloadSchema,
  type ExhibitorLoginPayload,
  type ExhibitorLoginResponse,
  type SetPasswordWithTokenPayload,
  type SetPasswordWithTokenResponse,
  type ValidateExhibitorTokenResponse,
} from "./exhibitor-auth.schemas"

/**
 * Valida um token de ativação/reset.
 * Backend:
 * - POST /exhibitor-auth/validate-token
 */
export async function validateExhibitorToken(
  token: string,
): Promise<ValidateExhibitorTokenResponse> {
  return await api.post(
    "exhibitor-auth/validate-token",
    { token },
  )

}

/**
 * Define senha usando token.
 * Backend:
 * - POST /exhibitor-auth/set-password
 */
export async function setPasswordWithToken(
  payload: SetPasswordWithTokenPayload,
): Promise<SetPasswordWithTokenResponse> {
  // Validação defensiva no front antes de enviar
  SetPasswordWithTokenPayloadSchema.parse(payload)

  return await api.post(
    "exhibitor-auth/set-password",
    payload,
  )

}

/**
 * Login do expositor (email + senha).
 * Backend:
 * - POST /exhibitor-auth/login
 */
export async function exhibitorLogin(
  payload: ExhibitorLoginPayload,
): Promise<ExhibitorLoginResponse> {
  const parsed = ExhibitorLoginPayloadSchema.parse(payload)

  return await api.post(
    "exhibitor-auth/login",
    parsed,
  )

}
