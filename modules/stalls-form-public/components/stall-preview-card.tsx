'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Stall } from '@/modules/stalls/api/stalls.schema'

/**
 * Card simples para preview da barraca.
 *
 * Responsabilidade:
 * - Mostrar info mínima (PDV + Banner)
 * - Expor ações (Editar / Excluir / Vincular / Solicitar desvinculação)
 * - Destacar visualmente quando já está vinculada à feira
 *
 * Importante:
 * - NÃO executa lógica de confirmação
 * - Apenas emite eventos (intenção do usuário)
 */
export function StallPreviewCard({
  stall,
  selected,
  onEdit,
  onDelete,
  onRequestUnlink,
  onRequestLink,
  deleting,
  linking,
  unlinking,
}: {
  stall: Stall
  selected?: boolean
  onEdit: () => void
  onDelete: () => void

  /** Ações de vínculo são opcionais porque podem ser desabilitadas por tela/fluxo */
  onRequestUnlink?: () => void
  onRequestLink?: () => void

  deleting?: boolean
  linking?: boolean
  unlinking?: boolean
}) {
  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-sm transition-colors',
        selected ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-zinc-200',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Nome interno (PDV)</span>

            {selected && (
              <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                Vinculada
              </Badge>
            )}
          </div>

          <div className="truncate text-base font-semibold text-zinc-900">{stall.pdvName}</div>

          <div className="mt-2 text-xs text-zinc-500">Banner</div>
          <div className="truncate text-sm text-zinc-800">{stall.bannerName || '—'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="default" onClick={onEdit}>
            Editar
          </Button>

          {selected ? (
            <Button
              variant="outline"
              onClick={onRequestUnlink}
              disabled={!onRequestUnlink || unlinking}
              className="border-amber-300 text-amber-700 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50"
            >
              {unlinking ? 'Desvinculando…' : 'Desvincular'}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onRequestLink}
                disabled={!onRequestLink || linking}
                className="border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
              >
                {linking ? 'Vinculando…' : 'Vincular'}
              </Button>

              <Button
                variant="outline"
                onClick={onDelete}
                disabled={deleting}
                className="border-red-200 bg-white text-red-500 hover:border-red-400 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? 'Excluindo…' : 'Excluir'}
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
