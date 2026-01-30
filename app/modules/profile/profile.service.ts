import { api } from '../shared/http/api'
import { ownerMeSchema, updateOwnerMeSchema, type OwnerMe, type UpdateOwnerMeRequest } from './profile.schema'

/**
 * Service do Portal (autenticado) para Perfil (Owner).
 *
 * Responsabilidade:
 * - Centralizar chamadas HTTP do /owners/me
 * - Validar request/response com Zod
 */
export const profileService = {
  async getMe(): Promise<OwnerMe> {
    const json = await api.get('owners/me')
    return ownerMeSchema.parse(json)
  },

  async updateMe(input: UpdateOwnerMeRequest): Promise<OwnerMe> {
    const body = updateOwnerMeSchema.parse(input)
    const json = await api.patch('owners/me', body)
    return ownerMeSchema.parse(json)
  },
}
