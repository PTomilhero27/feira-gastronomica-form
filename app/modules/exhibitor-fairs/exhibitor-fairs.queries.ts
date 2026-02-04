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
 * - A tela de feiras depende de:
 *   - compras (purchases)
 *   - vínculos (linkedStalls)
 *   - contrato (contract)
 * - Após link/unlink, invalidamos também o cache de barracas,
 *   pois outras telas podem refletir o status de vínculo.
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

/**
 * Vincula uma barraca a uma feira consumindo (opcionalmente) uma compra específica.
 *
 * Se purchaseId não for enviado, o backend escolhe automaticamente a primeira
 * compra disponível compatível com o tamanho da barraca.
 */
export function useLinkStallToFairMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['exhibitor-fairs', 'link-stall'],
    mutationFn: (vars: { fairId: string; stallId: string; purchaseId?: string | null }) =>
      exhibitorFairsService.linkStall(vars.fairId, vars.stallId, vars.purchaseId ?? undefined),
    onSuccess: async () => {
      // ✅ Atualiza lista de feiras (inclui contrato, compras, vínculos e resumo de pagamento)
      await qc.invalidateQueries({ queryKey: exhibitorFairsKeys.all })

      // ✅ Atualiza barracas (caso existam badges/estado de vínculo em outra tela)
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
