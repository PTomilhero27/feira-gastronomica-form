import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exhibitorFairsService } from './exhibitor-fairs.service'

/**
 * Queries do módulo Feiras do Expositor (Portal).
 *
 * Responsabilidade:
 * - Centralizar keys e hooks
 * - Invalidation consistente
 *
 * Observação:
 * - A tela de feiras depende de dados de barracas e vínculos.
 * - Por isso, após link/unlink, invalidamos também o cache de barracas.
 */
export const exhibitorFairsKeys = {
  all: ['exhibitor-fairs'] as const,
  list: () => ['exhibitor-fairs', 'list'] as const,
}

export function useMyFairsQuery() {
  return useQuery({
    queryKey: exhibitorFairsKeys.list(),
    queryFn: () => exhibitorFairsService.list(),
    staleTime: 30_000,
  })
}

export function useLinkStallToFairMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['exhibitor-fairs', 'link-stall'],
    mutationFn: (vars: { fairId: string; stallId: string }) =>
      exhibitorFairsService.linkStall(vars.fairId, vars.stallId),
    onSuccess: async () => {
      // ✅ Atualiza a lista de feiras (inclui payment/vínculos)
      await qc.invalidateQueries({ queryKey: exhibitorFairsKeys.all })

      // ✅ E também barracas (caso a UI reflita o vínculo em outra tela)
      await qc.invalidateQueries({ queryKey: ['stalls'] })
    },
  })
}

export function useUnlinkStallFromFairMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['exhibitor-fairs', 'unlink-stall'],
    mutationFn: (vars: { fairId: string; stallId: string }) =>
      exhibitorFairsService.unlinkStall(vars.fairId, vars.stallId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: exhibitorFairsKeys.all })
      await qc.invalidateQueries({ queryKey: ['stalls'] })
    },
  })
}
