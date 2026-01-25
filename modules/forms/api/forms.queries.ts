import { useMutation, useQuery } from '@tanstack/react-query'
import { formsService } from './forms.service'

/**
 * Queries do módulo Forms.
 * Responsabilidade:
 * - Centralizar hooks do TanStack Query
 * - Padronizar keys e acesso aos services
 */

export function useCampaignQuery(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => formsService.getCampaign(campaignId),
    enabled: Boolean(campaignId),
  })
}

export function useLookupMutation(campaignId: string) {
  return useMutation({
    mutationFn: (input: { document: string }) => formsService.lookup(campaignId, input),
  })
}
