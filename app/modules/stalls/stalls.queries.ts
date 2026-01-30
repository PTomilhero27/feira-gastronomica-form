import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stallsService } from './stalls.service'
import { UpsertStallRequest } from './stalls.schema'

/**
 * Queries do módulo autenticado de Barracas (Portal do Expositor).
 *
 * Responsabilidade:
 * - Centralizar keys e hooks
 * - Invalidation consistente
 */

export const stallsKeys = {
  all: ['stalls'] as const,
  list: (params: { page?: number; pageSize?: number }) => ['stalls', 'list', params] as const,
  detail: (stallId: string) => ['stalls', 'detail', stallId] as const,
}

export function useStallsListQuery(params: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: stallsKeys.list(params),
    queryFn: () => stallsService.list(params),
    staleTime: 30_000,
  })
}

/**
 * ✅ Ideal: usar GET /stalls/:id
 * Caso ainda não exista, a página pode buscar no cache da listagem.
 */
export function useStallDetailQuery(stallId: string) {
  return useQuery({
    queryKey: stallsKeys.detail(stallId),
    queryFn: () => stallsService.getById(stallId),
    enabled: Boolean(stallId),
    staleTime: 30_000,
  })
}

export function useStallsCreateMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['stalls', 'create'],
    mutationFn: (input: UpsertStallRequest) => stallsService.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: stallsKeys.all })
    },
  })
}

export function useStallsUpdateMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['stalls', 'update'],
    mutationFn: (vars: { stallId: string; input: UpsertStallRequest }) =>
      stallsService.update(vars.stallId, vars.input),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: stallsKeys.all })
      await qc.invalidateQueries({ queryKey: stallsKeys.detail(vars.stallId) })
    },
  })
}

export function useStallsDeleteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['stalls', 'delete'],
    mutationFn: (stallId: string) => stallsService.remove(stallId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: stallsKeys.all })
    },
  })
}
