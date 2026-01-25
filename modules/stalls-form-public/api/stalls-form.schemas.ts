// src/modules/stalls-form-public/api/stalls-form.schemas.ts
import { interestOwnerFormSchema, ownerLookupResponseSchema } from '@/modules/interests/api/interests.schemas'
import { z } from 'zod'

/**
 * Este arquivo define os schemas Zod do fluxo público do Form de Barracas.
 *
 * Responsabilidade:
 * - Validar/parsear o retorno do endpoint público de validação
 * - Manter o contrato explícito entre front e back
 *
 * Observação importante:
 * - O endpoint /validate agora retorna apenas:
 *   - owner (mínimo)
 *   - stallsQty + stallSlots (compra)
 *   - linkedStallIds + linkedStallsQty (uso atual)
 * - A lista completa de barracas do owner é carregada por outro serviço do front
 *   (e a verificação de vínculo é feita cruzando com linkedStallIds).
 */

export const fairStatusSchema = z.enum(['ATIVA', 'FINALIZADA', 'CANCELADA'])

/**
 * Owner retornado pelo /validate é propositalmente enxuto (endpoint público).
 * Se no futuro você decidir retornar mais campos, esse schema pode ser expandido.
 */

/**
 * Compra por tamanho (OwnerFairStallSlot)
 * Base para validações no front (ex.: limitar seleção por tamanho).
 */
export const stallSlotSchema = z.object({
  stallSize: z.enum(['SIZE_2X2', 'SIZE_3X3', 'SIZE_3X6', 'TRAILER']),
  qty: z.number().int().min(0),
  unitPriceCents: z.number().int().min(0),
})

export const stallsFormContextSchema = z.object({
  fair: z.object({
    id: z.string(),
    name: z.string(),
    status: fairStatusSchema,
  }),

  window: z.object({
    enabled: z.boolean(),
    startsAt: z.string(),
    endsAt: z.string(),
  }),

  /**
   * O backend retorna owner (mínimo) ou null (caso você opte por isso no futuro).
   * Como hoje ele sempre retorna owner quando passa na validação, pode manter sem nullable.
   * Se quiser ser mais defensivo: .nullable()
   */
  owner: interestOwnerFormSchema,

  /**
   * Quantidade total comprada (capacidade).
   */
  stallsQty: z.number().int().min(0),

  /**
   * Detalhamento por tamanho (compra).
   */
  stallSlots: z.array(stallSlotSchema),

  /**
   * IDs das barracas já vinculadas nessa feira para este owner.
   * Você vai cruzar isso com a lista completa de barracas do owner (outro serviço).
   */
  linkedStallIds: z.array(z.string()),

  /**
   * Quantidade já vinculada (linkedStallIds.length).
   * Mantido explícito pelo backend para facilitar UI/avisos.
   */
  linkedStallsQty: z.number().int().min(0),
})

export type StallsFormContext = z.infer<typeof stallsFormContextSchema>
export type StallSlot = z.infer<typeof stallSlotSchema>
export type PublicOwner = z.infer<typeof ownerLookupResponseSchema>
