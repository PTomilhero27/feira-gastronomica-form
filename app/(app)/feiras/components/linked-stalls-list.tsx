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
        <Card className="rounded-xl border-slate-200 border-dashed bg-slate-50/50 p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
          Nenhuma barraca vinculada ainda. Use “Vincular barraca” para selecionar quais barracas
          participarão.
        </Card>
      ) : (
        <div className="grid gap-2">
          {sorted.map((s) => (
            <Card
              key={s.stallId}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-bold text-[#010077] text-base truncate">{s.pdvName}</div>
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 font-semibold">{labelStallSize(s.stallSize)}</Badge>
                    {s.purchaseStatus && (
                      <Badge className={purchaseStatusBadgeClass(s.purchaseStatus) + " shadow-none font-semibold"}>
                        {labelPurchaseStatus(s.purchaseStatus)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-slate-600">
                    Compra: <span className="font-bold text-slate-900">{s.purchaseId ? `#${s.purchaseId.slice(-6).toUpperCase()}` : '—'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                  {/* Info Financeira resumida */}
                  <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm text-sm">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total</span>
                      <span className="font-bold text-slate-900">{s.purchaseTotalCents != null ? formatMoneyBRL(s.purchaseTotalCents) : '—'}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Entrada</span>
                      <span className="font-bold text-emerald-600">{s.purchasePaidCents != null ? formatMoneyBRL(s.purchasePaidCents) : '—'}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Parcelas</span>
                      <span className="font-bold text-[#010077]">{s.purchaseInstallmentsCount != null ? s.purchaseInstallmentsCount : '—'}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="shrink-0 rounded-xl border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                    onClick={() => handleAskUnlink(s)}
                  >
                    Desvincular
                  </Button>
                </div>
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
