'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Card clicável para seleção (radio-like).
 * Responsabilidade:
 * - UX mais fácil no mobile do que radio pequeno
 *
 * Decisão:
 * - Estado "checked" usa primary (mesma identidade do botão)
 */
export function RadioCard({
  checked,
  onClick,
  title,
  subtitle,
  disabled,
}: {
  checked: boolean
  onClick: () => void
  title: string
  subtitle: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition',
        disabled && 'cursor-not-allowed opacity-70',
        checked
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-background hover:border-muted-foreground/30',
      )}
    >
      <div
        className={cn(
          'mt-1 h-4 w-4 rounded-full border',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-background',
        )}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  )
}
