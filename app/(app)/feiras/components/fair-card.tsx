'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, CreditCard, FileText, PenLine, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
      <Card className={`overflow-hidden rounded-2xl border-slate-200 transition-shadow ${expanded ? 'shadow-md border-t-4 border-t-[#010077]' : 'shadow-sm border-t'}`}>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#010077] truncate">{fair.fairName}</h2>
                <Badge className="bg-[#f5bd2c]/20 text-[#010077] hover:bg-[#f5bd2c]/30 border-none shadow-none text-xs px-2.5">
                  {labelFairStatus(fair.fairStatus)}
                </Badge>
                <Badge variant="outline" className="text-[#010077] border-[#010077]/20 text-xs px-2.5">
                  {labelOwnerFairStatus(fair.ownerFairStatus)}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1.5">
                Acompanhe o status da sua participação, pagamentos e contrato.
              </p>
            </div>

            {/* Ações e recolher */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleClickLink}
                disabled={stallsQuery.isLoading}
                className="rounded-xl bg-[#010077] text-white hover:bg-[#010077]/90 shadow-sm font-semibold"
              >
                Vincular barraca
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl text-[#010077] hover:bg-[#010077]/5"
                  aria-label={expanded ? 'Recolher detalhes da feira' : 'Abrir detalhes da feira'}
                >
                  <span className="font-medium">{expanded ? 'Recolher' : 'Detalhes'}</span>
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${
                      expanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Progresso de barracas (Visível mesmo recolhido) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#010077]/10 text-[#010077]">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between sm:justify-start sm:gap-4 mb-1.5">
                  <span className="text-sm font-semibold text-slate-900">Barracas vinculadas</span>
                  <span className="text-sm font-bold text-[#010077]">{fair.stallsLinkedQty}/{fair.stallsQtyPurchased}</span>
                </div>
                <div className="h-2 w-full sm:w-56 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f5bd2c] transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Divisor em telas grandes */}
            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

            {/* Financeiro rapido */}
            {paymentSummary && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#010077]/10 text-[#010077]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Pagamento</div>
                  <div className="text-sm text-slate-500">
                    <span className="font-bold text-[#010077]">{paymentSummary.paidCount}/{paymentSummary.installmentsCount}</span> parcelas pagas
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2 pb-6">
            <Tabs defaultValue="barracas" className="w-full">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl mb-6 h-auto flex flex-col sm:flex-row w-full sm:w-fit">
                <TabsTrigger value="barracas" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#010077] data-[state=active]:shadow-sm py-2 px-6 text-sm font-semibold transition-all">
                  Operação & Barracas
                </TabsTrigger>
                <TabsTrigger value="financeiro" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#010077] data-[state=active]:shadow-sm py-2 px-6 text-sm font-semibold relative transition-all">
                  Financeiro
                  {dueUrgency === 'OVERDUE' && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  )}
                  {dueUrgency === 'DUE_TODAY' && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="contrato" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#010077] data-[state=active]:shadow-sm py-2 px-6 text-sm font-semibold transition-all">
                  Contrato
                </TabsTrigger>
              </TabsList>

              {/* ABA BARRACAS */}
              <TabsContent value="barracas" className="space-y-4 focus-visible:outline-none">
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="h-4 w-4 text-[#010077]" />
                    <p className="font-semibold text-[#010077]">Tamanhos comprados</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 font-medium">{sizesLabel}</p>
                </div>
                
                {/* O LinkedStallsList já é bonito, podemos mantê-lo aqui */}
                <LinkedStallsList fairId={fair.fairId} linkedStalls={fair.linkedStalls} />
              </TabsContent>

              {/* ABA FINANCEIRO */}
              <TabsContent value="financeiro" className="space-y-4 focus-visible:outline-none">
                {/* Resumo Financeiro */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h3 className="font-semibold text-[#010077] mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Resumo Geral
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                        <span className="text-sm font-medium text-slate-500">Total da compra</span>
                        <span className="font-bold text-slate-900">{formatMoneyBRL(totals.totalCents)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                        <span className="text-sm font-medium text-slate-500">Valor pago</span>
                        <span className="font-bold text-emerald-600">{formatMoneyBRL(totals.paidCents)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-sm font-medium text-slate-500">Em aberto</span>
                        <span className="font-bold text-rose-600">{formatMoneyBRL(totals.remainingCents)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h3 className="font-semibold text-[#010077] mb-4">Próximos vencimentos</h3>
                    {(totals.upcoming?.length ?? 0) === 0 ? (
                      <div className="flex h-[104px] items-center justify-center text-sm font-medium text-slate-400 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed">
                        Nenhuma parcela em aberto no momento.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {totals.upcoming.map((i) => (
                          <div key={`${i.purchaseId}-${i.number}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100/50">
                            <div>
                              <p className="text-sm font-bold text-slate-900">Parcela {i.number}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">Compra #{i.purchaseId.slice(-6).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">{formatMoneyBRL(i.amountCents)}</p>
                              <p className={`text-xs font-semibold mt-0.5 ${
                                isoToYmd(i.dueDate) < todayYmd() ? 'text-red-600' :
                                isoToYmd(i.dueDate) === todayYmd() ? 'text-amber-600' :
                                'text-slate-500'
                              }`}>
                                Vence em {formatDateBRDateOnly(i.dueDate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Compras (Detalhes) */}
                {purchaseRows.length > 0 && (
                  <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                     <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#010077]">Detalhes das Compras</h3>
                      <Badge className="bg-[#f5bd2c]/20 text-[#010077] hover:bg-[#f5bd2c]/30 border-none shadow-none">{purchaseRows.length}</Badge>
                    </div>

                    <div className="grid gap-3">
                      {purchaseRows.map((p) => (
                        <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 hover:border-slate-300 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-[#010077]">Compra #{p.id.slice(-6).toUpperCase()}</span>
                                <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 font-semibold">{labelStallSize(p.stallSize)}</Badge>
                                <Badge className={purchaseStatusBadgeClass(p.status) + " shadow-none font-semibold"}>{labelPaymentStatus(p.status)}</Badge>
                              </div>
                              <p className="text-sm text-slate-600 font-medium">
                                {formatMoneyBRL(p.totalCents)} no total • {formatMoneyBRL(p.remainingCents)} em aberto
                              </p>
                            </div>

                            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-100 text-sm shadow-sm">
                              <div className="flex justify-between gap-6">
                                <span className="text-slate-500 font-medium">Parcelas pagas:</span>
                                <span className="font-bold text-[#010077]">{p.installmentsPaidCount}/{p.installmentsTotalCount}</span>
                              </div>
                              {p.nextDueDate && (
                                <div className="flex justify-between gap-6 mt-1.5 pt-1.5 border-t border-slate-50">
                                  <span className="text-slate-500 font-medium">Próximo venc.:</span>
                                  <span className="font-bold text-slate-900">{formatDateBRDateOnly(p.nextDueDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ABA CONTRATO */}
              <TabsContent value="contrato" className="focus-visible:outline-none">
                <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] max-w-xl mx-auto text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f5bd2c]/15 mb-5 shadow-inner">
                    <FileText className="h-8 w-8 text-[#010077]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#010077]">Contrato de Participação</h3>
                  
                  {!contract ? (
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                      Ainda não há contrato gerado para sua participação nesta feira. Assim que a organização liberar, ele aparecerá aqui e você poderá assiná-lo digitalmente.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-sm border border-slate-200">
                        <span className="text-slate-500 font-medium">Status do documento:</span>
                        <span className="font-bold text-[#010077]">{labelContractStatus(contract.status)}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          type="button"
                          className="w-full sm:w-auto rounded-xl bg-[#010077] text-white hover:bg-[#010077]/90 shadow-sm font-semibold disabled:bg-slate-100 disabled:text-slate-400"
                          disabled={!contract.signUrl}
                          onClick={() => {
                            if (!contract.signUrl) return
                            window.open(contract.signUrl, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          <PenLine className="mr-2 h-4 w-4" />
                          {contract.status === 'SIGNED' ? 'Ver Assinatura' : 'Assinar Contrato'}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300"
                          disabled={!contract.pdfPath}
                          onClick={() => {
                            alert('Download do PDF em breve')
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Dialogs mantidos inalterados */}
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
    case 'CART':
      return 'Carrinho'
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
