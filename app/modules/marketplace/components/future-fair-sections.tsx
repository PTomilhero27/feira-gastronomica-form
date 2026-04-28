'use client'

import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  MapPin,
  Megaphone,
  PartyPopper,
  Shield,
  Star,
  Sun,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { FutureFair } from '../marketplace.schemas'

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  MapPin,
  Shield,
  TrendingUp,
  Megaphone,
  PartyPopper,
  Star,
  Sun,
  Utensils,
  DollarSign,
  CalendarDays,
  CheckCircle2,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? CheckCircle2
}

export function FairInfoSection({ fair }: { fair: FutureFair }) {
  const startFormatted = formatDateFull(fair.startDate)
  const endFormatted = formatDateFull(fair.endDate)
  const locationLabel =
    fair.address ?? ([fair.city, fair.state].filter(Boolean).join(', ') || 'Local em confirmacao')
  const investmentLabel =
    formatPriceRange(fair.priceRangeMinCents, fair.priceRangeMaxCents) ?? 'Consulte a equipe pelo WhatsApp'

  return (
    <Card className="rounded-3xl p-4 shadow-sm sm:p-6">
      <SectionHeader
        eyebrow="Visao geral"
        title="Tudo o que voce precisa saber antes de escolher seu espaco"
        description="Os pontos abaixo resumem o essencial para voce avaliar a oportunidade com mais clareza."
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={MapPin}
          label="Localizacao"
          value={locationLabel}
          hint="Veja onde a feira acontece e planeje sua operacao."
        />
        <InfoCard
          icon={CalendarDays}
          label="Periodo"
          value={buildDateRange(startFormatted, endFormatted)}
          hint="Datas previstas para montagem, funcionamento e fluxo de publico."
        />
        <InfoCard
          icon={DollarSign}
          label="Investimento"
          value={investmentLabel}
          hint="Faixa de valores para entrada ou ponto comercial."
        />
        <InfoCard
          icon={Users}
          label="Disponibilidade"
          value={`${fair.availableSlotsCount} de ${fair.totalSlotsCount} espacos livres`}
          hint={
            fair.availableSlotsCount > 0
              ? 'Ainda ha vagas para consulta no mapa.'
              : 'No momento, todos os espacos estao ocupados.'
          }
        />
      </div>
    </Card>
  )
}

export function FairDescriptionSection({ description }: { description: string }) {
  if (!description) return null

  return (
    <Card className="rounded-3xl p-4 shadow-sm sm:p-6">
      <SectionHeader
        eyebrow="Sobre o evento"
        title="Entenda a proposta da feira"
        description="Leia um resumo objetivo para descobrir se o perfil do evento combina com a sua marca."
      />
      <div className="mt-4 rounded-2xl border bg-muted/20 p-4 text-sm leading-7 text-muted-foreground whitespace-pre-line sm:p-5">
        {description}
      </div>
    </Card>
  )
}

export function FairBenefitsSection({
  benefits,
}: {
  benefits: FutureFair['benefits']
}) {
  if (!benefits?.length) return null

  return (
    <Card className="rounded-3xl p-4 shadow-sm sm:p-6">
      <SectionHeader
        eyebrow="Beneficios"
        title="Por que essa feira pode valer a pena"
        description="Cada ponto abaixo destaca ganhos praticos para exposicao, vendas e posicionamento da sua marca."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit, index) => {
          const Icon = getIcon(benefit.icon)

          return (
            <div
              key={index}
              className="rounded-2xl border bg-gradient-to-br from-background to-muted/25 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold leading-6 text-foreground">{benefit.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>
    </div>
  )
}

function buildDateRange(start: string, end: string) {
  if (start === 'A definir' && end === 'A definir') return 'Datas em definicao'
  if (start !== 'A definir' && end !== 'A definir' && start !== end) return `${start} a ${end}`
  return start !== 'A definir' ? start : end
}

function formatDateFull(iso: string | null): string {
  if (!iso) return 'A definir'
  const ymd = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return 'A definir'

  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
