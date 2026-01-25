'use client'

import { UserRound } from 'lucide-react'

/**
 * Card de métricas + atalho para "Informações pessoais".
 * Responsabilidade:
 * - Exibir compradas/cadastradas/restantes
 * - Exibir card clicável para abrir o modal de dados pessoais
 */
export function StallsSummaryCard({
  stallsQty,
  stallsCount,
  onOpenOwnerInfo,
}: {
  stallsQty: number
  stallsCount: number
  onOpenOwnerInfo: () => void
}) {
  const remaining = stallsQty - stallsCount

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Barracas compradas" value={stallsQty} />
        <Metric label="Barracas cadastradas" value={stallsCount} />
        <Metric label="Barracas restantes" value={remaining} />

        <ClickableMetric
          label="Informações pessoais"
          onClick={onOpenOwnerInfo}
        />
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  )
}

function ClickableMetric({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-zinc-500">{label}</div>
      </div>

      <div className="mt-2 text-sm font-semibold text-zinc-900">
        Abrir
      </div>
    </button>
  )
}
