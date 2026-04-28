'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Clock3,
} from 'lucide-react'

import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpressInterestFlow } from '@/app/modules/marketplace/components/express-interest-flow'
import { FairMapViewer } from '@/app/modules/marketplace/components/fair-map-viewer'
import { FairSlotDrawer } from '@/app/modules/marketplace/components/fair-slot-drawer'
import { FutureFairStickyActions } from '@/app/modules/marketplace/components/future-fair-sticky-actions'
import { FutureFairWhatsAppButton } from '@/app/modules/marketplace/components/future-fair-whatsapp-button'
import { FairMapSkeleton } from '@/app/modules/marketplace/components/marketplace-skeleton'
import {
  useFairMapQuery,
  useFutureFairDetailQuery,
} from '@/app/modules/marketplace/marketplace.queries'
import type { FairSlot } from '@/app/modules/marketplace/marketplace.schemas'
import type { SlotStatus } from '@/app/modules/marketplace/marketplace.types'
import { useRequireAuth } from '@/app/modules/shared/auth/use-require-auth'

export default function FairMapPage() {
  const params = useParams<{ fairId: string }>()
  const fairId = params.fairId
  const { requireAuth } = useRequireAuth()

  const mapQuery = useFairMapQuery(fairId)
  const fairQuery = useFutureFairDetailQuery(fairId)

  const fair = fairQuery.data
  const mapData = mapQuery.data

  const [selectedSlot, setSelectedSlot] = React.useState<FairSlot | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [interestFlowOpen, setInterestFlowOpen] = React.useState(false)
  const [interestSlot, setInterestSlot] = React.useState<FairSlot | null>(null)
  const [interestTentType, setInterestTentType] = React.useState<string>('')

  const statusCounts = React.useMemo(() => {
    const counts: Partial<Record<SlotStatus, number>> = {}

    for (const slot of mapData?.slots ?? []) {
      counts[slot.status] = (counts[slot.status] ?? 0) + 1
    }

    return counts
  }, [mapData?.slots])

  const availableCount = statusCounts.AVAILABLE ?? fair?.availableSlotsCount ?? 0
  const negotiatingCount = statusCounts.NEGOTIATING ?? 0
  const reservedCount = statusCounts.RESERVED ?? 0
  const totalCount = mapData?.slots.length ?? fair?.totalSlotsCount ?? 0
  const committedCount = Math.max(totalCount - availableCount, 0)
  const occupancyPct = totalCount > 0 ? Math.round((committedCount / totalCount) * 100) : 0

  function handleSlotClick(slot: FairSlot) {
    setSelectedSlot(slot)
    setDrawerOpen(true)
  }

  function handleExpressInterest(slot: FairSlot, tentType: string) {
    if (!requireAuth()) return

    setInterestSlot(slot)
    setInterestTentType(tentType)
    setDrawerOpen(false)
    setInterestFlowOpen(true)
  }

  const isLoading = mapQuery.isLoading || fairQuery.isLoading
  const isError = mapQuery.isError || fairQuery.isError

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
      <AppBreadcrumb
        items={[
          { label: 'Feiras futuras', href: '/feiras/futuras' },
          { label: fair?.name ?? 'Feira', href: `/feiras/futuras/${fairId}` },
          { label: 'Mapa' },
        ]}
      />

      <div className="mt-4">
        <Link href={`/feiras/futuras/${fairId}`}>
          <Button variant="ghost" className="-ml-2 gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Voltar para detalhes da feira
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        {isLoading && <FairMapSkeleton />}

        {isError && (
          <Card className="rounded-3xl border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">Nao foi possivel carregar o mapa</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Recarregue para tentar novamente.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-xl"
                onClick={() => {
                  mapQuery.refetch()
                  fairQuery.refetch()
                }}
              >
                Recarregar
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && mapData && (
          <div className="space-y-6">
            <div className="rounded-3xl border bg-gradient-to-r from-orange-50 via-background to-amber-50 px-4 py-4 shadow-sm sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                      Mapa principal
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {occupancyPct}% ocupado
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Escolha seu espaco
                  </h1>
                  {fair && <p className="mt-1 text-sm text-muted-foreground">{fair.name}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatChip label="Livres" value={availableCount} />
                  <StatChip label="Negociacao" value={negotiatingCount} />
                  <StatChip label="Reservados" value={reservedCount} />
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="space-y-4">
                <FairMapViewer
                  mapData={mapData}
                  selectedSlotId={selectedSlot?.id}
                  onSlotClick={handleSlotClick}
                />
              </div>

              <div className="space-y-4">
                <SelectionPlaceholderCard
                  hasSelection={drawerOpen}
                  fairName={fair?.name ?? 'Feira'}
                  whatsappNumber={fair?.whatsappNumber}
                />

                <div className="hidden lg:block">
                  <FairSlotDrawer
                    slot={selectedSlot}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    fairName={fair?.name ?? ''}
                    whatsappNumber={fair?.whatsappNumber}
                    onExpressInterest={handleExpressInterest}
                  />
                </div>

                <ReservationSupportCard
                  availableCount={availableCount}
                  negotiatingCount={negotiatingCount}
                  fairName={fair?.name ?? 'Feira'}
                  whatsappNumber={fair?.whatsappNumber}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="lg:hidden">
        <FairSlotDrawer
          slot={selectedSlot}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          fairName={fair?.name ?? ''}
          whatsappNumber={fair?.whatsappNumber}
          onExpressInterest={handleExpressInterest}
        />
      </div>

      <ExpressInterestFlow
        open={interestFlowOpen}
        onOpenChange={setInterestFlowOpen}
        slot={interestSlot}
        selectedTentType={interestTentType}
        fairId={fairId}
        fairName={fair?.name ?? ''}
        whatsappNumber={fair?.whatsappNumber}
      />

      {selectedSlot && (
        <FutureFairStickyActions
          fairId={fairId}
          fairName={fair?.name ?? ''}
          whatsappNumber={fair?.whatsappNumber}
          onExpressInterest={() => {
            const defaultTentType = selectedSlot.allowedTentTypes?.[0]?.tentType ?? ''
            handleExpressInterest(selectedSlot, defaultTentType)
          }}
          hidden={drawerOpen || interestFlowOpen}
        />
      )}
    </div>
  )
}

function StatChip({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border bg-background/80 px-4 py-3 text-center shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function SelectionPlaceholderCard({
  hasSelection,
  fairName,
  whatsappNumber,
}: {
  hasSelection: boolean
  fairName: string
  whatsappNumber?: string | null
}) {
  if (hasSelection) return null

  return (
    <Card className="rounded-3xl p-5 shadow-sm sm:p-6">
      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
        Proximo passo
      </Badge>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Selecione um espaco no mapa
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Clique em um espaco para ver status, detalhes e iniciar a reserva.
      </p>

    </Card>
  )
}

function ReservationSupportCard({
  availableCount,
  negotiatingCount,
  fairName,
  whatsappNumber,
}: {
  availableCount: number
  negotiatingCount: number
  fairName: string
  whatsappNumber?: string | null
}) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Panorama da feira</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {availableCount} livres e {negotiatingCount} em negociacao no momento.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <FutureFairWhatsAppButton
          fairName={fairName}
          whatsappNumber={whatsappNumber}
          size="lg"
          className="h-11 w-full rounded-2xl"
        />
      </div>
    </Card>
  )
}
