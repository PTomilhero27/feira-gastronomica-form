// src/modules/stalls/api/stalls.service.ts
import { api } from '@/modules/shared/http/api'
import { stallsFormContextSchema } from '@/modules/stalls-form-public/api/stalls-form.schemas'
import { onlyDigits } from '@/modules/shared/utils/document'
import {
  CreateStallRequest,
  createStallRequestSchema,
  DeleteStallRequest,
  deleteStallRequestSchema,
  deleteStallResponseSchema,
  DeleteStallResponse,
  Stall,
  listStallsByDocumentResponseSchema,
  StallsFormContext,
  UpdateStallRequest,
  updateStallRequestSchema,
  UpsertStallResponse,
  upsertStallResponseSchema,
  ValidateRequest,
  validateRequestSchema,
  SelectStallForFairRequest,
  selectStallForFairRequestSchema,
  SelectStallForFairResponse,
  selectStallForFairResponseSchema,
  UnlinkStallForFairRequest,
  unlinkStallForFairRequestSchema,
  UnlinkStallForFairResponse,
  unlinkStallForFairResponseSchema,
  
} from './stalls.schema'

/**
 * Service de integração com API (Cadastro de Barracas - público).
 *
 * Responsabilidade:
 * - Centralizar chamadas HTTP do fluxo público
 * - Validar request/response com Zod
 * - Evitar contratos implícitos com o backend
 *
 * Decisão atual do backend:
 * - Criar/editar/excluir Stall NÃO vincula à feira
 * - Vínculo/desvínculo com feira é feito via endpoints separados:
 *   - POST .../select
 *   - POST .../unlink
 */
export const stallsPublicService = {
  /**
   * Valida se o documento está apto a preencher o form de barracas.
   * Retorna o contexto do fluxo (fair, window, owner, compra, ids vinculados).
   */
  async validate(fairId: string, input: ValidateRequest): Promise<StallsFormContext> {
    const body = validateRequestSchema.parse(input)
    const json = await api.post(`public/fairs/${fairId}/forms/stalls/validate`, body)
    return stallsFormContextSchema.parse(json)
  },

  /**
   * Lista TODAS as barracas do Owner pelo documento.
   *
   * Endpoint:
   * GET /public/fairs/{fairId}/forms/stalls/by-document/{document}
   *
   * Observação:
   * - Mesmo que a listagem não dependa da feira, a rota ainda está dentro do grupo /fairs/:fairId
   *   por organização do form público.
   */
  async listOwnerStalls(fairId: string, input: { document: string }): Promise<Stall[]> {
    const document = onlyDigits(input.document ?? '')
    if (!document) return []

    const json = await api.get(`public/fairs/${fairId}/forms/stalls/by-document/${document}`)
    const parsed = listStallsByDocumentResponseSchema.parse(json)
    return parsed.stalls
  },

  /**
   * Cria uma barraca completa (submit final do wizard), SEM vincular à feira.
   *
   * Endpoint:
   * POST /public/fairs/{fairId}/forms/stalls/create
   */
  async create(fairId: string, input: CreateStallRequest): Promise<UpsertStallResponse> {
    const body = createStallRequestSchema.parse(input)
    const json = await api.post(`public/fairs/${fairId}/forms/stalls/create`, body)
    return upsertStallResponseSchema.parse(json)
  },

  /**
   * Edita uma barraca, SEM mexer no vínculo com feira.
   *
   * Endpoint:
   * PATCH /public/fairs/{fairId}/forms/stalls/{stallId}
   */
  async update(
    fairId: string,
    stallId: string,
    input: UpdateStallRequest,
  ): Promise<UpsertStallResponse> {
    const body = updateStallRequestSchema.parse(input)
    const json = await api.patch(`public/fairs/${fairId}/forms/stalls/${stallId}`, body)
    return upsertStallResponseSchema.parse(json)
  },

  /**
   * Exclui uma barraca (hard delete).
   * O backend remove também todos os vínculos StallFair relacionados.
   *
   * Endpoint:
   * DELETE /public/fairs/{fairId}/forms/stalls/{stallId}
   */
  async remove(
    fairId: string,
    stallId: string,
    input: DeleteStallRequest,
  ): Promise<DeleteStallResponse> {
    const body = deleteStallRequestSchema.parse(input)
    const json = await api.delete(`public/fairs/${fairId}/forms/stalls/${stallId}`, body as any)
    return deleteStallResponseSchema.parse(json)
  },

  /**
   * VINCULA uma barraca existente à feira (cria StallFair).
   *
   * Endpoint:
   * POST /public/fairs/{fairId}/forms/stalls/select
   */
  async selectForFair(
    fairId: string,
    input: SelectStallForFairRequest,
  ): Promise<SelectStallForFairResponse> {
    // Normaliza documento no front para reduzir variações (backend também normaliza)
    const body = selectStallForFairRequestSchema.parse({
      ...input,
      document: onlyDigits(input.document ?? ''),
    })

    const json = await api.post(`public/fairs/${fairId}/forms/stalls/select`, body)
    return selectStallForFairResponseSchema.parse(json)
  },

  /**
   * DESVINCULA uma barraca da feira (remove StallFair).
   *
   * Endpoint:
   * POST /public/fairs/{fairId}/forms/stalls/unlink
   */
  async unlinkFromFair(
    fairId: string,
    input: UnlinkStallForFairRequest,
  ): Promise<UnlinkStallForFairResponse> {
    const body = unlinkStallForFairRequestSchema.parse({
      ...input,
      document: onlyDigits(input.document ?? ''),
    })

    const json = await api.post(`public/fairs/${fairId}/forms/stalls/unlink`, body)
    return unlinkStallForFairResponseSchema.parse(json)
  },
}
