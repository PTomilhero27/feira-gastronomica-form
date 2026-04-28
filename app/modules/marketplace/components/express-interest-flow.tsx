'use client'

/**
 * Fluxo de demonstração de interesse em um slot — wizard mobile-friendly.
 *
 * Responsabilidade:
 * - Guiar o expositor em etapas claras para demonstrar interesse
 * - Manter UX intuitiva e sem atrito no mobile
 *
 * Etapas:
 * 1. Confirmar interesse (resumo do slot)
 * 2. Vincular barraca (opcional — pode pular)
 * 3. Revisão e confirmação final
 * 4. Resultado (sucesso ou erro)
 *
 * Decisão:
 * - Wizard dentro de um Drawer no mobile (bottom sheet)
 * - Dialog no desktop
 * - Stepper visual para indicar progresso
 * - Cada etapa é um componente separado para clareza
 */

import * as React from 'react'
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { Stepper } from '@/app/modules/shared/components/stepper'
import { getErrorMessage } from '@/app/modules/shared/utils/get-error-message'
import type { Stall } from '@/app/modules/stalls/stalls.schema'
import { useStallsListQuery } from '@/app/modules/stalls/stalls.queries'
import { useExpressInterestMutation } from '../marketplace.queries'
import { useAuth } from '@/app/providers/auth-provider'

import type { FairSlot } from '../marketplace.schemas'
import { SLOT_STATUS_LABELS, SLOT_STATUS_COLORS, INTEREST_FLOW_STEPS, type SlotStatus } from '../marketplace.types'
import { SelectStallForInterest } from './select-stall-for-interest'
import { FutureFairWhatsAppButton } from './future-fair-whatsapp-button'

type ExpressInterestFlowProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: FairSlot | null
  selectedTentType: string
  fairId: string
  fairName: string
  whatsappNumber?: string | null
}

type FlowStep = 'confirm' | 'select-stall' | 'review' | 'done'

type InterestErrorState = {
  title: string
  description: string
}

