'use client'

/**
 * Seletor de barraca para o fluxo de interesse.
 *
 * Responsabilidade:
 * - Listar barracas do expositor para escolha
 * - Permitir seguir sem vincular barraca
 *
 * Reutilização:
 * - Componente puro que recebe lista de barracas
 * - Usado como etapa dentro do ExpressInterestFlow
 */

import { Store, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Stall } from '@/app/modules/stalls/stalls.schema'

type SelectStallProps = {
  stalls: Stall[]
  isLoading: boolean
  selectedStallId: string | null
  onSelect: (stallId: string | null) => void
}

/** Labels para tamanhos de barraca */
function labelSize(size: string): string {
  switch (size) {
    case 'CART': return 'Carrinho'
    case 'SIZE_2X2': return '2m x 2m'
    case 'SIZE_3X3': return '3m x 3m'
    case 'SIZE_3X6': return '3m x 6m'
    case 'TRAILER': return 'Trailer'
    default: return size
  }
}

export function SelectStallForInterest({
  stalls,
  isLoading,
  selectedStallId,
  onSelect,
}: SelectStallProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    )
  }

  if (!stalls.length) {
    return (
      <Card className="rounded-xl p-4 text-center">
        <Store className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não tem barracas cadastradas.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Você pode vincular uma barraca depois no painel de feiras.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {/* Opção: sem barraca */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
          selectedStallId === null
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
            : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Store className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">Sem barraca por enquanto</p>
          <p className="text-xs text-muted-foreground">Vincule depois no painel de feiras.</p>
        </div>
        {selectedStallId === null && (
          <Check className="h-5 w-5 shrink-0 text-primary" />
        )}
      </button>

      {/* Lista de barracas */}
      {stalls.map((stall) => {
        const isSelected = selectedStallId === stall.id
        return (
          <button
            key={stall.id}
            type="button"
            onClick={() => onSelect(stall.id)}
            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight truncate">{stall.pdvName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0">
                  {labelSize(stall.stallSize)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stall.teamQty} pessoa{stall.teamQty !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {isSelected && (
              <Check className="h-5 w-5 shrink-0 text-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
