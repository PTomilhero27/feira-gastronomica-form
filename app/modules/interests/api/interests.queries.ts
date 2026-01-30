// src/modules/interests/interests.queries.ts
import { useMutation } from "@tanstack/react-query"
import { lookupInterest, upsertInterest } from "./interests.service"
import type { OwnerUpsertRequest } from "./interests.schemas"

/**
 * Mutations (e não useQuery) porque:
 * - lookup/upsert são ações de fluxo do wizard
 * - queremos controle explícito de loading/erro sem cache automático
 *
 * Decisão:
 * - Mantemos o padrão do módulo de barracas: useMutation com mutationKey + inferência pelo service tipado.
 */

export function useLookupOwnerByDocumentMutation() {
  return useMutation({
    mutationKey: ["public-interests-lookup"],
    mutationFn: (input: { document: string }) => lookupInterest(input),
  })
}

export function useUpsertOwnerMutation() {
  return useMutation({
    mutationKey: ["public-interests-upsert"],
    mutationFn: (input: OwnerUpsertRequest) => upsertInterest(input),
  })
}
