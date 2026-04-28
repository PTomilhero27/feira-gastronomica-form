'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Grid3X3, MapPinned, ScanSearch } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SlotStatus } from '../marketplace.types'
import { SLOT_STATUS_COLORS, SLOT_STATUS_LABELS } from '../marketplace.types'

type FutureFairMapPreviewProps = {
  fairId: string
  availableCount: number
  totalCount: number
}

export function FutureFairMapPreview({
  fairId,
  availableCount,
  totalCount,
}: FutureFairMapPreviewProps) {
  const occupiedCount = Math.max(totalCount - availableCount, 0)
  const occupancyPct = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0

  return (
    <Card className="rounded-3xl p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Passo importante
          </Badge>
          <h2 className="mt-3 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Veja o mapa antes de decidir
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No mapa voce enxerga a distribuicao dos espacos, compara status rapidamente e entende
            melhor onde cada ponto fica dentro da feira.
          </p>
        </div>

        <Link href={`/feiras/futuras/${fairId}/mapa`} className="w-full lg:w-auto">
          <Button className="h-12 w-full gap-2 rounded-2xl px-5 text-base lg:w-auto">
            Abrir mapa interativo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/25 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={MapPinned}
              label="Espacos livres"
              value={`${availableCount}`}
              hint={availableCount > 0 ? 'Prontos para consulta no mapa.' : 'No momento, sem vagas livres.'}
            />
            <StatCard
              icon={CheckCircle2}
              label="Espacos ocupados"
              value={`${occupiedCount}`}
              hint="Ja reservados, indisponiveis ou em negociacao."
            />
            <StatCard
              icon={ScanSearch}
              label="Ocupacao"
              value={`${occupancyPct}%`}
              hint="Percentual de ocupacao geral da planta."
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Leitura rapida do mapa</span>
              <span className="font-semibold text-foreground">{occupancyPct}% ocupado</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{availableCount} disponiveis</span>
              <span>{occupiedCount} ocupados</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">Como interpretar o mapa</p>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            <p>1. Abra o mapa para localizar os pontos que fazem mais sentido para sua operacao.</p>
            <p>2. Compare as cores para saber se o espaco esta livre, reservado ou em negociacao.</p>
            <p>3. Se surgir duvida, fale com a equipe antes de seguir para a escolha.</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.entries(SLOT_STATUS_LABELS) as [SlotStatus, string][]).map(([status, label]) => (
              <Badge
                key={status}
                variant="outline"
                className={`gap-1.5 rounded-full text-xs ${SLOT_STATUS_COLORS[status].text}`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SLOT_STATUS_COLORS[status].fill }}
                />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatCard({
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
    <div className="rounded-2xl border bg-background/90 p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{hint}</p>
    </div>
  )
}
