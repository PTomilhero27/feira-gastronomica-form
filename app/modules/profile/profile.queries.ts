import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService } from './profile.service'
import type { UpdateOwnerMeRequest } from './profile.schema'

/**
 * Queries do módulo Profile (Portal do Expositor).
 * Responsabilidade:
 * - Centralizar keys e hooks
 * - Invalidation consistente
 */

export const profileKeys = {
  all: ['profile'] as const,
  me: () => ['profile', 'me'] as const,
}

export function useProfileMeQuery() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileService.getMe(),
    staleTime: 30_000,
  })
}

export function useProfileUpdateMeMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['profile', 'update-me'],
    mutationFn: (input: UpdateOwnerMeRequest) => profileService.updateMe(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}
