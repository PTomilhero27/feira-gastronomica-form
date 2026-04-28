'use client'

/**
 * Legenda reutilizável do mapa de espaços.
 *
 * Responsabilidade:
 * - Exibir legenda de cores dos status de slots
 * - Reutilizável em qualquer componente que exiba o mapa
 *
 * Reutilização:
 * - Usado no FairMapViewer e no FutureFairMapPreview
 * - Pode ser usado no admin futuramente
 */

import { Badge } from '@/components/ui/badge'
import {
  SLOT_STATUS_LABELS,
  SLOT_STATUS_COLORS,
  type SlotStatus,
} from '../marketplace.types'

type FairMapLegendProps = {
  /** Contagem de slots por status (opcional, se fornecido exibe contagem) */
  counts?: Partial<Record<SlotStatus, number>>
  className?: string
}

export function FairMapLegend({ counts, className = '' }: FairMapLegendProps) {
  const statuses = Object.keys(SLOT_STATUS_LABELS) as SlotStatus[]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map((status) => {
        const label = SLOT_STATUS_LABELS[status]
        const colors = SLOT_STATUS_COLORS[status]
        const count = counts?.[status]

        return (
          <Badge
            key={status}
            variant="outline"
            className={`gap-1.5 rounded-full text-xs ${colors.text}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors.fill }}
            />
            {label}
            {count != null && (
              <span className="font-semibold ml-0.5">({count})</span>
            )}
          </Badge>
        )
      })}
    </div>
  )
}
