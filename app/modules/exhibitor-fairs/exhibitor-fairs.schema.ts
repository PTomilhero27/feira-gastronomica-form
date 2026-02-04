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
 * - POST   /exhibitor/fairs/:fairId/stalls/:stallId?purchaseId=...
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
 * Status financeiro de uma compra (linha).
 * Alinhado com OwnerFairPaymentStatus do backend.
 */
export const ownerFairPaymentStatusSchema = z.enum([
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
])

/**
 * ✅ Contrato por feira/expositor (OwnerFair -> Contract).
 * Status derivado para UX do portal.
 */
export const exhibitorFairContractStatusSchema = z.enum([
  'NOT_ISSUED',
  'ISSUED',
  'AWAITING_SIGNATURE',
  'SIGNED',
])

export const exhibitorFairContractSummarySchema = z.object({
  contractId: z.string(),
  status: exhibitorFairContractStatusSchema,

  // Obs.: pdfPath é caminho interno; o ideal é o front pedir uma URL segura em outro endpoint.
  pdfPath: z.string().nullable(),

  // O backend já devolve null quando expirado/inválido.
  signUrl: z.string().nullable(),
  signUrlExpiresAt: z.string().nullable(),

  signedAt: z.string().nullable(),
  updatedAt: z.string(), // ISO
})
export type ExhibitorFairContractSummary = z.infer<typeof exhibitorFairContractSummarySchema>

/**
 * Parcela individual de uma compra (linha).
 */
export const exhibitorFairPurchaseInstallmentSchema = z.object({
  number: z.number().int().min(1),
  dueDate: z.string(), // ISO
  amountCents: z.number().int().min(0),
  paidAt: z.string().nullable(),
  paidAmountCents: z.number().int().min(0).nullable(),
})
export type ExhibitorFairPurchaseInstallment = z.infer<typeof exhibitorFairPurchaseInstallmentSchema>

/**
 * ✅ Compra (linha 1 por 1) - OwnerFairPurchase.
 * O portal consome uma linha ao vincular uma barraca (purchaseId).
 */
export const exhibitorFairPurchaseSchema = z.object({
  id: z.string(),
  stallSize: stallSizeSchema,
  qty: z.number().int().min(1),
  usedQty: z.number().int().min(0),
  remainingQty: z.number().int().min(0),

  unitPriceCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  paidCents: z.number().int().min(0),

  installmentsCount: z.number().int().min(0),
  status: ownerFairPaymentStatusSchema,

  installments: z.array(exhibitorFairPurchaseInstallmentSchema),
})
export type ExhibitorFairPurchase = z.infer<typeof exhibitorFairPurchaseSchema>

/**
 * ✅ Barracas vinculadas (StallFair) + resumo da compra consumida.
 */
export const exhibitorFairLinkedStallSchema = z.object({
  stallId: z.string(),
  pdvName: z.string(),
  stallSize: stallSizeSchema,
  linkedAt: z.string(), // ISO

  purchaseId: z.string().nullable(),
  purchaseStatus: ownerFairPaymentStatusSchema.nullable(),

  purchaseUnitPriceCents: z.number().int().min(0).nullable(),
  purchaseTotalCents: z.number().int().min(0).nullable(),
  purchasePaidCents: z.number().int().min(0).nullable(),
  purchaseInstallmentsCount: z.number().int().min(0).nullable(),
})
export type ExhibitorFairLinkedStall = z.infer<typeof exhibitorFairLinkedStallSchema>

/**
 * ✅ Resumo agregado do pagamento por feira.
 * Observação:
 * - installmentsCount pode ser 0 (quando compras pagas à vista / sem parcelas)
 * - nextDueDate pode ser null quando não existe próxima parcela em aberto
 */
export const exhibitorFairPaymentSummarySchema = z.object({
  status: ownerFairPaymentStatusSchema,
  totalCents: z.number().int().min(0),
  installmentsCount: z.number().int().min(0),
  paidCount: z.number().int().min(0),
  nextDueDate: z.string().nullable(),
  installments: z.array(
    z.object({
      purchaseId: z.string(),
      stallSize: stallSizeSchema,
      number: z.number().int().min(1),
      dueDate: z.string(), // ISO
      amountCents: z.number().int().min(0),
      paidAt: z.string().nullable(),
      paidAmountCents: z.number().int().min(0).nullable(),
    }),
  ),
})
export type ExhibitorFairPaymentSummary = z.infer<typeof exhibitorFairPaymentSummarySchema>

/**
 * ✅ Item da listagem de feiras do portal.
 * Agora inclui:
 * - contract
 * - purchases
 * - linkedStalls (com purchaseId)
 * - paymentSummary
 */
export const exhibitorFairListItemSchema = z.object({
  fairId: z.string(),
  fairName: z.string(),
  fairStatus: fairStatusSchema,

  ownerFairStatus: ownerFairStatusSchema,

  stallsQtyPurchased: z.number().int().min(0),
  stallsLinkedQty: z.number().int().min(0),

  contract: exhibitorFairContractSummarySchema.nullable(),
  purchases: z.array(exhibitorFairPurchaseSchema),
  linkedStalls: z.array(exhibitorFairLinkedStallSchema),

  paymentSummary: exhibitorFairPaymentSummarySchema.nullable(),
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
