import { z } from 'zod'

/**
 * Schemas do módulo autenticado de Barracas (Portal do Expositor).
 *
 * Responsabilidade:
 * - Definir contratos explícitos entre front e API NestJS
 * - Evitar “contratos implícitos” e surpresas em runtime
 *
 * Rotas esperadas (autenticadas):
 * - GET    /stalls
 * - POST   /stalls
 * - PATCH  /stalls/:stallId
 * - DELETE /stalls/:stallId
 * - (recomendado) GET /stalls/:stallId
 */

export const stallSizeSchema = z.enum(['SIZE_2X2', 'SIZE_3X3', 'SIZE_3X6', 'TRAILER'])
export const stallTypeSchema = z.enum(['OPEN', 'CLOSED', 'TRAILER'])

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
  outlets110: z.number().int().min(0),
  outlets220: z.number().int().min(0),
  outletsOther: z.number().int().min(0),
  needsGas: z.boolean(),
  gasNotes: z.string().nullable(),
  notes: z.string().nullable(),
})

/**
 * Stall completo (como vem na listagem do backend atual).
 * Observação: createdAt/updatedAt chegam como ISO string no DTO.
 */
export const stallSchema = z.object({
  id: z.string(),
  pdvName: z.string(),
  machinesQty: z.number().int().min(0),
  bannerName: z.string().nullable(),
  mainCategory: z.string().nullable(),
  stallType: stallTypeSchema,
  stallSize: stallSizeSchema,
  teamQty: z.number().int().min(1),

  // ✅ Backend retorna tudo na listagem atual
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      order: z.number().int().min(0),
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          priceCents: z.number().int().min(0),
          order: z.number().int().min(0),
        }),
      ),
    }),
  ),

  equipments: z.array(stallEquipmentSchema),
  powerNeed: stallPowerNeedSchema.nullable(),

  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Stall = z.infer<typeof stallSchema>

export const paginatedMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(1),
})

export const listStallsResponseSchema = z.object({
  items: z.array(stallSchema),
  meta: paginatedMetaSchema,
})
export type ListStallsResponse = z.infer<typeof listStallsResponseSchema>

/**
 * Payload do Upsert (contrato do backend UpsertStallDto)
 * Observação:
 * - `power` é opcional
 * - `categories` e `equipments` podem ser arrays vazios (mas wizard vai validar)
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

export const upsertPowerSchema = z.object({
  outlets110: z.number().int().min(0),
  outlets220: z.number().int().min(0),
  outletsOther: z.number().int().min(0),
  needsGas: z.boolean(),
  gasNotes: z.string().optional(),
  notes: z.string().optional(),
})

export const upsertStallSchema = z.object({
  pdvName: z.string().min(1),
  machinesQty: z.number().int().min(0),
  bannerName: z.string().optional(),
  mainCategory: z.string().optional(),

  stallType: stallTypeSchema,
  stallSize: stallSizeSchema,

  teamQty: z.number().int().min(1),

  categories: z.array(upsertMenuCategorySchema),
  equipments: z.array(upsertEquipmentSchema),
  power: upsertPowerSchema.optional(),
})

export type UpsertStallRequest = z.infer<typeof upsertStallSchema>

export const upsertStallResponseSchema = z.object({
  stallId: z.string(),
})
export type UpsertStallResponse = z.infer<typeof upsertStallResponseSchema>

export const deleteStallResponseSchema = z.object({ ok: z.boolean() })
export type DeleteStallResponse = z.infer<typeof deleteStallResponseSchema>
