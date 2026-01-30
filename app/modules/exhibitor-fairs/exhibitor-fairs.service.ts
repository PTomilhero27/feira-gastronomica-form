import { api } from '../shared/http/api'
import {
  linkStallResponseSchema,
  LinkStallResponse,
  listMyFairsResponseSchema,
  ListMyFairsResponse,
  unlinkStallResponseSchema,
  UnlinkStallResponse,
} from './exhibitor-fairs.schema'

/**
 * Service do Portal (autenticado) para Feiras do Expositor.
 *
 * Responsabilidade:
 * - Centralizar chamadas HTTP do /exhibitor/fairs
 * - Validar request/response com Zod
 * - Garantir consistência do contrato com o backend
 */
export const exhibitorFairsService = {
  async list(): Promise<ListMyFairsResponse> {
    const json = await api.get('exhibitor/fairs')
    return listMyFairsResponseSchema.parse(json)
  },

  async linkStall(fairId: string, stallId: string): Promise<LinkStallResponse> {
    const json = await api.post(`exhibitor/fairs/${fairId}/stalls/${stallId}`, {})
    return linkStallResponseSchema.parse(json)
  },

  async unlinkStall(fairId: string, stallId: string): Promise<UnlinkStallResponse> {
    const json = await api.delete(`exhibitor/fairs/${fairId}/stalls/${stallId}`)
    return unlinkStallResponseSchema.parse(json)
  },
}
