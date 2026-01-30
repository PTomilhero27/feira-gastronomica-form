import { z } from 'zod'

/**
 * Schemas do módulo "Feiras do Expositor" (Portal).
 *
 * Responsabilidade:
 * - Definir contratos explícitos entre front e API NestJS
 * - Evitar “contratos implícitos” e surpresas em runtime
 *
 * Rotas esperadas (autenticadas):
 * - GET    /exhibitor/fairs
 * - POST   /exhibitor/fairs/:fairId/stalls/:stallId
 * - DELETE /exhibitor/fairs/:fairId/stalls/:stallId
 */

export const fairStatusSchema = z.enum(['ATIVA', 'FINALIZADA', 'CANCELADA'])
export const ownerFairStatusSchema = z.enum([
  'SELECIONADO',
  'AGUARDANDO_PAGAMENTO',
  'AGUARDANDO_ASSINATURA',
  'CONCLUIDO',
])

export const stallSizeSchema = z.enum(['SIZE_2X2', 'SIZE_3X3', 'SIZE_3X6', 'TRAILER'])

/**
 * ✅ Status do plano de pagamento (agregado).
 * Mantém alinhado com o enum do backend (OwnerFairPaymentStatus).
 */
export const ownerFairPaymentStatusSchema = z.enum([
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
])

export const exhibitorFairStallSlotSchema = z.object({
  stallSize: stallSizeSchema,
  qty: z.number().int().min(0),
  unitPriceCents: z.number().int().min(0),
})
export type ExhibitorFairStallSlot = z.infer<typeof exhibitorFairStallSlotSchema>

export const exhibitorFairLinkedStallSchema = z.object({
  stallId: z.string(),
  pdvName: z.string(),
  stallSize: stallSizeSchema,
  linkedAt: z.string(), // ISO
})
export type ExhibitorFairLinkedStall = z.infer<typeof exhibitorFairLinkedStallSchema>

/**
 * ✅ Parcela individual do plano de pagamento.
 * Importante:
 * - dueDate/paidAt vêm como ISO string
 * - paidAt pode ser null (em aberto)
 * - paidAmountCents pode ser null (não informado)
 */
export const exhibitorFairInstallmentSchema = z.object({
  number: z.number().int().min(1),
  dueDate: z.string(), // ISO
  amountCents: z.number().int().min(0),
  paidAt: z.string().nullable().optional(),
  paidAmountCents: z.number().int().min(0).nullable().optional(),
})
export type ExhibitorFairInstallment = z.infer<typeof exhibitorFairInstallmentSchema>

/**
 * ✅ Resumo do pagamento do expositor nesta feira.
 * Observação:
 * - nextDueDate pode ser null quando:
 *   - tudo está pago
 *   - não há parcelas (edge) ou plano não existe
 */
export const exhibitorFairPaymentSummarySchema = z.object({
  status: ownerFairPaymentStatusSchema,
  totalCents: z.number().int().min(0),
  installmentsCount: z.number().int().min(1),
  paidCount: z.number().int().min(0),
  nextDueDate: z.string().nullable().optional(),
  installments: z.array(exhibitorFairInstallmentSchema),
})
export type ExhibitorFairPaymentSummary = z.infer<typeof exhibitorFairPaymentSummarySchema>

export const exhibitorFairListItemSchema = z.object({
  fairId: z.string(),
  fairName: z.string(),
  fairStatus: fairStatusSchema,

  ownerFairStatus: ownerFairStatusSchema,

  stallsQtyPurchased: z.number().int().min(0),

  stallSlots: z.array(exhibitorFairStallSlotSchema),

  stallsLinkedQty: z.number().int().min(0),

  linkedStalls: z.array(exhibitorFairLinkedStallSchema),

  /**
   * ✅ Novo: resumo de pagamento.
   * Pode vir null/undefined caso o admin ainda não tenha criado o plano.
   */
  payment: exhibitorFairPaymentSummarySchema.nullable().optional(),
})
export type ExhibitorFairListItem = z.infer<typeof exhibitorFairListItemSchema>

export const listMyFairsResponseSchema = z.object({
  items: z.array(exhibitorFairListItemSchema),
})
export type ListMyFairsResponse = z.infer<typeof listMyFairsResponseSchema>

export const linkStallResponseSchema = z.object({ ok: z.boolean() })
export type LinkStallResponse = z.infer<typeof linkStallResponseSchema>

export const unlinkStallResponseSchema = z.object({ ok: z.boolean() })
export type UnlinkStallResponse = z.infer<typeof unlinkStallResponseSchema>
