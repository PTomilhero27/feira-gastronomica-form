import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketplaceService } from './marketplace.service'
import type { ExpressInterestRequest } from './marketplace.schemas'

/**
 * Queries e Mutations do módulo Marketplace (Feiras Futuras).
 *
 * Responsabilidade:
 * - Centralizar query keys e hooks do TanStack Query
 * - Garantir invalidation consistente entre operações
 *
 * Padrão:
 * - Mesmo padrão do exhibitor-fairs.queries.ts e stalls.queries.ts
 * - Keys hierárquicas para invalidation granular
 */

// ──────────────────────────────────────────────
// Query Keys
// ──────────────────────────────────────────────

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  futureFairs: () => ['marketplace', 'future-fairs'] as const,
  futureFairDetail: (fairId: string) => ['marketplace', 'future-fair', fairId] as const,
  fairMap: (fairId: string) => ['marketplace', 'fair-map', fairId] as const,
}

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/**
 * Lista de feiras futuras disponíveis para o expositor.
 * Usado na página de listagem /feiras/futuras.
 */
export function useFutureFairsQuery() {
  return useQuery({
    queryKey: marketplaceKeys.futureFairs(),
    queryFn: () => marketplaceService.listFutureFairs(),
    staleTime: 60_000, // 1 minuto (dados mudam pouco)
  })
}

/**
 * Detalhes de uma feira futura específica.
 * Usado na página /feiras/futuras/[fairId].
 */
export function useFutureFairDetailQuery(fairId: string) {
  return useQuery({
    queryKey: marketplaceKeys.futureFairDetail(fairId),
    queryFn: () => marketplaceService.getFutureFairById(fairId),
    enabled: Boolean(fairId),
    staleTime: 60_000,
  })
}

/**
 * Mapa da feira com slots e elementos.
 * Usado na página /feiras/futuras/[fairId]/mapa.
 */
export function useFairMapQuery(fairId: string) {
  return useQuery({
    queryKey: marketplaceKeys.fairMap(fairId),
    queryFn: () => marketplaceService.getFairMap(fairId),
    enabled: Boolean(fairId),
    staleTime: 30_000,
  })
}

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/**
 * Demonstra interesse do expositor em um slot da feira.
 *
 * Após sucesso, invalida o mapa (status do slot pode mudar)
 * e a listagem (contagem de slots pode mudar).
 */
export function useExpressInterestMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['marketplace', 'express-interest'],
    mutationFn: (vars: { fairId: string; payload: ExpressInterestRequest }) =>
      marketplaceService.expressInterest(vars.fairId, vars.payload),
    onSuccess: async (_data, vars) => {
      // ✅ Invalida mapa (status do slot pode ter mudado)
      await qc.invalidateQueries({ queryKey: marketplaceKeys.fairMap(vars.fairId) })
      // ✅ Invalida listagem (contagem de disponíveis pode ter mudado)
      await qc.invalidateQueries({ queryKey: marketplaceKeys.futureFairs() })
    },
  })
}
