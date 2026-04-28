'use client'

import { CalendarDays, Grid3X3, MapPin, Sparkles, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { FutureFair } from '../marketplace.schemas'

type FutureFairHeroProps = {
  fair: FutureFair
}

const GRADIENTS = [
  'from-orange-500 via-amber-500 to-rose-500',
  'from-emerald-600 via-teal-500 to-cyan-500',
  'from-blue-600 via-indigo-500 to-violet-500',
  'from-rose-500 via-pink-500 to-orange-400',
  'from-sky-600 via-cyan-500 to-emerald-500',
]

export function FutureFairHero({ fair }: FutureFairHeroProps) {
  const gradientIndex =
    fair.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENTS.length
  const gradient = GRADIENTS[gradientIndex]

  const highlightText = fair.shortDescription ?? fair.subtitle
  const startFormatted = formatDateMedium(fair.startDate)
  const endFormatted = formatDateMedium(fair.endDate)
  const locationLabel =
    fair.address ?? ([fair.city, fair.state].filter(Boolean).join(', ') || 'Local a confirmar')
  const investmentLabel = formatPriceRange(fair.priceRangeMinCents, fair.priceRangeMaxCents) ?? 'Consulte valores com a equipe'

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-black/5 shadow-sm">
      <div className={`relative min-h-[24rem] bg-gradient-to-br ${gradient} sm:min-h-[28rem]`}>
        {fair.coverImageUrl && (
          <img src={fair.coverImageUrl} alt={fair.name} className="absolute inset-0 h-full w-full object-cover" />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.18),transparent_30%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-900/48 to-slate-900/12" />

        <div className="relative flex min-h-[24rem] flex-col justify-between p-5 sm:min-h-[28rem] sm:p-7 lg:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border-white/20 bg-white/14 px-3 py-1 text-white backdrop-blur-sm hover:bg-white/14">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Feira aberta para expositores
            </Badge>
            <Badge className="rounded-full border-white/20 bg-white/14 px-3 py-1 text-white backdrop-blur-sm hover:bg-white/14">
              <Grid3X3 className="mr-1 h-3.5 w-3.5" />
              {fair.availableSlotsCount} de {fair.totalSlotsCount} espacos disponiveis
            </Badge>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {fair.name}
            </h1>

            {highlightText && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/86 sm:text-base">
                {highlightText}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroInfoCard
                icon={MapPin}
                label="Local"
                value={locationLabel}
              />
              <HeroInfoCard
                icon={CalendarDays}
                label="Periodo"
                value={buildDateRange(startFormatted, endFormatted)}
              />
              <HeroInfoCard
                icon={Wallet}
                label="Investimento"
                value={investmentLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/12 p-4 text-white backdrop-blur-md">
      <div className="flex items-center gap-2 text-white/76">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  )
}

function buildDateRange(start: string, end: string) {
  if (start === 'A definir' && end === 'A definir') return 'Datas em definicao'
  if (start !== 'A definir' && end !== 'A definir' && start !== end) return `${start} a ${end}`
  return start !== 'A definir' ? start : end
}

function formatDateMedium(iso: string | null): string {
  if (!iso) return 'A definir'
  const ymd = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return 'A definir'

  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
  }).format(date)
}

function formatPriceRange(min: number | null, max: number | null): string | null {
  if (min == null) return null

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)

  if (max != null && max !== min) return `${formatCurrency(min)} a ${formatCurrency(max)}`
  return `A partir de ${formatCurrency(min)}`
}
