'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, CreditCard, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { useStallsListQuery } from '@/app/modules/stalls/stalls.queries'
import { ExhibitorFairListItem } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.schema'

import LinkedStallsList from './linked-stalls-list'
import AllLinkedAlertDialog from './all-linked-alert-dialog'
import LinkStallDialog from './link-stall-dialog'

/**
 * Card de uma feira no Portal do Expositor (colapsável).
 *
 * Responsabilidade:
 * - Header limpo e “escaneável” (nome + badges + ações)
 * - Mostrar métricas (barracas/parcelas) apenas quando expandido
 * - Conteúdo detalhado fica dentro do CollapsibleContent
 *
 * Decisão:
 * - UX: quando fechado, o card vira “resumo”.
 * - UX: quando aberto, mostramos chips de métricas no header para orientar o usuário.
 */
export default function FairCard({ fair }: { fair: ExhibitorFairListItem }) {
  const [expanded, setExpanded] = useState(true)
  const [linkOpen, setLinkOpen] = useState(false)
  const [allLinkedOpen, setAllLinkedOpen] = useState(false)

  const stallsQuery = useStallsListQuery({ page: 1, pageSize: 100 })
  const stalls = stallsQuery.data?.items ?? []

  const canLinkMore = fair.stallsLinkedQty < fair.stallsQtyPurchased
  const payment = fair.payment ?? null

  const progressPct = useMemo(() => {
    if (!fair.stallsQtyPurchased) return 0
    return Math.min(100, Math.round((fair.stallsLinkedQty / fair.stallsQtyPurchased) * 100))
  }, [fair.stallsLinkedQty, fair.stallsQtyPurchased])

  const slotsLabel = useMemo(() => {
    if (!fair.stallSlots?.length) return '—'
    return fair.stallSlots
      .filter((s) => s.qty > 0)
      .map((s) => `${labelStallSize(s.stallSize)}: ${s.qty}`)
      .join(' • ')
  }, [fair.stallSlots])

  function handleClickLink() {
    if (!canLinkMore) {
      setAllLinkedOpen(true)
      return
    }
    setLinkOpen(true)
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="space-y-3">
          {/* Linha principal: título/badges + ações */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold truncate">{fair.fairName}</h2>

                <Badge variant="secondary">{labelFairStatus(fair.fairStatus)}</Badge>
                <Badge variant="outline">{labelOwnerFairStatus(fair.ownerFairStatus)}</Badge>

                {payment && (
                  <Badge className={paymentBadgeClass(payment.status)}>
                    {labelPaymentStatus(payment.status)}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Gerencie suas barracas e acompanhe o andamento do seu pagamento para esta feira.
              </p>

              {!expanded && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 rounded-full">
                    <Store className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">
                      {fair.stallsLinkedQty}/{fair.stallsQtyPurchased}
                    </span>
                    <span className="text-muted-foreground">barracas vinculadas</span>
                  </Badge>

                  {payment && (
                    <Badge variant="secondary" className="gap-1.5 rounded-full">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">
                        {payment.paidCount}/{payment.installmentsCount}
                      </span>
                      <span className="text-muted-foreground">parcelas pagas</span>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Ações do lado direito (mais alinhadas e bonitas) */}
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl border border-transparent hover:border-border"
                  aria-label={expanded ? 'Recolher detalhes da feira' : 'Abrir detalhes da feira'}
                >
                  <span className="font-medium">{expanded ? 'Recolher' : 'Detalhes'}</span>
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      expanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <Button
                onClick={handleClickLink}
                disabled={stallsQuery.isLoading}
                className="rounded-xl"
              >
                Vincular barraca
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <Separator />

          <CardContent className="py-5 space-y-4">
            {/* Resumo em blocos */}
            <div className="grid gap-3 md:grid-cols-3">
              {/* Barracas */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Barracas</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compradas:{' '}
                  <span className="font-semibold text-foreground">{fair.stallsQtyPurchased}</span>
                  {' • '}
                  Vinculadas:{' '}
                  <span className="font-semibold text-foreground">
                    {fair.stallsLinkedQty}/{fair.stallsQtyPurchased}
                  </span>
                </p>

                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{progressPct}% vinculadas</p>
                </div>
              </div>

              {/* Tamanhos */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Tamanhos comprados</p>
                <p className="mt-2 text-sm text-muted-foreground">{slotsLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">Tamanhos adquiridos para esta feira.</p>
              </div>

              {/* Pagamento */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Pagamento</p>

                {!payment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plano de pagamento ainda não foi configurado pela organização.
                  </p>
                )}

                {payment && (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Parcelas:</span>
                      <span className="text-sm font-semibold">
                        {payment.paidCount}/{payment.installmentsCount} pagas
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Próximo vencimento:</span>
                      <span className="text-sm font-semibold">
                        {payment.nextDueDate ? formatDateBR(payment.nextDueDate) : '—'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="text-sm font-semibold">{formatMoneyBRL(payment.totalCents)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <LinkedStallsList fairId={fair.fairId} linkedStalls={fair.linkedStalls} />

            <LinkStallDialog
              open={linkOpen}
              onOpenChange={setLinkOpen}
              fair={fair}
              myStalls={stalls}
            />

            <AllLinkedAlertDialog open={allLinkedOpen} onOpenChange={setAllLinkedOpen} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function labelFairStatus(value: ExhibitorFairListItem['fairStatus']) {
  switch (value) {
    case 'ATIVA':
      return 'Ativa'
    case 'FINALIZADA':
      return 'Finalizada'
    case 'CANCELADA':
      return 'Cancelada'
    default:
      return value
  }
}

function labelOwnerFairStatus(value: ExhibitorFairListItem['ownerFairStatus']) {
  switch (value) {
    case 'SELECIONADO':
      return 'Selecionado'
    case 'AGUARDANDO_PAGAMENTO':
      return 'Aguardando pagamento'
    case 'AGUARDANDO_ASSINATURA':
      return 'Aguardando assinatura'
    case 'CONCLUIDO':
      return 'Concluído'
    default:
      return value
  }
}

export function labelStallSize(value: string) {
  switch (value) {
    case 'SIZE_2X2':
      return '2m x 2m'
    case 'SIZE_3X3':
      return '3m x 3m'
    case 'SIZE_3X6':
      return '3m x 6m'
    case 'TRAILER':
      return 'Trailer'
    default:
      return value
  }
}

function labelPaymentStatus(status: NonNullable<ExhibitorFairListItem['payment']>['status']) {
  switch (status) {
    case 'PAID':
      return 'Pago'
    case 'PARTIALLY_PAID':
      return 'Parcial'
    case 'PENDING':
      return 'Em aberto'
    case 'OVERDUE':
      return 'Atrasado'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return status
  }
}

function paymentBadgeClass(status: NonNullable<ExhibitorFairListItem['payment']>['status']) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-600 text-white hover:bg-emerald-600'
    case 'PARTIALLY_PAID':
      return 'bg-amber-500 text-white hover:bg-amber-500'
    case 'PENDING':
      return 'bg-slate-600 text-white hover:bg-slate-600'
    case 'OVERDUE':
      return 'bg-red-600 text-white hover:bg-red-600'
    case 'CANCELLED':
      return 'bg-zinc-500 text-white hover:bg-zinc-500'
    default:
      return 'bg-slate-600 text-white hover:bg-slate-600'
  }
}

function formatMoneyBRL(totalCents: number) {
  const value = totalCents / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDateBR(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d)
}
