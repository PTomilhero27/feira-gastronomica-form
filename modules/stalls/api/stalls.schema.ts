// src/modules/stalls/api/stalls.schema.ts
import { stallsFormContextSchema } from '@/modules/stalls-form-public/api/stalls-form.schemas'
import { onlyDigits } from '@/modules/shared/utils/document'
import { z } from 'zod'

/**
 * Schemas do módulo público de Barracas (stalls).
 *
 * Rotas públicas esperadas:
 * - POST   /public/fairs/:fairId/forms/stalls/validate
 * - GET    /public/fairs/:fairId/forms/stalls/by-document/:document
 * - POST   /public/fairs/:fairId/forms/stalls/create
 * - PATCH  /public/fairs/:fairId/forms/stalls/:stallId
 * - DELETE /public/fairs/:fairId/forms/stalls/:stallId
 *
 * Novas rotas (vínculo com feira):
 * - POST   /public/fairs/:fairId/forms/stalls/select
 * - POST   /public/fairs/:fairId/forms/stalls/unlink
 */

/** Status da feira (para exibição/fluxo) */
export const fairStatusSchema = z.enum(['ATIVA', 'FINALIZADA', 'CANCELADA'])
export const personTypeSchema = z.enum(['PF', 'PJ'])

/**
 * Documento (CPF/CNPJ) aceitando máscara no front, mas validando por dígitos.
 * Regra:
 * - CPF = 11 dígitos
 * - CNPJ = 14 dígitos
 */
export const cpfCnpjSchema = z
  .string()
  .min(11, 'Informe um CPF/CNPJ válido.')
  .refine((v) => {
    const d = onlyDigits(v)
    return d.length === 11 || d.length === 14
  }, 'Informe um CPF (11) ou CNPJ (14).')

/**
 * ✅ Back alterado:
 * - StallSize agora inclui TRAILER
 * - Removido OTHER + stallSizeOther
 */
export const stallSizeSchema = z.enum(['SIZE_2X2', 'SIZE_3X3', 'SIZE_3X6', 'TRAILER'])

/**
 * ✅ Novo no back
 */
export const stallTypeSchema = z.enum(['OPEN', 'CLOSED', 'TRAILER'])

/** =========================
 *  1) Validate (documento)
 *  ========================= */
export const validateRequestSchema = z.object({
  document: cpfCnpjSchema,
})
export type ValidateRequest = z.infer<typeof validateRequestSchema>

/** =========================
 *  2) Entidades retornadas
 *  ========================= */
export const stallMenuProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number().int().min(0),
  order: z.number().int().min(0),
})

export const stallMenuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int().min(0),
  products: z.array(stallMenuProductSchema),
})

export const stallEquipmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number().int().min(1),
})

export const stallPowerNeedSchema = z.object({
  id: z.string(),
  outlets110: z.number().int().min(0),
  outlets220: z.number().int().min(0),
  outletsOther: z.number().int().min(0),
  needsGas: z.boolean(),
  gasNotes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const stallSchema = z.object({
  id: z.string(),

  // No retorno do by-document pode não vir ownerId (dependendo do select do backend)
  ownerId: z.string().optional(),

  pdvName: z.string(),
  machinesQty: z.number().int().min(0),
  bannerName: z.string().nullable().optional(),
  mainCategory: z.string().nullable().optional(),

  stallType: stallTypeSchema,
  stallSize: stallSizeSchema,

  teamQty: z.number().int().min(1),

  menuCategories: z.array(stallMenuCategorySchema),
  equipments: z.array(stallEquipmentSchema),

  powerNeed: stallPowerNeedSchema.nullable().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Stall = z.infer<typeof stallSchema>

export type StallsFormContext = z.infer<typeof stallsFormContextSchema>

/** =========================
 *  3) Payload do Wizard (create/update) — contrato do BACK (flat)
 *  ========================= */

/**
 * Step 2 (categories/products) — com order (0-based)
 */
export const upsertMenuProductSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().min(0),
  order: z.number().int().min(0),
})

export const upsertMenuCategorySchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0),
  products: z.array(upsertMenuProductSchema).min(1),
})

export const upsertEquipmentSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().min(1),
})

/**
 * ✅ Back espera "power"
 */
export const upsertPowerSchema = z.object({
  outlets110: z.number().int().min(0),
  outlets220: z.number().int().min(0),
  outletsOther: z.number().int().min(0),
  needsGas: z.boolean(),
  gasNotes: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * ✅ Back espera "stall" com campos flat:
 * pdvName, machinesQty, bannerName?, mainCategory?, stallType, stallSize, teamQty,
 * categories, equipments, power
 */
export const upsertStallSchema = z.object({
  pdvName: z.string().min(1, 'Informe o nome interno (PDV).'),
  machinesQty: z.number().int().min(0),
  bannerName: z.string().optional(),
  mainCategory: z.string().optional(),

  stallType: stallTypeSchema,
  stallSize: stallSizeSchema,

  teamQty: z.number().int().min(1),

  categories: z.array(upsertMenuCategorySchema),
  equipments: z.array(upsertEquipmentSchema),
  power: upsertPowerSchema,
})

export const createStallRequestSchema = z.object({
  document: cpfCnpjSchema,
  stall: upsertStallSchema,
})
export type CreateStallRequest = z.infer<typeof createStallRequestSchema>

export const updateStallRequestSchema = createStallRequestSchema
export type UpdateStallRequest = z.infer<typeof updateStallRequestSchema>

export const upsertStallResponseSchema = z.object({
  stallId: z.string(),
})
export type UpsertStallResponse = z.infer<typeof upsertStallResponseSchema>

export const deleteStallRequestSchema = z.object({
  document: cpfCnpjSchema,
})
export type DeleteStallRequest = z.infer<typeof deleteStallRequestSchema>

export const deleteStallResponseSchema = z.object({
  ok: z.boolean(),
})
export type DeleteStallResponse = z.infer<typeof deleteStallResponseSchema>

/**
 * ✅ Endpoint GET listByDocument
 */
export const listStallsByDocumentResponseSchema = z.object({
  stalls: z.array(stallSchema),
})
export type ListStallsByDocumentResponse = z.infer<typeof listStallsByDocumentResponseSchema>

/** =========================
 *  4) Vínculo com feira (select/unlink)
 *  ========================= */

/**
 * VINCULAR uma barraca existente à feira.
 * Endpoint:
 * POST /public/fairs/:fairId/forms/stalls/select
 */
export const selectStallForFairRequestSchema = z.object({
  document: cpfCnpjSchema,
  stallId: z.string().min(1),
})
export type SelectStallForFairRequest = z.infer<typeof selectStallForFairRequestSchema>

export const selectStallForFairResponseSchema = z.object({
  stallFairId: z.string(),
})
export type SelectStallForFairResponse = z.infer<typeof selectStallForFairResponseSchema>

/**
 * DESVINCULAR uma barraca da feira.
 * Endpoint:
 * POST /public/fairs/:fairId/forms/stalls/unlink
 */
export const unlinkStallForFairRequestSchema = z.object({
  document: cpfCnpjSchema,
  stallId: z.string().min(1),
})
export type UnlinkStallForFairRequest = z.infer<typeof unlinkStallForFairRequestSchema>

export const unlinkStallForFairResponseSchema = z.object({
  ok: z.boolean(),
})
export type UnlinkStallForFairResponse = z.infer<typeof unlinkStallForFairResponseSchema>
