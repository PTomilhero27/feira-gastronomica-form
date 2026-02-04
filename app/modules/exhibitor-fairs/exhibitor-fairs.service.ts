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
 *
 * Regras do domínio:
 * - Portal NÃO altera financeiro
 * - Ao vincular barraca, ele consome UMA compra (purchaseId) compatível
 * - purchaseId é opcional: se não vier, o backend escolhe automaticamente
 */
export const exhibitorFairsService = {
  async list(): Promise<ListMyFairsResponse> {
    const json = await api.get('exhibitor/fairs')
    return listMyFairsResponseSchema.parse(json)
  },

  /**
   * Vincula uma barraca a uma feira.
   *
   * Se purchaseId for informado, o backend usará exatamente aquela linha de compra.
   * Caso contrário, o backend escolhe a primeira compra disponível compatível.
   */
  async linkStall(
    fairId: string,
    stallId: string,
    purchaseId?: string,
  ): Promise<LinkStallResponse> {
    const qs = purchaseId ? `?purchaseId=${encodeURIComponent(purchaseId)}` : ''
    const json = await api.post(`exhibitor/fairs/${fairId}/stalls/${stallId}${qs}`, {})
    return linkStallResponseSchema.parse(json)
  },

  async unlinkStall(fairId: string, stallId: string): Promise<UnlinkStallResponse> {
    const json = await api.delete(`exhibitor/fairs/${fairId}/stalls/${stallId}`)
    return unlinkStallResponseSchema.parse(json)
  },
}
