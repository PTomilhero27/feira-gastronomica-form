'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

/**
 * StepProgress (Portal do Expositor)
 *
 * Melhorias:
 * - Responsivo: no mobile vira “chips” com scroll horizontal + contador (Etapa X de Y)
 * - Desktop: mantém linha com conectores e estados mais claros
 * - Visual: ativo com highlight + barra preenchida, concluído com check
 */
export function StepProgress({
  steps,
  currentIndex,
}: {
  steps: { key: string; label: string }[]
  currentIndex: number
}) {
  const total = steps.length
  const safeIndex = Math.max(0, Math.min(currentIndex, total - 1))
  const progressPct = total <= 1 ? 0 : (safeIndex / (total - 1)) * 100

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Header (mobile-friendly) */}
      <div className="flex items-center justify-between gap-4 rounded-t-3xl bg-orange-50 px-5 py-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">
            Etapa <span className="font-extrabold">{safeIndex + 1}</span> de{' '}
            <span className="font-extrabold">{total}</span>
          </div>
        </div>

        <div className="hidden text-xs font-semibold text-zinc-600 sm:block">
          {Math.round(progressPct)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5">
        <div className="relative -mt-2 mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps row (scroll no mobile) */}
      <div className="px-5 pb-5 ">
        <div className="-mx-1 justify-around flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible">
          {steps.map((s, idx) => {
            const isActive = idx === safeIndex
            const isDone = idx < safeIndex
            const isNext = idx === safeIndex + 1

            return (
              <div key={s.key} className="flex shrink-0 items-center gap-2 sm:shrink">
                <StepChip
                  index={idx}
                  label={s.label}
                  isActive={isActive}
                  isDone={isDone}
                  isNext={isNext}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- UI bits ---------------- */

function StepChip({
  index,
  label,
  isActive,
  isDone,
  isNext,
}: {
  index: number
  label: string
  isActive: boolean
  isDone: boolean
  isNext: boolean
}) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-2xl border px-3 py-2 transition',
        // estados
        isDone && 'border-green-200 bg-green-50',
        isActive && 'border-orange-200 bg-orange-50',
        !isDone && !isActive && 'border-zinc-200 bg-white',
        // no mobile parece chip; no desktop pode crescer
        'sm:px-4',
      ].join(' ')}
      aria-current={isActive ? 'step' : undefined}
    >
      <div
        className={[
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold',
          isDone && 'bg-green-600 text-white',
          isActive && 'bg-orange-500 text-white',
          !isDone && !isActive && 'bg-zinc-100 text-zinc-700',
        ].join(' ')}
      >
        {isDone ? <Check className="h-4 w-4" /> : index + 1}
      </div>

      <div className="min-w-0 ">
        <div
          className={[
            'truncate text-sm font-semibold',
            isDone && 'text-green-700',
            isActive && 'text-orange-700',
            !isDone && !isActive && 'text-zinc-700',
          ].join(' ')}
          title={label}
        >
          {label}
        </div>

        {/* micro hint no desktop */}
        <div className="hidden text-[11px] text-zinc-500 sm:block">
          {isDone ? 'Concluído' : isActive ? 'Em andamento' : isNext ? 'Próximo' : 'Pendente'}
        </div>
      </div>
    </div>
  )
}

function Connector({ isDone }: { isDone: boolean }) {
  return (
    <div className="hidden items-center sm:flex">
      <div className={['h-[2px] w-6 rounded-full', isDone ? 'bg-green-300' : 'bg-zinc-200'].join(' ')} />
    </div>
  )
}
