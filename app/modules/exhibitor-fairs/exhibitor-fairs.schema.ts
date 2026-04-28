import { z } from "zod";

/**
 * Schemas do módulo "Feiras do Expositor" (Portal).
 *
 * Rotas esperadas (autenticadas):
 * - GET    /exhibitor/fairs
 * - POST   /exhibitor/fairs/:fairId/stalls/:stallId?purchaseId=...
 * - DELETE /exhibitor/fairs/:fairId/stalls/:stallId
 */

export const fairStatusSchema = z.enum(["ATIVA", "FINALIZADA", "CANCELADA"]);

export const ownerFairStatusSchema = z.enum([
  "SELECIONADO",
  "AGUARDANDO_PAGAMENTO",
  "AGUARDANDO_ASSINATURA",
  "AGUARDANDO_BARRACAS",
  "CONCLUIDO",
]);

// ✅ IMPORTANTE: backend já devolve CART nas compras
export const stallSizeSchema = z.enum([
  "CART",
  "SIZE_2X2",
  "SIZE_3X3",
  "SIZE_3X6",
  "TRAILER",
]);

export const ownerFairPaymentStatusSchema = z.enum([
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const exhibitorFairContractStatusSchema = z.enum([
  "NOT_ISSUED",
  "ISSUED",
  "AWAITING_SIGNATURE",
  "SIGNED",
]);

export const exhibitorFairContractSummarySchema = z.object({
  contractId: z.string(),
  status: exhibitorFairContractStatusSchema,
  pdfPath: z.string().nullable(),
  signUrl: z.string().nullable(),
  signUrlExpiresAt: z.string().nullable(),
  signedAt: z.string().nullable(),
  updatedAt: z.string(),
});
export type ExhibitorFairContractSummary = z.infer<
  typeof exhibitorFairContractSummarySchema
>;

export const exhibitorFairPurchaseInstallmentSchema = z.object({
  number: z.number().int().min(1),
  dueDate: z.string(),
  amountCents: z.number().int().min(0),
  paidAt: z.string().nullable(),
  paidAmountCents: z.number().int().min(0).nullable(),
});
export type ExhibitorFairPurchaseInstallment = z.infer<
  typeof exhibitorFairPurchaseInstallmentSchema
>;

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
});
export type ExhibitorFairPurchase = z.infer<typeof exhibitorFairPurchaseSchema>;

export const exhibitorFairLinkedStallSchema = z.object({
  stallId: z.string(),
  pdvName: z.string(),
  stallSize: stallSizeSchema,
  linkedAt: z.string(),

  purchaseId: z.string().nullable(),
  purchaseStatus: ownerFairPaymentStatusSchema.nullable(),

  purchaseUnitPriceCents: z.number().int().min(0).nullable(),
  purchaseTotalCents: z.number().int().min(0).nullable(),
  purchasePaidCents: z.number().int().min(0).nullable(),
  purchaseInstallmentsCount: z.number().int().min(0).nullable(),
});
export type ExhibitorFairLinkedStall = z.infer<
  typeof exhibitorFairLinkedStallSchema
>;

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
      dueDate: z.string(),
      amountCents: z.number().int().min(0),
      paidAt: z.string().nullable(),
      paidAmountCents: z.number().int().min(0).nullable(),
    }),
  ),
});
export type ExhibitorFairPaymentSummary = z.infer<
  typeof exhibitorFairPaymentSummarySchema
>;

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
});
export type ExhibitorFairListItem = z.infer<typeof exhibitorFairListItemSchema>;

export const listMyFairsResponseSchema = z.object({
  items: z.array(exhibitorFairListItemSchema),
});
export type ListMyFairsResponse = z.infer<typeof listMyFairsResponseSchema>;

export const linkStallResponseSchema = z.object({ ok: z.boolean() });
export type LinkStallResponse = z.infer<typeof linkStallResponseSchema>;

export const unlinkStallResponseSchema = z.object({ ok: z.boolean() });
export type UnlinkStallResponse = z.infer<typeof unlinkStallResponseSchema>;
