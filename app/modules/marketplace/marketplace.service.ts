/**
 * Service do módulo Marketplace (Feiras Futuras) — Portal do Expositor.
 *
 * Responsabilidade:
 * - Centralizar chamadas HTTP do /marketplace
 * - Validar response com Zod para contratos explícitos
 *
 * Decisão:
 * - Nesta primeira fase usamos MOCKS para desenvolvimento visual.
 * - Cada método tem um comentário indicando o endpoint real futuro.
 * - Quando backend estiver pronto, basta descomentar a chamada real
 *   e remover o import dos mocks.
 *
 * Padrão:
 * - Mesmo padrão do exhibitor-fairs.service.ts
 */

import { api } from '../shared/http/api'
import {
  futureFairListResponseSchema,
  type FutureFairListResponse,
  futureFairSchema,
  type FutureFair,
  fairMapResponseSchema,
  type FairMapResponse,
  expressInterestResponseSchema,
  type ExpressInterestRequest,
  type ExpressInterestResponse,
  backendFairMapResponseSchema,
  type MapElement,
  type FairSlot,
  type SlotStatusEnum,
} from './marketplace.schemas'

export const marketplaceService = {
  /**
   * Lista feiras futuras disponíveis para o expositor.
   *
   * Endpoint: GET /public/marketplace/fairs
   */
  async listFutureFairs(): Promise<FutureFairListResponse> {
    const json = await api.get('public/marketplace/fairs')
    return futureFairListResponseSchema.parse(json)
  },

  /**
   * Busca detalhes de uma feira futura específica.
   *
   * Endpoint: GET /public/marketplace/fairs/:fairId
   */
  async getFutureFairById(fairId: string): Promise<FutureFair | null> {
    const json = await api.get(`public/marketplace/fairs/${fairId}`)
    return futureFairSchema.parse(json)
  },

  /**
   * Busca mapa da feira com slots e elementos.
   *
   * Endpoint: GET /public/marketplace/fairs/:fairId/map
   *
   * Lógica: O backend envia o template (geo) e os slots (comercial) separados.
   * Fazemos o merge aqui na service para o componente de mapa não precisar saber disso.
   */
  async getFairMap(fairId: string): Promise<FairMapResponse> {
    const json = await api.get(`public/marketplace/fairs/${fairId}/map`)
    const data = backendFairMapResponseSchema.parse(json)

    const width = data.template.worldWidth
    const height = data.template.worldHeight

    const elements: MapElement[] = []
    const slots: FairSlot[] = []

    data.template.elements.forEach((el) => {
      if (el.type === 'BOOTH_SLOT') {
        const commercial = data.slots.find((s) => s.fairMapElementId === el.clientKey)
        if (commercial) {
          slots.push({
            id: commercial.id, // ID comercial para as ações
            code: commercial.code || String(el.number || ''),
            x: el.x,
            y: el.y,
            width: el.width || 0,
            height: el.height || 0,
            rotation: el.rotation || 0,
            status: mapStatus(commercial.commercialStatus),
            priceCents: commercial.priceCents,
            allowedTentTypes: commercial.allowedTentTypes,
            sizeSqMeters: null,
            sizeLabel: null,
            observations: commercial.label || null,
            boothNumber: String(el.number || ''),
          })
        }
      } else {
        elements.push({
          id: el.id,
          type: mapType(el.type),
          x: el.x,
          y: el.y,
          width: el.width ?? undefined,
          height: el.height ?? undefined,
          radius: el.radius ?? undefined,
          rotation: el.rotation || 0,
          fill: el.style?.fill ?? undefined,
          stroke: el.style?.stroke ?? undefined,
          strokeWidth: el.style?.strokeWidth ?? undefined,
          opacity: el.style?.opacity ?? 1,
          text: el.label ?? undefined,
          points: el.points ?? undefined,
        })
      }
    })

    return {
      width,
      height,
      elements,
      slots,
    }
  },

  /**
   * Registra interesse do expositor em um slot.
   *
   * Endpoint: POST /marketplace/slots/:slotId/interests
   */
  async expressInterest(
    fairId: string,
    payload: ExpressInterestRequest,
  ): Promise<ExpressInterestResponse> {
    const json = await api.post<any>(`marketplace/slots/${payload.slotId}/reservations`, {
      stallId: payload.stallId,
      selectedTentType: payload.selectedTentType,
    })
    return expressInterestResponseSchema.parse({
      ok: true,
      interestId: json.id,
    })
  },
}

/**
 * Mapeia o status comercial do backend para o enum do frontend.
 */
function mapStatus(status: string): SlotStatusEnum {
  if (status === 'AVAILABLE') return 'AVAILABLE'
  if (status === 'CONFIRMED' || status === 'RESERVED') return 'RESERVED'
  return 'UNAVAILABLE'
}

/**
 * Mapeia o tipo de elemento do backend para o formato do FairMapViewer.
 */
function mapType(
  type: string,
): 'RECTANGLE' | 'CIRCLE' | 'LINE' | 'TEXT' | 'IMAGE' | 'TREE' {
  if (type === 'RECT' || type === 'SQUARE') return 'RECTANGLE'
  if (type === 'CIRCLE') return 'CIRCLE'
  if (type === 'TREE') return 'TREE'
  if (type === 'TEXT') return 'TEXT'
  if (type === 'LINE') return 'LINE'
  return 'RECTANGLE' // fallback
}

