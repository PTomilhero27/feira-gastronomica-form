/**
 * Queries do TanStack para autenticação do expositor.
 *
 * Responsabilidade:
 * - Padronizar cache keys
 * - Facilitar reuso no futuro (ex.: "esqueci a senha", refresh, etc)
 */
import { useMutation, useQuery } from "@tanstack/react-query"

import {
  exhibitorLogin,
  setPasswordWithToken,
  validateExhibitorToken,
} from "./exhibitor-auth.service"

import type {
  ExhibitorLoginPayload,
  SetPasswordWithTokenPayload,
} from "./exhibitor-auth.schemas"

export const exhibitorAuthKeys = {
  all: ["exhibitor-auth"] as const,

  validateToken: (token: string) =>
    ["exhibitor-auth", "validate-token", token] as const,

  login: () => ["exhibitor-auth", "login"] as const,
}

/**
 * Validação do token (ativação/reset)
 */
export function useValidateExhibitorTokenQuery(token: string) {
  return useQuery({
    queryKey: exhibitorAuthKeys.validateToken(token),
    queryFn: () => validateExhibitorToken(token),
    enabled: Boolean(token),
    retry: false,
  })
}

/**
 * Definir senha com token
 */
export function useSetPasswordWithTokenMutation() {
  return useMutation({
    mutationFn: (payload: SetPasswordWithTokenPayload) => setPasswordWithToken(payload),
  })
}

/**
 * Login (email + senha)
 */
export function useExhibitorLoginMutation() {
  return useMutation({
    mutationKey: exhibitorAuthKeys.login(),
    mutationFn: (payload: ExhibitorLoginPayload) => exhibitorLogin(payload),
  })
}
