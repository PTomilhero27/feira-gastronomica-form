'use client'

/**
 * Card de feira futura para a listagem.
 *
 * Responsabilidade:
 * - Exibir preview visual de uma feira futura
 * - Fornecer ações rápidas: ver detalhes, ver mapa, WhatsApp
 *
 * UX:
 * - Gradiente como placeholder de imagem (quando coverImageUrl for null)
 * - Badges de estado e contagem
 * - Mobile-first com botões grandes
 */

import Link from 'next/link'
import { MapPin, CalendarDays, Grid3X3, ArrowRight } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { FutureFair } from '../marketplace.schemas'
import { FutureFairWhatsAppButton } from './future-fair-whatsapp-button'

type FutureFairCardProps = {
  fair: FutureFair
}

/**
 * Gradientes para cards de feira (rotação baseada no index).
 * Quando o backend enviar imagem de capa, será substituído.
 */
const GRADIENTS = [
  'from-violet-600 via-purple-500 to-fuchsia-500',
  'from-emerald-600 via-teal-500 to-cyan-500',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-blue-600 via-indigo-500 to-purple-500',
  'from-rose-500 via-pink-500 to-fuchsia-500',
]

export function FutureFairCard({ fair }: FutureFairCardProps) {
  // Escolhe gradiente baseado no hash do ID para consistência
  const gradientIndex = fair.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % GRADIENTS.length
  const gradient = GRADIENTS[gradientIndex]

  const startFormatted = formatDateShort(fair.startDate)
  const endFormatted = formatDateShort(fair.endDate)
  const priceRange = formatPriceRange(fair.priceRangeMinCents, fair.priceRangeMaxCents)

  return (
    <Card className="group overflow-hidden rounded-2xl transition-shadow hover:shadow-lg">
      {/* Capa / Gradiente */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
        {fair.coverImageUrl && (
          <img
            src={fair.coverImageUrl}
            alt={fair.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Badge de espaços disponíveis (overlay no canto) */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-foreground backdrop-blur-sm hover:bg-white/90 gap-1.5 rounded-full px-3 py-1">
            <Grid3X3 className="h-3.5 w-3.5" />
            {fair.availableSlotsCount} espaço{fair.availableSlotsCount !== 1 ? 's' : ''} disponíve{fair.availableSlotsCount !== 1 ? 'is' : 'l'}
          </Badge>
        </div>

        {/* Nome sobreposto (para dar impacto visual) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-medium text-white/80">
            {fair.city}, {fair.state}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {fair.name}
          </h3>
          {fair.subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {fair.subtitle}
            </p>
          )}
        </div>

        {/* Metadados */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {(fair.city || fair.state) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {[fair.city, fair.state].filter(Boolean).join(', ')}
            </span>
          )}
          {(fair.startDate || fair.endDate) && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {startFormatted} {startFormatted && endFormatted && '—'} {endFormatted}
            </span>
          )}
        </div>

        {/* Faixa de preço */}
        {priceRange && (
          <p className="text-sm">
            <span className="text-muted-foreground">A partir de </span>
            <span className="font-semibold text-foreground">{priceRange}</span>
          </p>
        )}

        {/* Descrição curta */}
        {fair.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {fair.shortDescription}
          </p>
        )}

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link href={`/feiras/futuras/${fair.id}`}>
            <Button className="gap-2 rounded-xl">
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href={`/feiras/futuras/${fair.id}/mapa`}>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Grid3X3 className="h-4 w-4" />
              Mapa
            </Button>
          </Link>

          <FutureFairWhatsAppButton
            fairName={fair.name}
            whatsappNumber={fair.whatsappNumber}
            iconOnly
          />
        </div>
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────
// Helpers de formatação
// ──────────────────────────────────────────────

function formatDateShort(iso: string | null): string {
  if (!iso) return '—'
  const ymd = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '—'

  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function formatPriceRange(minCents: number | null, maxCents: number | null): string | null {
  if (minCents == null) return null

  const fmt = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  if (maxCents != null && maxCents !== minCents) {
    return `${fmt(minCents)} – ${fmt(maxCents)}`
  }
  return fmt(minCents)
}
