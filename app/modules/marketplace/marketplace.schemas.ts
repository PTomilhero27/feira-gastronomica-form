import { z } from 'zod'

/**
 * Schemas do módulo Marketplace (Feiras Futuras) — Portal do Expositor.
 *
 * Responsabilidade:
 * - Definir contratos explícitos entre o frontend e a API
 * - Validar dados recebidos em runtime (Zod parse)
 * - Servir como source of truth dos tipos com z.infer<>
 *
 * Rotas que serão consumidas (quando backend estiver pronto):
 * - GET    /marketplace/fairs              → lista de feiras futuras
 * - GET    /marketplace/fairs/:fairId      → detalhes de uma feira
 * - GET    /marketplace/fairs/:fairId/map  → mapa + slots da feira
 * - POST   /marketplace/fairs/:fairId/interest → demonstrar interesse
 *
 * Decisão:
 * - Os schemas são preparados para o contrato final, mesmo que
 *   inicialmente a service retorne mocks.
 */

// ──────────────────────────────────────────────
// Status de slots
// ──────────────────────────────────────────────

export const slotStatusSchema = z.enum([
  'AVAILABLE',
  'NEGOTIATING',
  'RESERVED',
  'UNAVAILABLE',
])
export type SlotStatusEnum = z.infer<typeof slotStatusSchema>

// ──────────────────────────────────────────────
// Slot do mapa
// ──────────────────────────────────────────────

export const fairSlotSchema = z.object({
  id: z.string(),
  code: z.string(),           // ex.: "A-01", "B-12"
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional().default(0),
  status: slotStatusSchema,
  sizeSqMeters: z.number().nullable(), // tamanho em m² (ex.: 9 para 3x3)
  sizeLabel: z.string().nullable(),    // ex.: "3m x 3m"
  priceCents: z.number().int().min(0).nullable(), // preço em centavos (legado ou default)
  allowedTentTypes: z.array(
    z.object({
      tentType: z.string(), // Use string to avoid circular or heavy imports, will map to StallSize
      priceCents: z.number().int().min(0),
    })
  ).optional(),
  observations: z.string().nullable(),
  boothNumber: z.string().nullable(),  // número visual no mapa
})
export type FairSlot = z.infer<typeof fairSlotSchema>

// ──────────────────────────────────────────────
// Elemento decorativo do mapa (corredores, limites, etc.)
// ──────────────────────────────────────────────

export const mapElementSchema = z.object({
  id: z.string(),
  type: z.enum(['RECTANGLE', 'CIRCLE', 'LINE', 'TEXT', 'IMAGE', 'TREE']),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  rotation: z.number().optional().default(0),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  opacity: z.number().optional().default(1),
  points: z.array(z.number()).optional(),
})
export type MapElement = z.infer<typeof mapElementSchema>

// ──────────────────────────────────────────────
// Mapa completo da feira
// ──────────────────────────────────────────────

export const fairMapResponseSchema = z.object({
  width: z.number(),
  height: z.number(),
  slots: z.array(fairSlotSchema),
  elements: z.array(mapElementSchema),
})
export type FairMapResponse = z.infer<typeof fairMapResponseSchema>

// ──────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

// ──────────────────────────────────────────────
// Benefício
// ──────────────────────────────────────────────

export const benefitItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
})

// ──────────────────────────────────────────────
// Feira futura (item para listagem e detalhes)
// ──────────────────────────────────────────────

export const futureFairSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  address: z.string().nullable(),
  startDate: z.string().nullable(),   // ISO date
  endDate: z.string().nullable(),     // ISO date
  coverImageUrl: z.string().nullable(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),

  // Dados comerciais
  availableSlotsCount: z.number().int().min(0),
  totalSlotsCount: z.number().int().min(0),
  priceRangeMinCents: z.number().int().min(0).nullable(),
  priceRangeMaxCents: z.number().int().min(0).nullable(),

  // Conteúdo da página
  galleryImageUrls: z.array(z.string()),
  benefits: z.array(benefitItemSchema),
  faq: z.array(faqItemSchema),

  // Contato / localização
  whatsappNumber: z.string().nullable(),
  locationLatLng: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable(),
})
export type FutureFair = z.infer<typeof futureFairSchema>

// ──────────────────────────────────────────────
// Response: lista de feiras futuras
// ──────────────────────────────────────────────

export const futureFairListResponseSchema = z.object({
  items: z.array(futureFairSchema),
})
export type FutureFairListResponse = z.infer<typeof futureFairListResponseSchema>

// ──────────────────────────────────────────────
// Schemas do Backend (Raw do NestJS / Prisma)
// ──────────────────────────────────────────────

/** Elemento cru vindo do template no backend */
export const backendMapElementSchema = z.object({
  id: z.string(),
  clientKey: z.string().nullable(),
  type: z.enum(['BOOTH_SLOT', 'CIRCLE', 'SQUARE', 'RECT', 'TREE', 'LINE', 'TEXT']),
  x: z.number(),
  y: z.number(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  radius: z.number().nullable(),
  rotation: z.number().nullable().default(0),
  label: z.string().nullable(),
  number: z.number().nullable(),
  points: z.array(z.number()).nullable().optional(),
  style: z.object({
    fill: z.string().nullable(),
    stroke: z.string().nullable(),
    strokeWidth: z.number().nullable(),
    opacity: z.number().nullable(),
  }).nullable().optional(),
})

/** Slot comercial cru vindo do backend */
export const backendSlotSchema = z.object({
  id: z.string(),
  fairMapElementId: z.string().nullable(), // vincula com clientKey do elemento
  code: z.string().nullable(),
  label: z.string().nullable(),
  priceCents: z.number().int().min(0).nullable(),
  commercialStatus: z.string(), // ex: AVAILABLE, CONFIRMED, RESERVED
  allowedTentTypes: z.array(
    z.object({
      tentType: z.string(),
      priceCents: z.number().int().min(0),
    })
  ).optional(),
})

/** Resposta bruta do mapa vindo do backend */
export const backendFairMapResponseSchema = z.object({
  template: z.object({
    worldWidth: z.number(),
    worldHeight: z.number(),
    elements: z.array(backendMapElementSchema),
  }),
  slots: z.array(backendSlotSchema),
})
export type BackendFairMapResponse = z.infer<typeof backendFairMapResponseSchema>

// ──────────────────────────────────────────────
// Request/Response: demonstrar interesse
// ──────────────────────────────────────────────

export const expressInterestRequestSchema = z.object({
  slotId: z.string(),
  stallId: z.string().nullable().optional(), // Agora opcional/nullable
  selectedTentType: z.string(), // Obrigatório (StallSize)
})
export type ExpressInterestRequest = z.infer<typeof expressInterestRequestSchema>

export const expressInterestResponseSchema = z.object({
  ok: z.boolean(),
  interestId: z.string(),
})
export type ExpressInterestResponse = z.infer<typeof expressInterestResponseSchema>
