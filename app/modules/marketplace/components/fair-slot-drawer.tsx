'use client'

import * as React from 'react'
import {
  Clock3,
  DollarSign,
  FileText,
  Hash,
  Heart,
  MapPinned,
  Ruler,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import type { FairSlot } from '../marketplace.schemas'
import { SLOT_STATUS_COLORS, SLOT_STATUS_LABELS, type SlotStatus } from '../marketplace.types'
import { FutureFairWhatsAppButton } from './future-fair-whatsapp-button'

type FairSlotDrawerProps = {
  slot: FairSlot | null
  open: boolean
  onOpenChange: (open: boolean) => void
  fairName: string
  whatsappNumber?: string | null
  onExpressInterest: (slot: FairSlot, selectedTentType: string) => void
}

export function FairSlotDrawer({
  slot,
  open,
  onOpenChange,
  fairName,
  whatsappNumber,
  onExpressInterest,
}: FairSlotDrawerProps) {
  const [isMobile, setIsMobile] = React.useState(false)
  const [selectedTentType, setSelectedTentType] = React.useState<string>('')

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    if (slot?.allowedTentTypes?.length) {
      setSelectedTentType(slot.allowedTentTypes[0].tentType)
      return
    }

    setSelectedTentType('')
  }, [slot])

  if (!slot) return null

  const slotStatus = slot.status as SlotStatus
  const colors = SLOT_STATUS_COLORS[slotStatus]
  const isInterestable = slot.status === 'AVAILABLE'
  const currentTentOption = slot.allowedTentTypes?.find((item) => item.tentType === selectedTentType)
  const displayPriceCents = currentTentOption?.priceCents ?? slot.priceCents
  const priceFormatted = displayPriceCents != null ? formatMoney(displayPriceCents) : 'Consulte a equipe'
  const sizeLabel =
    slot.sizeLabel ??
    (currentTentOption ? labelStallSize(currentTentOption.tentType) : 'Formato sob consulta')
  const guidance = getStatusGuidance(slotStatus)

  const content = (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Espaco selecionado
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {slot.boothNumber ?? slot.code}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Codigo do espaco: {slot.code}
            </p>
          </div>

          <Badge className={`rounded-full border px-3 py-1 ${colors.bg} ${colors.text} ${colors.border}`}>
            {SLOT_STATUS_LABELS[slotStatus]}
          </Badge>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">{guidance}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoCard
            icon={<Hash className="h-4 w-4" />}
            label="Identificacao"
            value={slot.code}
          />
          <InfoCard
            icon={<Ruler className="h-4 w-4" />}
            label="Formato"
            value={sizeLabel}
          />
          <InfoCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Investimento"
            value={priceFormatted}
          />
          <InfoCard
            icon={<MapPinned className="h-4 w-4" />}
            label="Status"
            value={SLOT_STATUS_LABELS[slotStatus]}
          />
        </div>
      </div>

      {isInterestable && slot.allowedTentTypes && slot.allowedTentTypes.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Escolha o formato da barraca</p>
            <p className="mt-1 text-sm text-muted-foreground">Escolha para ver o valor.</p>
          </div>

          <div className="grid gap-2">
            {slot.allowedTentTypes.map((option) => (
              <button
                key={option.tentType}
                type="button"
                onClick={() => setSelectedTentType(option.tentType)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  selectedTentType === option.tentType
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'bg-card hover:bg-muted/40'
                }`}
              >
                <span className="font-semibold text-foreground">{labelStallSize(option.tentType)}</span>
                <span className="text-muted-foreground">{formatMoney(option.priceCents)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {slot.observations && (
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Observacoes do espaco</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{slot.observations}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-orange-50/70 p-4">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Proximo passo</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Envie a solicitacao e aguarde o contato da equipe.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        {isInterestable ? (
          <>
            <Button
              onClick={() => onExpressInterest(slot, selectedTentType)}
              disabled={!selectedTentType && (slot.allowedTentTypes?.length ?? 0) > 0}
              className="h-12 w-full gap-2 rounded-2xl text-base"
            >
              <Heart className="h-5 w-5" />
              Solicitar este espaco
            </Button>
              <p className="text-xs leading-5 text-muted-foreground">A reserva segue com a equipe.</p>
          </>
        ) : (
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Quer outra opcao?</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Fale com a equipe para ver alternativas proximas.
            </p>
          </div>
        )}

        <FutureFairWhatsAppButton
          fairName={fairName}
          slotCode={slot.code}
          whatsappNumber={whatsappNumber}
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-2xl text-base"
        />
      </div>
    </div>
  )

  return (
    <>
      {isMobile && (
        <div className="lg:hidden">
          <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Detalhes do espaco</DrawerTitle>
                <DrawerDescription>
                  Veja os detalhes e siga com a solicitacao.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-6">{content}</div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      <div className="hidden lg:block">
        {open && (
          <div className="animate-in slide-in-from-right-5 rounded-3xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">Detalhes do espaco</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Veja o espaco e avance se fizer sentido.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Fechar
              </button>
            </div>
            {content}
          </div>
        )}
      </div>
    </>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border bg-background/80 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  )
}

function getStatusGuidance(status: SlotStatus) {
  switch (status) {
    case 'AVAILABLE':
      return 'Disponivel para solicitacao.'
    case 'NEGOTIATING':
      return 'Em negociacao no momento.'
    case 'RESERVED':
      return 'Ja reservado.'
    case 'UNAVAILABLE':
      return 'Indisponivel nesta etapa.'
    default:
      return 'Consulte a equipe.'
  }
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function labelStallSize(size: string): string {
  switch (size) {
    case 'SIZE_2X2':
      return '2m x 2m'
    case 'SIZE_3X3':
      return '3m x 3m'
    case 'SIZE_3X6':
      return '3m x 6m'
    case 'TRAILER':
      return 'Trailer'
    case 'CART':
      return 'Carrinho'
    default:
      return size
  }
}
