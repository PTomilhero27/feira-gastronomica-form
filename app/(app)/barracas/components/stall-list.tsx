'use client'

import { Stall } from '@/app/modules/stalls/stalls.schema'
import { StallCard } from './stall-card'

type Props = {
  items: Stall[]
  onEdit: (stallId: string) => void
  onDelete: (stallId: string) => void
  isDeleting?: boolean
}

export function StallList({ items, onEdit, onDelete, isDeleting }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((stall) => (
        <StallCard
          key={stall.id}
          stall={stall}
          onEdit={() => onEdit(stall.id)}
          onDelete={() => onDelete(stall.id)}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}
