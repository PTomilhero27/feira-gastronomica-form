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
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header (mobile-friendly) */}
      <div className="flex items-center justify-between gap-4 bg-slate-50/80 px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            Etapa <span className="font-extrabold text-[#010077]">{safeIndex + 1}</span> de{' '}
            <span className="font-extrabold text-[#010077]">{total}</span>
          </div>
        </div>

        <div className="hidden text-xs font-bold text-slate-500 sm:block">
          {Math.round(progressPct)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5">
        <div className="relative -mt-2 mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
          <div
            className="h-full rounded-full bg-[#010077] transition-all"
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
        'flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all',
        // estados
        isDone && 'border-emerald-200 bg-emerald-50/50',
        isActive && 'border-[#010077]/30 bg-[#010077]/5 shadow-sm',
        !isDone && !isActive && 'border-slate-200 bg-white',
        // no mobile parece chip; no desktop pode crescer
        'sm:px-4',
      ].join(' ')}
      aria-current={isActive ? 'step' : undefined}
    >
      <div
        className={[
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-colors',
          isDone && 'bg-emerald-600 text-white',
          isActive && 'bg-[#010077] text-white shadow-sm',
          !isDone && !isActive && 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {isDone ? <Check className="h-4 w-4" /> : index + 1}
      </div>

      <div className="min-w-0 ">
        <div
          className={[
            'truncate text-sm font-bold',
            isDone && 'text-emerald-700',
            isActive && 'text-[#010077]',
            !isDone && !isActive && 'text-slate-600',
          ].join(' ')}
          title={label}
        >
          {label}
        </div>

        {/* micro hint no desktop */}
        <div className="hidden text-[11px] font-medium text-slate-500 sm:block">
          {isDone ? 'Concluído' : isActive ? 'Em andamento' : isNext ? 'Próximo' : 'Pendente'}
        </div>
      </div>
    </div>
  )
}

function Connector({ isDone }: { isDone: boolean }) {
  return (
    <div className="hidden items-center sm:flex">
      <div className={['h-[2px] w-6 rounded-full', isDone ? 'bg-emerald-300' : 'bg-slate-200'].join(' ')} />
    </div>
  )
}