export function ExpressInterestFlow({
  open,
  onOpenChange,
  slot,
  selectedTentType,
  fairId,
  fairName,
  whatsappNumber,
}: ExpressInterestFlowProps) {
  // ──────────────────────────────────────────
  // Estado do wizard
  // ──────────────────────────────────────────

  const [step, setStep] = React.useState<FlowStep>('confirm')
  const [selectedStallId, setSelectedStallId] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<'success' | 'error' | null>(null)
  const [errorState, setErrorState] = React.useState<InterestErrorState | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset quando abrir/fechar
  React.useEffect(() => {
    if (open) {
      setStep('confirm')
      setSelectedStallId(null)
      setResult(null)
      setErrorState(null)
    }
  }, [open])

  // Queries — stalls só busca quando o wizard estiver aberto E o usuário autenticado
  const { isAuthenticated } = useAuth()
  const stallsQuery = useStallsListQuery({ page: 1, pageSize: 100 })
  const expressInterest = useExpressInterestMutation()

  // ⚠️ Evita chamada da query se o wizard não está aberto ou não autenticado
  const stalls = (open && isAuthenticated) ? (stallsQuery.data?.items ?? []) : []
  const stallsLoading = (open && isAuthenticated) ? stallsQuery.isLoading : false

  // ──────────────────────────────────────────
  // Ações
  // ──────────────────────────────────────────

  function goToSelectStall() {
    setStep('select-stall')
  }

  function goToReview() {
    setStep('review')
  }

  function goBack() {
    if (step === 'select-stall') setStep('confirm')
    if (step === 'review') setStep('select-stall')
  }

  async function handleSubmit() {
    if (!slot) return

    try {
      await expressInterest.mutateAsync({
        fairId,
        payload: {
          slotId: slot.id,
          stallId: selectedStallId, // Removido ! (agora opcional no schema)
          selectedTentType,
        },
      })
      setErrorState(null)
      setResult('success')
      setStep('done')
    } catch (error) {
      setErrorState(formatInterestError(error))
      setResult('error')
      setStep('done')
    }
  }

  function handleClose() {
    onOpenChange(false)
  }

  // Stepper visual (sem etapa 'done')
  const stepperSteps = INTEREST_FLOW_STEPS.map((s) => ({ title: s.title }))
  const stepperCurrent =
    step === 'confirm' ? 1 :
    step === 'select-stall' ? 2 :
    step === 'review' ? 3 : 3

  // ──────────────────────────────────────────
  // Conteúdo do wizard
  // ──────────────────────────────────────────

  const content = slot ? (
    <div className="space-y-4">
      {/* Stepper (exceto na etapa final) */}
      {step !== 'done' && (
        <Stepper current={stepperCurrent} steps={stepperSteps} />
      )}

      {/* ETAPA 1: Confirmação de reserva */}
      {step === 'confirm' && (
        <StepConfirm slot={slot} selectedTentType={selectedTentType} onNext={goToSelectStall} />
      )}

      {/* ETAPA 2: Seleção de barraca */}
      {step === 'select-stall' && (
        <StepSelectStall
          stalls={stalls}
          isLoading={stallsLoading}
          selectedStallId={selectedStallId}
          onSelect={setSelectedStallId}
          onBack={goBack}
          onNext={goToReview}
        />
      )}

      {/* ETAPA 3: Revisão final */}
      {step === 'review' && (
        <StepReview
          slot={slot}
          selectedTentType={selectedTentType}
          stallName={stalls.find((s) => s.id === selectedStallId)?.pdvName ?? null}
          isSubmitting={expressInterest.isPending}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}

      {/* ETAPA FINAL: Resultado */}
      {step === 'done' && (
        <StepResult
          result={result}
          fairName={fairName}
          slotCode={slot.code}
          whatsappNumber={whatsappNumber}
          errorTitle={errorState?.title}
          errorDescription={errorState?.description}
          onClose={handleClose}
          onRetry={handleSubmit}
          isRetrying={expressInterest.isPending}
        />
      )}
    </div>
  ) : null

  // ──────────────────────────────────────────
  // Render: Drawer no mobile, Dialog no desktop
  // ──────────────────────────────────────────

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {step === 'done' ? 'Resultado' : 'Demonstrar interesse'}
            </DrawerTitle>
            <DrawerDescription>
              {step === 'done'
                ? 'Veja o status da sua solicitação.'
                : `Espaço ${slot?.code ?? ''}`
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'done' ? 'Resultado' : 'Demonstrar interesse'}
          </DialogTitle>
          <DialogDescription>
            {step === 'done'
              ? 'Veja o status da sua solicitação.'
              : `Espaço ${slot?.code ?? ''}`
            }
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────────
// ETAPA 1: Confirmação de interesse
// ──────────────────────────────────────────────

function StepConfirm({
  slot,
  selectedTentType,
  onNext,
}: {
  slot: FairSlot
  selectedTentType: string
  onNext: () => void
}) {
  const colors = SLOT_STATUS_COLORS[slot.status as SlotStatus]

  const tentOption = slot.allowedTentTypes?.find((t) => t.tentType === selectedTentType)
  const displayPriceCents = tentOption?.priceCents ?? slot.priceCents

  const price = displayPriceCents != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPriceCents / 100)
    : '—'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{slot.code}</span>
          <Badge className={`rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {SLOT_STATUS_LABELS[slot.status as SlotStatus]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Tipo/Espaço</span>
            <p className="font-medium">
              {tentOption ? labelStallSize(tentOption.tentType) : (slot.sizeLabel ?? `${slot.sizeSqMeters ?? '—'} m²`)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Investimento</span>
            <p className="font-medium">{price}</p>
          </div>
        </div>

        {slot.observations && (
          <p className="text-xs text-muted-foreground">{slot.observations}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Ao prosseguir, você vai demonstrar interesse neste espaço. Nossa equipe comercial entrará em contato.
      </p>

      <Button onClick={onNext} className="w-full h-12 gap-2 rounded-xl text-base">
        Reservar agora
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

// ──────────────────────────────────────────────
// ETAPA 2: Seleção de barraca
// ──────────────────────────────────────────────

function StepSelectStall({
  stalls,
  isLoading,
  selectedStallId,
  onSelect,
  onBack,
  onNext,
}: {
  stalls: Stall[]
  isLoading: boolean
  selectedStallId: string | null
  onSelect: (id: string | null) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Qual barraca será usada?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Selecione uma das suas barracas cadastradas.
        </p>
      </div>

      <SelectStallForInterest
        stalls={stalls}
        isLoading={isLoading}
        selectedStallId={selectedStallId}
        onSelect={onSelect}
      />

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12 gap-2 rounded-xl"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// ETAPA 3: Revisão final
// ──────────────────────────────────────────────

function StepReview({
  slot,
  selectedTentType,
  stallName,
  isSubmitting,
  onBack,
  onSubmit,
}: {
  slot: FairSlot
  selectedTentType: string
  stallName: string | null
  isSubmitting: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  const tentOption = slot.allowedTentTypes?.find((t) => t.tentType === selectedTentType)
  const displayPriceCents = tentOption?.priceCents ?? slot.priceCents

  const price = displayPriceCents != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPriceCents / 100)
    : '—'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
        <p className="font-medium text-base">Resumo do interesse</p>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Espaço</span>
          <span className="font-medium">{slot.code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tipo selecionado</span>
          <span className="font-medium">
            {tentOption ? labelStallSize(tentOption.tentType) : (slot.sizeLabel ?? `${slot.sizeSqMeters} m²`)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Investimento total</span>
          <span className="font-medium">{price}</span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="text-muted-foreground">Barraca vinculada</span>
          <span className="font-medium">
            {stallName ?? 'Nenhuma (vincular depois)'}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Ao confirmar, você está solicitando a reserva deste espaço. Nossa equipe comercial entrará em contato para formalização.
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-12 gap-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 gap-2 rounded-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Confirmar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// ETAPA FINAL: Resultado
// ──────────────────────────────────────────────

function StepResult({
  result,
  fairName,
  slotCode,
  whatsappNumber,
  errorTitle,
  errorDescription,
  onClose,
  onRetry,
  isRetrying,
}: {
  result: 'success' | 'error' | null
  fairName: string
  slotCode: string
  whatsappNumber?: string | null
  errorTitle?: string
  errorDescription?: string
  onClose: () => void
  onRetry: () => void
  isRetrying: boolean
}) {
  if (result === 'success') {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-semibold">Reserva solicitada!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua solicitação de reserva para o espaço {slotCode} foi recebida. Nossa equipe comercial entrará em contato em breve.
          </p>
        </div>

        <div className="w-full space-y-2">
          <FutureFairWhatsAppButton
            fairName={fairName}
            slotCode={slotCode}
            whatsappNumber={whatsappNumber}
            variant="outline"
            size="lg"
            className="w-full h-12"
          />

          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full h-12 rounded-xl"
          >
            Fechar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <XCircle className="h-10 w-10 text-red-600" />
      </div>
      <div>
        <p className="text-lg font-semibold">{errorTitle ?? 'Ocorreu um erro'}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {errorDescription ?? (
            <>
          Não foi possível registrar seu interesse. Tente novamente ou entre em contato via WhatsApp.
            </>
          )}
        </p>
      </div>

      <div className="w-full space-y-2">
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full h-12 gap-2 rounded-xl"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Tentando...
            </>
          ) : (
            'Tentar novamente'
          )}
        </Button>

        <FutureFairWhatsAppButton
          fairName={fairName}
          slotCode={slotCode}
          whatsappNumber={whatsappNumber}
          variant="outline"
          size="lg"
          className="w-full h-12"
        />
      </div>
    </div>
  )
}

function formatInterestError(error: unknown): InterestErrorState {
  const rawMessage = getErrorMessage(error).trim()
  const mismatchMatch = rawMessage.match(
    /^O tipo selecionado \(([^)]+)\) n[aã]o coincide com o tamanho da barraca \(([^)]+)\)\.?$/i,
  )

  if (mismatchMatch) {
    const [, selectedType, stallType] = mismatchMatch

    return {
      title: 'Tamanho incompatível',
      description: `O espaço foi solicitado em ${labelStallSize(selectedType)}, mas a barraca vinculada está cadastrada como ${labelStallSize(stallType)}. Escolha uma barraca compatível ou volte e selecione outro tamanho.`,
    }
  }

  return {
    title: 'Não foi possível concluir a reserva',
    description: humanizeTentTypeCodes(rawMessage) || 'Não foi possível registrar seu interesse. Tente novamente ou entre em contato via WhatsApp.',
  }
}

function humanizeTentTypeCodes(message: string): string {
  return message.replace(/\b(SIZE_2X2|SIZE_3X3|SIZE_3X6|TRAILER|CART)\b/g, (value) =>
    labelStallSize(value),
  )
}

function labelStallSize(size: string): string {
  switch (size) {
    case 'SIZE_2X2': return '2m x 2m'
    case 'SIZE_3X3': return '3m x 3m'
    case 'SIZE_3X6': return '3m x 6m'
    case 'TRAILER': return 'Trailer'
    case 'CART': return 'Carrinho'
    default: return size
  }
}
