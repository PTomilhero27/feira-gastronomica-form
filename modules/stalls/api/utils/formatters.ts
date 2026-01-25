/**
 * Helpers de formatação e conversão usados no fluxo público.
 * Responsabilidade:
 * - Centralizar formatação de datas (janela do formulário)
 * - Converter valores monetários para cents (evita ponto flutuante)
 */

import { onlyDigits } from "@/modules/shared/utils/document"

export function formatDateTimeShort(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/**
 * Exibe o período da janela do formulário.
 */
export function formatWindowPeriod(startsAt: string, endsAt: string) {
  return `${formatDateTimeShort(startsAt)} — ${formatDateTimeShort(endsAt)}`
}

/**
 * Converte string BRL amigável ("19,90", "19.90", "R$ 19,90") para cents (1990).
 * Decisão:
 * - No wizard, o usuário digita texto; só no submit final convertemos para cents.
 */
export function brlToCents(input: string) {
  const raw = (input ?? '').toString().trim()
  if (!raw) return 0

  const cleaned = raw
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '') // remove separador de milhar
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')

  const value = Number(cleaned)
  if (Number.isNaN(value) || value < 0) return 0

  return Math.round(value * 100)
}

/**
 * Converte cents para string "R$ 19,90".
 */
export function centsToBrl(cents: number) {
  const value = (cents ?? 0) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPhoneBR(input: string) {
  const d = onlyDigits(input).slice(0, 11)

  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}