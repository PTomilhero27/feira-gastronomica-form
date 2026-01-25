// src/modules/interests/interests.service.ts
import { api } from "@/modules/shared/http/api"
import {
  ownerLookupResponseSchema,
  type OwnerLookupResponse,
  type OwnerUpsertRequest,
} from "./interests.schemas"

/**
 * Service do módulo de Interessados.
 *
 * Responsabilidade:
 * - Centralizar chamadas api do Form 1 (lookup/upsert).
 * - Validar response com Zod para evitar contratos implícitos.
 *
 * Observação:
 * - Nosso wrapper `api` já retorna o JSON (não é AxiosResponse),
 *   então NÃO usamos `.data` aqui.
 */

export async function lookupInterest(input: { document: string }): Promise<OwnerLookupResponse> {
  const json = await api.post("/public/interests/lookup", input)
  return ownerLookupResponseSchema.parse(json)
}

export async function upsertInterest(payload: OwnerUpsertRequest): Promise<void> {
  await api.post("/public/interests/upsert", payload)
}
