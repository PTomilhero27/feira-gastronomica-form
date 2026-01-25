import { z } from 'zod'

/**
 * Schemas do módulo Forms (contratos públicos).
 * Responsabilidade:
 * - Validar o que vem do backend
 * - Evitar contratos implícitos
 */

export const formTypeSchema = z.enum(['INTEREST', 'COMPLETE'])
export const campaignStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])

export const campaignSchema = z.object({
  id: z.string(),
  fairId: z.string(),
  formType: formTypeSchema,
  status: campaignStatusSchema,
  startsAt: z.string().nullable().optional(),
  endsAt: z.string(),
  messageClosed: z.string().nullable().optional(),
})

export type Campaign = z.infer<typeof campaignSchema>

/** Request da tela 1 (documento) */
export const lookupRequestSchema = z.object({
  document: z.string().min(11, 'Informe um CPF/CNPJ válido.'),
})
export type LookupRequest = z.infer<typeof lookupRequestSchema>

/**
 * Resposta de lookup.
 * Observação:
 * - Por enquanto não vamos usar tudo, mas já deixa pronto para a próxima tela (select-stall).
 */
export const stallLookupSchema = z.object({
  id: z.string(),
  pdvName: z.string(),
  isActiveInThisFair: z.boolean(),
  statusInFair: z.string().nullable(),
})

export const lookupResponseSchema = z.object({
  ownerFound: z.boolean(),
  ownerName: z.string().nullable(),
  stalls: z.array(stallLookupSchema),
})

export type StallLookup = z.infer<typeof stallLookupSchema>
export type LookupResponse = z.infer<typeof lookupResponseSchema>
