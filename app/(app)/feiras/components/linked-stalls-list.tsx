'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { labelStallSize } from './fair-card'
import { useState } from 'react'
import UnlinkStallAlertDialog from './unlink-stall-alert-dialog'
import { ExhibitorFairLinkedStall } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.schema'

/**
 * Lista as barracas já vinculadas à feira.
 *
 * Responsabilidade:
 * - Exibir barracas vinculadas e permitir desvincular (com confirmação)
 * - Reforçar o comportamento de "troca": desvincula uma para vincular outra
 */
export default function LinkedStallsList({
  fairId,
  linkedStalls,
}: {
  fairId: string
  linkedStalls: ExhibitorFairLinkedStall[]
}) {
  const [toUnlink, setToUnlink] = useState<null | { stallId: string; pdvName: string }>(null)

  if (!linkedStalls?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma barraca vinculada ainda. Use o botão “Vincular barraca”.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Barracas vinculadas</div>

      <div className="grid gap-2">
        {linkedStalls.map((s) => (
          <Card key={s.stallId} className="p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium truncate">{s.pdvName}</div>
                <Badge variant="secondary">{labelStallSize(s.stallSize)}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Vinculada em: {new Date(s.linkedAt).toLocaleString()}
              </div>
            </div>

          </Card>
        ))}
      </div>

      <UnlinkStallAlertDialog
        open={Boolean(toUnlink)}
        onOpenChange={(v) => !v && setToUnlink(null)}
        fairId={fairId}
        stallId={toUnlink?.stallId ?? ''}
        stallName={toUnlink?.pdvName ?? ''}
      />
    </div>
  )
}
