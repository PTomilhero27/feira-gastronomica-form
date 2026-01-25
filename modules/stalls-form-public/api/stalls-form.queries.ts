// src/modules/stalls-form-public/api/stalls-form.queries.ts
import { useMutation } from '@tanstack/react-query'
import { stallsFormPublicService } from './stalls-form.service'
import { ValidateRequest } from '@/modules/stalls/api/stalls.schema'

/**
 * Queries do módulo público de Barraca.
 * Responsabilidade:
 * - Centralizar hooks do TanStack Query
 * - Padronizar keys e acesso aos services
 */

export function useStallsValidateMutation(fairId: string) {
  return useMutation({
    mutationFn: (input: ValidateRequest) => stallsFormPublicService.validate(fairId, input),
  })
}
