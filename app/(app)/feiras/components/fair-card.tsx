'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, CreditCard, FileText, PenLine, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { useStallsListQuery } from '@/app/modules/stalls/stalls.queries'
import type { ExhibitorFairListItem } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.schema'

import LinkedStallsList from './linked-stalls-list'
import AllLinkedAlertDialog from './all-linked-alert-dialog'
import LinkStallDialog from './link-stall-dialog'

/**
 * Card de uma feira no Portal do Expositor (colapsável).
 *
 * Mudanças aplicadas:
 * - Contrato virou card pequeno (resumo + ações).
 * - Pagamento virou card maior, com informações mais claras e detalhadas.
 * - Removido card "Por barraca (média)".
 * - Corrigido bug de timezone nas datas (dia 4 não vira dia 3).
 * - Badge do topo baseado em vencimento:
 *   - Atrasado (vermelho) se nextDueDate < hoje
 *   - Vence hoje (amarelo) se nextDueDate == hoje
 *   - Em aberto (cinza) se nextDueDate > hoje
 */
export default function FairCard({ fair }: { fair: ExhibitorFairListItem }) {
  const [expanded, setExpanded] = useState(true)
  const [linkOpen, setLinkOpen] = useState(false)
  const [allLinkedOpen, setAllLinkedOpen] = useState(false)

  const stallsQuery = useStallsListQuery({ page: 1, pageSize: 100 })
  const stalls = stallsQuery.data?.items ?? []

  const canLinkMore = fair.stallsLinkedQty < fair.stallsQtyPurchased

  const paymentSummary = fair.paymentSummary ?? null
  const contract = fair.contract ?? null

  // Badge por vencimento (evita timezone e evita marcar atrasado antes da hora)
  const dueUrgency = useMemo(() => {
    return getDueUrgency(paymentSummary?.nextDueDate ?? null)
  }, [paymentSummary?.nextDueDate])

  const progressPct = useMemo(() => {
    if (!fair.stallsQtyPurchased) return 0
    return Math.min(100, Math.round((fair.stallsLinkedQty / fair.stallsQtyPurchased) * 100))
  }, [fair.stallsLinkedQty, fair.stallsQtyPurchased])

  /**
   * Resumo por tamanho (agrega compras por tamanho só para UX).
   * Reforço: compras não são agrupadas no backend; aqui é apenas um “resumo visual”.
   */
  const purchasesBySize = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of fair.purchases ?? []) {
      map.set(p.stallSize, (map.get(p.stallSize) ?? 0) + (p.qty ?? 0))
    }
    return map
  }, [fair.purchases])

  const sizesLabel = useMemo(() => {
    const parts = Array.from(purchasesBySize.entries())
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => `${labelStallSize(size)}: ${qty}`)
    return parts.length ? parts.join(' • ') : '—'
  }, [purchasesBySize])

  /**
   * Calcula “por compra”:
   * - total
   * - pago (entrada + parcelas pagas)
   * - falta
   * - parcelas pagas / total
   * - próximo vencimento
   * - restante disponível (qty - usedQty)
   */
  const purchaseRows = useMemo(() => {
    return (fair.purchases ?? []).map((p) => {
      const installments = Array.isArray(p.installments) ? p.installments : []

      // ⚠️ paidCents no seu fluxo é "entrada". Então somamos parcelas pagas.
      const paidInstallmentsCents = installments.reduce((acc, i) => {
        if (!i.paidAt) return acc
        return acc + (i.paidAmountCents ?? i.amountCents ?? 0)
      }, 0)

      const paidTotalCents = (p.paidCents ?? 0) + paidInstallmentsCents
      const remainingCents = Math.max(0, (p.totalCents ?? 0) - paidTotalCents)

      const totalInstallments = p.installmentsCount ?? 0
      const paidCount = installments.filter((i) => !!i.paidAt).length

      const nextDue = installments
        .filter((i) => !i.paidAt)
        .slice()
        .sort((a, b) => isoDateToComparable(a.dueDate) - isoDateToComparable(b.dueDate))[0]?.dueDate

      const remainingQty = Math.max(0, (p.qty ?? 0) - (p.usedQty ?? 0))

      return {
        ...p,
        installments,
        paidTotalCents,
        remainingCents,
        installmentsPaidCount: paidCount,
        installmentsTotalCount: totalInstallments,
        nextDueDate: nextDue ?? null,
        remainingQty,
      }
    })
  }, [fair.purchases])

  /**
   * Totais do pagamento no nível da feira (somando compras).
   * - total comprado
   * - total pago
   * - total em aberto
   * - próximos vencimentos (top 3)
   */
  const totals = useMemo(() => {
    const totalCents = purchaseRows.reduce((acc, p) => acc + (p.totalCents ?? 0), 0)
    const paidCents = purchaseRows.reduce((acc, p) => acc + (p.paidTotalCents ?? 0), 0)
    const remainingCents = Math.max(0, totalCents - paidCents)

    const upcoming = purchaseRows
      .flatMap((p) =>
        (p.installments ?? []).map((i) => ({
          purchaseId: p.id,
          stallSize: p.stallSize,
          number: i.number,
          dueDate: i.dueDate,
          amountCents: i.amountCents,
          paidAt: i.paidAt ?? null,
        })),
      )
      .filter((i) => !i.paidAt)
      .slice()
      .sort((a, b) => isoDateToComparable(a.dueDate) - isoDateToComparable(b.dueDate))
      .slice(0, 3)

    return { totalCents, paidCents, remainingCents, upcoming }
  }, [purchaseRows])

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
          {/* Header: título/badges + ações */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold truncate">{fair.fairName}</h2>

                <Badge variant="secondary">{labelFairStatus(fair.fairStatus)}</Badge>
                <Badge variant="outline">{labelOwnerFairStatus(fair.ownerFairStatus)}</Badge>

                {/* Badge de “vencimento” (o que o expositor realmente precisa saber) */}
                {paymentSummary?.nextDueDate && (
                  <Badge className={dueUrgencyBadgeClass(dueUrgency)}>
                    {dueUrgencyLabel(dueUrgency)}
                  </Badge>
                )}

                {/* Badge de contrato (opcional) */}
                {contract && (
                  <Badge className={contractBadgeClass(contract.status)}>
                    {labelContractStatus(contract.status)}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Gerencie suas barracas e acompanhe pagamento/contrato desta feira.
              </p>

              {/* Resumo quando recolhido */}
              {!expanded && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 rounded-full">
                    <Store className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">
                      {fair.stallsLinkedQty}/{fair.stallsQtyPurchased}
                    </span>
                    <span className="text-muted-foreground">barracas vinculadas</span>
                  </Badge>

                  {paymentSummary && (
                    <Badge variant="secondary" className="gap-1.5 rounded-full">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">
                        {paymentSummary.paidCount}/{paymentSummary.installmentsCount}
                      </span>
                      <span className="text-muted-foreground">parcelas pagas</span>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
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
            {/* Linha superior: Barracas + Tamanhos + Contrato (compacto) */}
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
                <p className="mt-2 text-sm text-muted-foreground">{sizesLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Resumo por tamanho baseado nas compras cadastradas pela organização.
                </p>
              </div>

              {/* Contrato (compacto) */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Contrato</p>

                {!contract ? (
                  <p className="mt-2 text-sm text-muted-foreground">Ainda não há contrato gerado.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm font-semibold">
                        {labelContractStatus(contract.status)}
                      </span>
                    </div>

                    {contract.signUrl ? (
                      <div className="text-xs text-muted-foreground">Link de assinatura disponível.</div>
                    ) : contract.pdfPath ? (
                      <div className="text-xs text-muted-foreground">PDF emitido.</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Aguardando emissão.</div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="default"
                        className="rounded-xl"
                        disabled={!contract.signUrl}
                        onClick={() => {
                          if (!contract.signUrl) return
                          window.open(contract.signUrl, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        <PenLine className="mr-2 h-4 w-4" />
                        Assinar
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-xl"
                        disabled={!contract.pdfPath}
                        onClick={() => {
                          // ✅ Recomendação: criar endpoint seguro de download no portal.
                          alert('PDF disponível')
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        PDF (em breve)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento (maior e detalhado) */}
            <div className="rounded-2xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Pagamento</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detalhes por barraca (linha de compra). O financeiro é configurado pela organização.
                  </p>
                </div>

                {/* Status/urgência em badge */}
                {paymentSummary?.nextDueDate ? (
                  <Badge className={dueUrgencyBadgeClass(dueUrgency)}>
                    {dueUrgencyLabel(dueUrgency)}
                  </Badge>
                ) : null}
              </div>

              {!paymentSummary && purchaseRows.length === 0 ? (
                <div className="mt-3 text-sm text-muted-foreground">
                  Plano de pagamento ainda não foi configurado pela organização.
                </div>
              ) : (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {/* Total geral */}
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs text-muted-foreground">Total comprado</div>
                    <div className="mt-1 text-lg font-semibold">{formatMoneyBRL(totals.totalCents)}</div>

                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total pago</span>
                        <span className="font-semibold">{formatMoneyBRL(totals.paidCents)}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Em aberto</span>
                        <span className="font-semibold">{formatMoneyBRL(totals.remainingCents)}</span>
                      </div>

                      {paymentSummary?.nextDueDate ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Próximo vencimento</span>
                          <span className="font-semibold">
                            {formatDateBRDateOnly(paymentSummary.nextDueDate)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Próximos vencimentos */}
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs text-muted-foreground">Próximos vencimentos</div>

                    {(totals.upcoming?.length ?? 0) === 0 ? (
                      <div className="mt-2 text-sm text-muted-foreground">Nenhuma parcela em aberto.</div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {totals.upcoming.map((i) => (
                          <div
                            key={`${i.purchaseId}-${i.number}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {labelStallSize(i.stallSize)} • Parcela {i.number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Compra #{i.purchaseId.slice(-6).toUpperCase()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatMoneyBRL(i.amountCents)}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateBRDateOnly(i.dueDate)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linhas (compras) detalhadas */}
              {purchaseRows.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Compras (por barraca)</div>
                    <Badge variant="secondary">{purchaseRows.length}</Badge>
                  </div>

                  <div className="mt-2 grid gap-2">
                    {purchaseRows.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium truncate">
                              Compra #{p.id.slice(-6).toUpperCase()}
                            </div>
                            <Badge variant="secondary">{labelStallSize(p.stallSize)}</Badge>

                            <Badge className={purchaseStatusBadgeClass(p.status)}>
                              {labelPaymentStatus(p.status)}
                            </Badge>

                            <Badge variant="outline" className="rounded-full">
                              Disponível: {p.remainingQty}
                            </Badge>
                          </div>

                          <div className="mt-1 text-xs text-muted-foreground">
                            Total:{' '}
                            <span className="font-semibold text-foreground">
                              {formatMoneyBRL(p.totalCents)}
                            </span>
                            {' • '}
                            Pago:{' '}
                            <span className="font-semibold text-foreground">
                              {formatMoneyBRL(p.paidTotalCents)}
                            </span>
                            {' • '}
                            Falta:{' '}
                            <span className="font-semibold text-foreground">
                              {formatMoneyBRL(p.remainingCents)}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-muted-foreground">
                            Parcelas:{' '}
                            <span className="font-semibold text-foreground">
                              {p.installmentsPaidCount}
                            </span>
                            /
                            <span className="font-semibold text-foreground">
                              {p.installmentsTotalCount}
                            </span>
                            {p.nextDueDate ? (
                              <>
                                {' • '}Próximo venc.:{' '}
                                <span className="font-semibold text-foreground">
                                  {formatDateBRDateOnly(p.nextDueDate)}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Barracas vinculadas */}
            <LinkedStallsList fairId={fair.fairId} linkedStalls={fair.linkedStalls} />

            {/* Dialogs */}
            <LinkStallDialog open={linkOpen} onOpenChange={setLinkOpen} fair={fair} myStalls={stalls} />
            <AllLinkedAlertDialog open={allLinkedOpen} onOpenChange={setAllLinkedOpen} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ------------------------------------------------------
// Labels / badges
// ------------------------------------------------------

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

function labelPaymentStatus(status: ExhibitorFairListItem['purchases'][number]['status']) {
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

function purchaseStatusBadgeClass(status: ExhibitorFairListItem['purchases'][number]['status']) {
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

function labelContractStatus(status: NonNullable<ExhibitorFairListItem['contract']>['status']) {
  switch (status) {
    case 'NOT_ISSUED':
      return 'Não emitido'
    case 'ISSUED':
      return 'Emitido'
    case 'AWAITING_SIGNATURE':
      return 'Aguardando assinatura'
    case 'SIGNED':
      return 'Assinado'
    default:
      return status
  }
}

function contractBadgeClass(status: NonNullable<ExhibitorFairListItem['contract']>['status']) {
  switch (status) {
    case 'SIGNED':
      return 'bg-emerald-600 text-white hover:bg-emerald-600'
    case 'AWAITING_SIGNATURE':
      return 'bg-indigo-600 text-white hover:bg-indigo-600'
    case 'ISSUED':
      return 'bg-slate-700 text-white hover:bg-slate-700'
    case 'NOT_ISSUED':
      return 'bg-zinc-500 text-white hover:bg-zinc-500'
    default:
      return 'bg-slate-700 text-white hover:bg-slate-700'
  }
}

// ------------------------------------------------------
// Due urgency (badge por vencimento) - data pura (sem timezone)
// ------------------------------------------------------

type DueUrgency = 'OVERDUE' | 'DUE_TODAY' | 'OPEN' | 'NONE'

function getDueUrgency(nextDueDateIso: string | null | undefined): DueUrgency {
  if (!nextDueDateIso) return 'NONE'

  const due = isoToYmd(nextDueDateIso)
  const today = todayYmd()

  if (!due) return 'NONE'
  if (due < today) return 'OVERDUE'
  if (due === today) return 'DUE_TODAY'
  return 'OPEN'
}

function dueUrgencyLabel(u: DueUrgency) {
  switch (u) {
    case 'OVERDUE':
      return 'Atrasado'
    case 'DUE_TODAY':
      return 'Vence hoje'
    case 'OPEN':
      return 'Em aberto'
    default:
      return '—'
  }
}

function dueUrgencyBadgeClass(u: DueUrgency) {
  switch (u) {
    case 'OVERDUE':
      return 'bg-red-600 text-white hover:bg-red-600'
    case 'DUE_TODAY':
      return 'bg-amber-500 text-white hover:bg-amber-500'
    case 'OPEN':
      return 'bg-slate-600 text-white hover:bg-slate-600'
    default:
      return 'bg-slate-600 text-white hover:bg-slate-600'
  }
}

// ------------------------------------------------------
// Utils (dinheiro / data)
// ------------------------------------------------------

function formatMoneyBRL(totalCents: number) {
  const value = (totalCents ?? 0) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/**
 * Formata ISO como “data pura” pt-BR evitando bug de timezone.
 * Ex.: "2026-02-04T00:00:00.000Z" não vira dia 03 no Brasil.
 */
function formatDateBRDateOnly(iso: string) {
  if (!iso) return '—'
  const ymd = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '—'

  const [y, m, d] = ymd.split('-').map((n) => Number(n))
  const safeUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(safeUtc)
}

function isoToYmd(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function todayYmd() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Converte ISO em “comparável numérico” baseado em data pura.
 * Evita problemas de timezone nas ordenações.
 */
function isoDateToComparable(iso: string) {
  const ymd = isoToYmd(iso)
  if (!ymd) return Number.MAX_SAFE_INTEGER
  return Number(ymd.replaceAll('-', '')) // ex.: 20260204
}
