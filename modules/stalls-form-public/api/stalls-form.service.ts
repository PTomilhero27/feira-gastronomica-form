// src/modules/stalls-form-public/api/stalls-form.service.ts
import { api } from '@/modules/shared/http/api'
import { ValidateRequest, validateRequestSchema } from '@/modules/stalls/api/stalls.schema'
import { StallsFormContext, stallsFormContextSchema } from './stalls-form.schemas'


/**
 * Service de integração com API (Cadastro de Barracas - público).
 * Responsabilidade:
 * - Centralizar chamadas HTTP (ky)
 * - Validar request/response com Zod (contrato explícito)
 *
 * Rotas esperadas no backend (públicas):
 * - POST /public/fairs/:fairId/forms/stalls/validate
 */

export const stallsFormPublicService = {
  async validate(fairId: string, input: ValidateRequest): Promise<StallsFormContext> {
    // Garante que o request enviado está no formato esperado
    const body = validateRequestSchema.parse(input)

    const json = await api
      .post(`public/fairs/${fairId}/forms/stalls/validate`,  body )

    // Garante que o response recebido segue o contrato
    return stallsFormContextSchema.parse(json)
  },
}
