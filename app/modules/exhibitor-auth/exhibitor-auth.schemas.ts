/**
 * Schemas/contratos do módulo de autenticação do expositor.
 *
 * Responsabilidade:
 * - Validar payloads e respostas do backend.
 * - Evitar "contratos implícitos" no portal.
 */
import { z } from "zod"

/**
 * Backend deve dizer qual tipo de fluxo o token representa.
 * - ACTIVATE_ACCOUNT: primeiro acesso (criar senha)
 * - RESET_PASSWORD: recuperação de senha
 */
export const PasswordTokenTypeSchema = z.enum(["ACTIVATE_ACCOUNT", "RESET_PASSWORD"])
export type PasswordTokenType = z.infer<typeof PasswordTokenTypeSchema>

/**
 * Motivo de falha na validação do token.
 * Motivo: permitir UX melhor (diferenciar inválido vs expirado vs usado).
 */
export const ValidateTokenFailureReasonSchema = z.enum(["INVALID", "EXPIRED", "USED"])
export type ValidateTokenFailureReason = z.infer<typeof ValidateTokenFailureReasonSchema>

/**
 * Resposta da validação do token.
 *
 * Decisão:
 * - O backend retorna sempre 200 com ok=true/false.
 * - Quando ok=false, reason indica o motivo (sem depender de HTTP codes).
 * - Quando ok=true, retornamos contexto mínimo necessário (sem vazar dados sensíveis).
 */
export const ValidateExhibitorTokenResponseSchema = z.object({
  ok: z.boolean(),

  // Quando ok=false
  reason: ValidateTokenFailureReasonSchema.optional(),

  // Quando ok=true
  tokenType: PasswordTokenTypeSchema.optional(),
  ownerId: z.string().optional(),
  expiresAt: z.string().optional(), // ISO

  email: z.string().email().nullable().optional(),
  displayName: z.string().nullable().optional(),
})

export type ValidateExhibitorTokenResponse = z.infer<
  typeof ValidateExhibitorTokenResponseSchema
>

/**
 * Payload para definir/redefinir senha usando token.
 */
export const SetPasswordWithTokenPayloadSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
})

export type SetPasswordWithTokenPayload = z.infer<typeof SetPasswordWithTokenPayloadSchema>

/**
 * Resposta ao definir senha.
 * MVP: apenas confirmação. No futuro pode retornar JWT.
 */
export const SetPasswordWithTokenResponseSchema = z.object({
  success: z.boolean(),
})

export type SetPasswordWithTokenResponse = z.infer<typeof SetPasswordWithTokenResponseSchema>

/**
 * Helpers de UX (1 lugar para a regra).
 * Motivo: manter mensagens consistentes no portal.
 */
export function tokenFailureMessage(reason?: ValidateTokenFailureReason) {
  switch (reason) {
    case "EXPIRED":
      return "Este link expirou. Solicite um novo link"
    case "USED":
      return "Este link já foi utilizado. Solicite um novo link"
    case "INVALID":
    default:
      return "Não foi possível validar o link. Verifique se o link está correto."
  }
}

/**
 * Helper de type narrowing para facilitar no front.
 */
export function isTokenValid(
  data: ValidateExhibitorTokenResponse,
): data is ValidateExhibitorTokenResponse & {
  ok: true
  ownerId: string
  tokenType: PasswordTokenType
  expiresAt: string
} {
  return Boolean(data.ok && data.ownerId && data.tokenType && data.expiresAt)
}


/**
 * -------------------------
 * ✅ LOGIN DO EXPOSITOR
 * -------------------------
 */

export const ExhibitorLoginPayloadSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
})
export type ExhibitorLoginPayload = z.infer<typeof ExhibitorLoginPayloadSchema>

export const ExhibitorOwnerSchema = z.object({
  id: z.string(),
  personType: z.enum(["PF", "PJ"]),
  document: z.string(),
  fullName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
})
export type ExhibitorOwner = z.infer<typeof ExhibitorOwnerSchema>

/**
 * Resposta do login do expositor.
 *
 * Decisão:
 * - Retornamos accessToken (JWT) + owner mínimo para UX.
 * - Evita depender de /me logo no primeiro render.
 */
export const ExhibitorLoginResponseSchema = z.object({
  accessToken: z.string().min(10),
  owner: ExhibitorOwnerSchema,
})
export type ExhibitorLoginResponse = z.infer<typeof ExhibitorLoginResponseSchema>