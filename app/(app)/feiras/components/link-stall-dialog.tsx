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
 * Regras aplicadas (UX):
 * - Lista apenas barracas do owner (vem de /stalls)
 * - Esconde barracas já vinculadas nesta feira
 * - Desabilita barracas cujo tamanho não possui mais vagas (slots restantes)
 *
 * Importante:
 * - Mesmo com UX, o backend é quem garante as validações finais.
 * - Aqui a gente só evita frustração e guia o usuário.
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

  const linkedIds = useMemo(() => new Set(fair.linkedStalls.map((s) => s.stallId)), [fair.linkedStalls])

  const purchasedBySize = useMemo(() => {
    const map = new Map<string, number>()
    for (const slot of fair.stallSlots) {
      map.set(slot.stallSize, (map.get(slot.stallSize) ?? 0) + slot.qty)
    }
    return map
  }, [fair.stallSlots])

  const linkedBySize = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of fair.linkedStalls) {
      map.set(s.stallSize, (map.get(s.stallSize) ?? 0) + 1)
    }
    return map
  }, [fair.linkedStalls])

  const remainingBySize = useMemo(() => {
    const map = new Map<string, number>()
    for (const [size, qty] of purchasedBySize.entries()) {
      const used = linkedBySize.get(size) ?? 0
      map.set(size, Math.max(0, qty - used))
    }
    return map
  }, [purchasedBySize, linkedBySize])

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

  async function handleLink(stallId: string) {
    await link.mutateAsync({ fairId: fair.fairId, stallId })
    onOpenChange(false)
    setQ('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setQ('')
      }}
    >
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Vincular barraca</DialogTitle>
          <DialogDescription>
            Escolha uma barraca para participar desta feira. Você só pode vincular a quantidade
            comprada por tamanho (ex.: 3m x 3m).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Input ocupa a largura inteira */}
          <div className="space-y-2">
            <Input
              placeholder="Buscar por nome da barraca ou categoria..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Texto abaixo do input, mais claro e discreto */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Vagas restantes por tamanho:</span>{' '}
              {remainingLabel}
            </div>
          </div>

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

                        {disabled && (
                          <Badge variant="outline" className="border-amber-300/60 text-amber-700">
                            Sem vagas para este tamanho
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {s.mainCategory ? `Categoria: ${s.mainCategory}` : '—'}

                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        onClick={() => handleLink(s.id)}
                        disabled={disabled || link.isPending}
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
