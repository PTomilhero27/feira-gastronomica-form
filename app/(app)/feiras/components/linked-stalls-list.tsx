'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { labelStallSize } from './fair-card'
import type { ExhibitorFairLinkedStall } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.schema'

import UnlinkStallAlertDialog from './unlink-stall-alert-dialog'

/**
 * Lista de barracas já vinculadas a uma feira (StallFair).
 *
 * Atualização (modelo novo):
 * - Cada vínculo aponta para uma compra específica (purchaseId).
 * - Mostramos status/valores da compra para o expositor entender
 *   “qual linha do financeiro” aquela barraca está consumindo.
 *
 * Importante:
 * - O portal não altera o financeiro.
 * - Aqui é apenas visual/explicativo + ação de desvincular.
 */
export default function LinkedStallsList({
  fairId,
  linkedStalls,
}: {
  fairId: string
  linkedStalls: ExhibitorFairLinkedStall[]
}) {
  const [unlinkOpen, setUnlinkOpen] = useState(false)
  const [selected, setSelected] = useState<{ stallId: string; stallName: string } | null>(null)

  const hasItems = (linkedStalls?.length ?? 0) > 0

  const sorted = useMemo(() => {
    return (linkedStalls ?? []).slice().sort((a, b) => b.linkedAt.localeCompare(a.linkedAt))
  }, [linkedStalls])

  function handleAskUnlink(item: ExhibitorFairLinkedStall) {
    setSelected({ stallId: item.stallId, stallName: item.pdvName })
    setUnlinkOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Barracas vinculadas</h3>
        <Badge variant="secondary">{linkedStalls.length}</Badge>
      </div>

      {!hasItems ? (
        <Card className="rounded-xl p-4 text-sm text-muted-foreground">
          Nenhuma barraca vinculada ainda. Use “Vincular barraca” para selecionar quais barracas
          participarão.
        </Card>
      ) : (
        <div className="grid gap-2">
          {sorted.map((s) => (
            <Card
              key={s.stallId}
              className="rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium truncate">{s.pdvName}</div>
                  <Badge variant="secondary">{labelStallSize(s.stallSize)}</Badge>

                  {s.purchaseStatus && (
                    <Badge className={purchaseStatusBadgeClass(s.purchaseStatus)}>
                      {labelPurchaseStatus(s.purchaseStatus)}
                    </Badge>
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground space-y-1">
                  <div>
                    Compra:{' '}
                    <span className="font-semibold text-foreground">
                      {s.purchaseId ? `#${s.purchaseId.slice(-6).toUpperCase()}` : '—'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Total:{' '}
                      <span className="font-semibold text-foreground">
                        {s.purchaseTotalCents != null ? formatMoneyBRL(s.purchaseTotalCents) : '—'}
                      </span>
                    </span>

                    <span>•</span>

                    <span>
                      Entrada:{' '}
                      <span className="font-semibold text-foreground">
                        {s.purchasePaidCents != null ? formatMoneyBRL(s.purchasePaidCents) : '—'}
                      </span>
                    </span>

                    <span>•</span>

                    <span>
                      Parcelas:{' '}
                      <span className="font-semibold text-foreground">
                        {s.purchaseInstallmentsCount != null ? s.purchaseInstallmentsCount : '—'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => handleAskUnlink(s)}
                >
                  Desvincular
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UnlinkStallAlertDialog
        open={unlinkOpen}
        onOpenChange={(v) => {
          setUnlinkOpen(v)
          if (!v) setSelected(null)
        }}
        fairId={fairId}
        stallId={selected?.stallId ?? ''}
        stallName={selected?.stallName ?? ''}
      />
    </div>
  )
}

function labelPurchaseStatus(status: NonNullable<ExhibitorFairLinkedStall['purchaseStatus']>) {
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

function purchaseStatusBadgeClass(status: NonNullable<ExhibitorFairLinkedStall['purchaseStatus']>) {
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
