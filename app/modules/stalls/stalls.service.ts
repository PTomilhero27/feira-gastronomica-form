import { api } from '../shared/http/api';
import {
  deleteStallResponseSchema,
  DeleteStallResponse,
  listStallsResponseSchema,
  ListStallsResponse,
  upsertStallResponseSchema,
  UpsertStallRequest,
  UpsertStallResponse,
  upsertStallSchema,
} from './stalls.schema'

/**
 * Service do Portal (autenticado) para Barracas.
 *
 * Responsabilidade:
 * - Centralizar chamadas HTTP do /stalls
 * - Validar request/response com Zod
 * - Garantir consistência do contrato com o backend
 */
export const stallsService = {
  async list(params: { page?: number; pageSize?: number }): Promise<ListStallsResponse> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))

    const url = query.toString() ? `stalls?${query}` : 'stalls'
    const json = await api.get(url)
    return listStallsResponseSchema.parse(json)
  },

  /**
   * Recomendado existir no backend:
   * GET /stalls/:stallId
   *
   * Se ainda não existir, a página de edição pode buscar via cache da listagem
   * (mas isso não é ideal por paginação).
   */
  async getById(stallId: string) {
    const json = await api.get(`stalls/${stallId}`)
    // Se seu backend retornar o Stall direto, você pode parsear com stallSchema.
    // Aqui deixei como "any" para não travar caso você ainda não tenha o endpoint.
    return json as any
  },

  async create(input: UpsertStallRequest): Promise<UpsertStallResponse> {
    const body = upsertStallSchema.parse(input)
    const json = await api.post('stalls', body)
    return upsertStallResponseSchema.parse(json)
  },

  async update(stallId: string, input: UpsertStallRequest): Promise<UpsertStallResponse> {
    const body = upsertStallSchema.parse(input)
    const json = await api.patch(`stalls/${stallId}`, body)
    return upsertStallResponseSchema.parse(json)
  },

  async remove(stallId: string): Promise<DeleteStallResponse> {
    const json = await api.delete(`stalls/${stallId}`)
    return deleteStallResponseSchema.parse(json)
  },
}
