// src/modules/stalls/api/stalls.queries.ts
import { useMutation } from '@tanstack/react-query'
import { stallsPublicService } from './stalls.service'
import {
  CreateStallRequest,
  DeleteStallRequest,
  SelectStallForFairRequest,
  UnlinkStallForFairRequest,
  UpdateStallRequest,
  ValidateRequest,
} from './stalls.schema'

/**
 * Queries do módulo público de Barracas.
 *
 * Responsabilidade:
 * - Centralizar hooks do TanStack Query
 * - Padronizar keys e acesso aos services
 *
 * Observação:
 * - Tudo aqui é mutation, porque depende de ação do usuário (submit/confirm).
 * - Mesmo ações que "buscam" (validate/list) são tratadas como mutation no wizard.
 */

export function useStallsValidateMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-validate', fairId],
    mutationFn: (input: ValidateRequest) => stallsPublicService.validate(fairId, input),
  })
}

/**
 * Lista as barracas do Owner (reutilizáveis).
 * Mantemos como mutation porque é fluxo do wizard.
 */
export function useStallsListByDocumentMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-list-by-document', fairId],
    mutationFn: (input: { document: string }) => stallsPublicService.listOwnerStalls(fairId, input),
  })
}

export function useStallsCreateMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-create', fairId],
    mutationFn: (input: CreateStallRequest) => stallsPublicService.create(fairId, input),
  })
}

export function useStallsUpdateMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-update', fairId],
    mutationFn: (vars: { stallId: string; input: UpdateStallRequest }) =>
      stallsPublicService.update(fairId, vars.stallId, vars.input),
  })
}

export function useStallsDeleteMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-delete', fairId],
    mutationFn: (vars: { stallId: string; input: DeleteStallRequest }) =>
      stallsPublicService.remove(fairId, vars.stallId, vars.input),
  })
}

/**
 * VINCULA uma barraca existente na feira (cria StallFair).
 */
export function useSelectStallForFairMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-select', fairId],
    mutationFn: (input: SelectStallForFairRequest) => stallsPublicService.selectForFair(fairId, input),
  })
}

/**
 * DESVINCULA uma barraca da feira (remove StallFair).
 */
export function useUnlinkStallFromFairMutation(fairId: string) {
  return useMutation({
    mutationKey: ['public-stalls-unlink', fairId],
    mutationFn: (input: UnlinkStallForFairRequest) => stallsPublicService.unlinkFromFair(fairId, input),
  })
}
