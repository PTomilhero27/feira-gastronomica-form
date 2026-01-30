'use client'

import { cn } from '@/lib/utils'
import { User, MapPin, CreditCard, Check } from 'lucide-react'

type Step = { title: string }

const icons = [User, MapPin, CreditCard]

/**
 * Stepper (mobile-first) com estados:
 * - Atual: primary (igual botão)
 * - Concluído: verde + check
 * - Pendente: cinza
 */
export function Stepper({ current, steps }: { current: number; steps: Step[] }) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-sm font-semibold">
          Etapa {current} de {steps.length}
        </div>
        <div className="text-xs text-muted-foreground">{steps[current - 1]?.title}</div>
      </div>

      <div className="flex items-center justify-center">
        {steps.map((step, idx) => {
          const n = idx + 1
          const isDone = n < current
          const isActive = n === current
          const Icon = icons[idx]

          return (
            <div key={step.title} className="flex items-center">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border transition-all',
                  isDone && 'border-emerald-500 bg-emerald-500 text-white',
                  isActive && 'border-primary bg-primary text-primary-foreground shadow-sm',
                  !isDone && !isActive && 'border-muted bg-muted/40 text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>

              {idx < steps.length - 1 ? (
                <div
                  className={cn(
                    'mx-3 h-[3px] w-12 rounded-full sm:w-16',
                    isDone ? 'bg-emerald-500/70' : isActive ? 'bg-primary/60' : 'bg-muted',
                  )}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
