/**
 * Tipos utilitários do módulo Marketplace (Feiras Futuras).
 *
 * Responsabilidade:
 * - Definir enums e tipos auxiliares que complementam os schemas Zod
 * - Facilitar uso em componentes sem importar schemas pesados
 *
 * Decisão:
 * - Separamos tipos "de UI" (labels, cores) dos schemas "de contrato" (Zod)
 *   para manter clareza e evitar acoplamento.
 */

/** Status possíveis de um slot no mapa da feira */
export type SlotStatus = 'AVAILABLE' | 'NEGOTIATING' | 'RESERVED' | 'UNAVAILABLE'

/** Mapeamento de status → labels em português para a UI */
export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  AVAILABLE: 'Disponível',
  NEGOTIATING: 'Em negociação',
  RESERVED: 'Reservado',
  UNAVAILABLE: 'Indisponível',
}

/** Mapeamento de status → cores (Tailwind classes) para o mapa e badges */
export const SLOT_STATUS_COLORS: Record<SlotStatus, { bg: string; text: string; border: string; fill: string; stroke: string }> = {
  AVAILABLE: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    fill: '#FEF9C3', // yellow-100
    stroke: '#CA8A04',
  },
  NEGOTIATING: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    fill: '#FDE68A', // amber-200
    stroke: '#D97706',
  },
  RESERVED: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    fill: '#DBEAFE', // blue-100
    stroke: '#2563EB',
  },
  UNAVAILABLE: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-500',
    border: 'border-zinc-300',
    fill: '#F4F4F5', // zinc-100
    stroke: '#A1A1AA',
  },
}

/** Etapas do fluxo de interesse (wizard mobile-friendly) */
export type InterestFlowStep = 'confirm' | 'select-stall' | 'review' | 'done'

/** Labels das etapas do fluxo de interesse */
export const INTEREST_FLOW_STEPS: { key: InterestFlowStep; title: string }[] = [
  { key: 'confirm', title: 'Interesse' },
  { key: 'select-stall', title: 'Barraca' },
  { key: 'review', title: 'Confirmar' },
]

/** Tipo de um item de FAQ */
export type FaqItem = {
  question: string
  answer: string
}

/** Tipo de um item de benefício */
export type BenefitItem = {
  icon: string // nome do ícone lucide
  title: string
  description: string
}

/** Tipo de seção genérica da página de feira */
export type FairSection = {
  type: 'text' | 'benefits' | 'gallery' | 'faq' | 'cta' | 'map-preview' | 'info'
  title?: string
  content?: string
}
