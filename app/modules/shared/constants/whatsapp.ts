/**
 * Constantes e helpers de WhatsApp para vendas.
 *
 * Responsabilidade:
 * - Centralizar número de contato comercial
 * - Gerar URL de WhatsApp com mensagem contextual
 *
 * Decisão:
 * - Usamos wa.me (link universal) em vez de api.whatsapp (que exige conta business).
 * - O número pode futuramente vir de config do admin, por enquanto é constante.
 */

/** Número do WhatsApp comercial (com código do país, sem +) */
export const WHATSAPP_SALES_NUMBER = '5511999999999'

/**
 * Monta a URL do WhatsApp com mensagem pré-preenchida.
 *
 * @param phone - Número com DDI (ex.: '5511999999999')
 * @param message - Texto da mensagem (será URL-encoded)
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/**
 * Gera mensagem contextual para contato sobre feira/slot.
 */
export function buildFairContactMessage(fairName: string, slotCode?: string): string {
  if (slotCode) {
    return `Olá! Tenho interesse no espaço ${slotCode} da feira "${fairName}". Gostaria de mais informações.`
  }
  return `Olá! Tenho interesse em participar da feira "${fairName}". Gostaria de mais informações.`
}
