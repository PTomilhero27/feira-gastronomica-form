'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

import { labelStallSize } from './fair-card'
import { ExhibitorFairListItem } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.schema'
import { Stall } from '@/app/modules/stalls/stalls.schema'
import { useLinkStallToFairMutation } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.queries'

/**
 * Dialog para vincular barraca na feira.
 *
 * Atualização (modelo novo):
 * - As "vagas por tamanho" vêm das compras (purchases).
 * - O portal pode (opcionalmente) escolher qual compra (purchaseId) será consumida.
 *
 * Regras aplicadas (UX):
 * - Lista apenas barracas do owner
 * - Esconde barracas já vinculadas nesta feira
 * - Desabilita barracas cujo tamanho não possui compra disponível (remainingQty <= 0)
 */
export default function LinkStallDialog({
  open,
  onOpenChange,
  fair,
  myStalls,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fair: ExhibitorFairListItem
  myStalls: Stall[]
}) {
  const link = useLinkStallToFairMutation()
  const [q, setQ] = useState('')

  /**
   * Estado auxiliar para quando existe mais de uma compra disponível:
   * - usuário escolhe a compra antes de confirmar o vínculo
   */
  const [pending, setPending] = useState<{
    stallId: string
    size: string
    purchaseId: string | null
  } | null>(null)

  const linkedIds = useMemo(() => new Set(fair.linkedStalls.map((s) => s.stallId)), [fair.linkedStalls])

  /**
   * Compras disponíveis por tamanho:
   * - somente purchases com remainingQty > 0
   * - ordenadas por createdAt (backend já retorna asc)
   *
   * Obs.: como o backend não manda createdAt no DTO, usamos a ordem do array.
   */
  const availablePurchasesBySize = useMemo(() => {
    const map = new Map<string, Array<(typeof fair.purchases)[number]>>()

    for (const p of fair.purchases ?? []) {
      if ((p.remainingQty ?? 0) <= 0) continue
      const key = p.stallSize
      const arr = map.get(key) ?? []
      arr.push(p)
      map.set(key, arr)
    }

    return map
  }, [fair.purchases])

  /**
   * Resumo “vagas restantes por tamanho” (para orientar o usuário)
   */
  const remainingBySize = useMemo(() => {
    const map = new Map<string, number>()

    for (const p of fair.purchases ?? []) {
      const key = p.stallSize
      map.set(key, (map.get(key) ?? 0) + (p.remainingQty ?? 0))
    }

    return map
  }, [fair.purchases])

  const remainingLabel = useMemo(() => {
    const parts = Array.from(remainingBySize.entries())
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => `${labelStallSize(size)}: ${qty}`)

    return parts.length ? parts.join(' • ') : '0'
  }, [remainingBySize])

  const candidates = useMemo(() => {
    const lower = q.trim().toLowerCase()

    return (myStalls ?? [])
      .filter((s) => !linkedIds.has(s.id))
      .filter((s) => {
        if (!lower) return true
        return (
          s.pdvName.toLowerCase().includes(lower) ||
          (s.mainCategory ?? '').toLowerCase().includes(lower)
        )
      })
      .sort((a, b) => a.pdvName.localeCompare(b.pdvName))
  }, [myStalls, linkedIds, q])

  async function handleLink(stallId: string, purchaseId?: string) {
    await link.mutateAsync({ fairId: fair.fairId, stallId, purchaseId })
    onOpenChange(false)
    setQ('')
    setPending(null)
  }

  /**
   * Quando o usuário clica em "Vincular":
   * - se só existe 1 purchase disponível para o tamanho, usamos ela automaticamente
   * - se existem várias, pedimos para escolher qual linha consumir
   */
  function handleStartLink(stallId: string, size: string) {
    const options = availablePurchasesBySize.get(size) ?? []
    if (options.length === 0) return

    if (options.length === 1) {
      handleLink(stallId, options[0].id)
      return
    }

    // múltiplas compras disponíveis => usuário escolhe
    setPending({ stallId, size, purchaseId: options[0]?.id ?? null })
  }

  const pendingOptions = useMemo(() => {
    if (!pending) return []
    return availablePurchasesBySize.get(pending.size) ?? []
  }, [pending, availablePurchasesBySize])

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          setQ('')
          setPending(null)
        }
      }}
    >
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Vincular barraca</DialogTitle>
          <DialogDescription>
            Escolha uma barraca para participar desta feira. Você só pode vincular barracas
            cujo tamanho tenha compra disponível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Busca + resumo */}
          <div className="space-y-2">
            <Input
              placeholder="Buscar por nome da barraca ou categoria..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Vagas restantes por tamanho:</span>{' '}
              {remainingLabel}
            </div>
          </div>

          {/* Bloco de seleção de compra (quando necessário) */}
          {pending && (
            <Card className="rounded-xl p-4 border-primary/30 bg-primary/5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium">Escolha a compra para consumir</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tamanho: <span className="font-semibold text-foreground">{labelStallSize(pending.size)}</span>
                    {' • '}
                    Você está vinculando 1 barraca e precisa selecionar qual linha de compra será usada.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => setPending(null)}
                    disabled={link.isPending}
                  >
                    Cancelar
                  </Button>

                  <Button
                    className="rounded-xl"
                    onClick={() => handleLink(pending.stallId, pending.purchaseId ?? undefined)}
                    disabled={link.isPending || !pending.purchaseId}
                  >
                    {link.isPending ? 'Vinculando...' : 'Confirmar vínculo'}
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                {pendingOptions.map((p) => {
                  const selected = p.id === pending.purchaseId
                  const disabled = (p.remainingQty ?? 0) <= 0

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={disabled || link.isPending}
                      onClick={() => setPending((prev) => (prev ? { ...prev, purchaseId: p.id } : prev))}
                      className={[
                        'w-full rounded-xl border p-3 text-left transition',
                        selected ? 'border-primary bg-background' : 'border-border bg-background',
                        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50',
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            Compra #{p.id.slice(-6).toUpperCase()} • {labelStallSize(p.stallSize)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Valor: <span className="font-semibold text-foreground">{formatMoneyBRL(p.totalCents)}</span>
                            {' • '}
                            Entrada: <span className="font-semibold text-foreground">{formatMoneyBRL(p.paidCents)}</span>
                            {' • '}
                            Parcelas: <span className="font-semibold text-foreground">{p.installmentsCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Disponível: {p.remainingQty}</Badge>
                          <Badge className={purchaseStatusBadgeClass(p.status)}>
                            {labelPurchaseStatus(p.status)}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Lista de barracas */}
          {!candidates.length ? (
            <Card className="rounded-xl p-4 text-sm text-muted-foreground">
              Nenhuma barraca disponível para vincular.
              <div className="mt-1">
                Se você já vinculou todas as barracas compradas, desvincule uma para poder trocar.
              </div>
            </Card>
          ) : (
            <div className="grid gap-2">
              {candidates.map((s) => {
                const options = availablePurchasesBySize.get(s.stallSize) ?? []
                const remaining = remainingBySize.get(s.stallSize) ?? 0
                const disabled = remaining <= 0

                return (
                  <Card
                    key={s.id}
                    className="rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium truncate">{s.pdvName}</div>
                        <Badge variant="secondary">{labelStallSize(s.stallSize)}</Badge>

                        {disabled ? (
                          <Badge variant="outline" className="border-amber-300/60 text-amber-700">
                            Sem compra disponível
                          </Badge>
                        ) : options.length > 1 ? (
                          <Badge variant="outline" className="border-indigo-300/60 text-indigo-700">
                            {options.length} compras disponíveis
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {s.mainCategory ? `Categoria: ${s.mainCategory}` : '—'}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        onClick={() => handleStartLink(s.id, s.stallSize)}
                        disabled={disabled || link.isPending || !!pending}
                        className="rounded-xl"
                      >
                        {link.isPending ? 'Vinculando...' : 'Vincular'}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function labelPurchaseStatus(status: ExhibitorFairListItem['purchases'][number]['status']) {
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

function formatMoneyBRL(totalCents: number) {
  const value = (totalCents ?? 0) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
