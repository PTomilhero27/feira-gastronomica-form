import { api } from '@/modules/shared/http/api'
import {
  campaignSchema,
  lookupRequestSchema,
  lookupResponseSchema,
  type Campaign,
  type LookupResponse,
} from './forms.schemas'

/**
 * Service de integração com API (Forms).
 * Responsabilidade:
 * - Centralizar chamadas HTTP (ky)
 * - Validar respostas com Zod (contrato explícito)
 *
 * Rotas esperadas no backend (públicas):
 * - GET  /public/form-campaigns/:campaignId
 * - POST /public/form-campaigns/:campaignId/lookup
 */
export const formsService = {
  async getCampaign(campaignId: string): Promise<Campaign> {
    const json = await api.get(`public/form-campaigns/${campaignId}`)
    return campaignSchema.parse(json)
  },

  async lookup(campaignId: string, input: { document: string }): Promise<LookupResponse> {
    const body = lookupRequestSchema.parse(input)

    const json = await api
      .post(`public/form-campaigns/${campaignId}/lookup`, { json: body })

    return lookupResponseSchema.parse(json)
  },
}
