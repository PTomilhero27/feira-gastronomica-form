'use client'

import * as React from 'react'
import {
  Store,
  Pencil,
  Trash2,
  CreditCard,
  Users,
  PlugZap,
  UtensilsCrossed,
  Calendar,
} from 'lucide-react'

import type { Stall } from '@/app/modules/stalls/stalls.schema'

export function StallCard({
  stall,
  onEdit,
  onDelete,
  isDeleting,
}: {
  stall: Stall
  onEdit: () => void
  onDelete: (stallId: string) => void
  isDeleting?: boolean
}) {
  const id = stall?.id

  const pdvName = stall?.pdvName ?? ''
  const bannerName = stall?.bannerName ?? ''
  const machinesQty = Number(stall?.machinesQty ?? 0)
  const teamQty = Number(stall?.teamQty ?? 0)

  const stallType = (stall?.stallType ?? '') as string
  const stallSize = (stall?.stallSize ?? '') as string
  const mainCategory = (stall?.mainCategory ?? '') as string

  const categories = (stall?.categories ?? []) as any[]
  const menuCategoriesCount = categories.length

  const equipments = (stall?.equipments ?? []) as any[]
  const equipmentsCount = equipments.length
  const equipmentsTotalQty = equipments.reduce((acc, it) => acc + (Number(it?.qty ?? 0) || 0), 0)

  const powerNeed = (stall?.powerNeed ?? null) as
    | null
    | {
      outlets110?: number
      outlets220?: number
      outletsOther?: number
      needsGas?: boolean
      gasNotes?: string | null
      notes?: string | null
    }

  const totalOutlets =
    Number(powerNeed?.outlets110 ?? 0) +
    Number(powerNeed?.outlets220 ?? 0) +
    Number(powerNeed?.outletsOther ?? 0)

  const hasEnergy = totalOutlets > 0

  const createdAt = stall?.createdAt

  // infra text (mais clean)
  const infraTitle = hasEnergy ? 'Energia' : 'Sem energia'


  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Top */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Store className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-zinc-900">{pdvName || 'Barraca'}</div>
            <div className="mt-0.5 truncate text-sm text-zinc-600">{bannerName || '—'}</div>


          </div>
        </div>



        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className={[
              'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white',
              'text-zinc-700 shadow-sm transition',
              // ✅ hover laranja (igual “clima” do delete, mas orange)
              'hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700',
              'focus:outline-none focus:ring-4 focus:ring-orange-100',
            ].join(' ')}
            aria-label="Editar barraca"
            title="Editar"
          >
            <Pencil className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => id && onDelete(id)}
            disabled={!id || Boolean(isDeleting)}
            className={[
              'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white',
              'text-zinc-700 shadow-sm transition',
              'hover:border-red-200 hover:bg-red-50 hover:text-red-700',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus:outline-none focus:ring-4 focus:ring-red-100',
            ].join(' ')}
            aria-label="Excluir barraca"
            title="Excluir"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

      </div>
        {/* Pills full width */}
        <div className="w-full px-5 mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Pill>{formatStallType(stallType)}</Pill>
          <Pill>{formatStallSize(stallSize)}</Pill>
          <Pill tone="orange">{mainCategory ? formatCategory(mainCategory) : '—'}</Pill>
        </div>

      {/* Divider */}
      <div className="mt-5 h-px bg-zinc-200" />

      {/* Metrics */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Máquinas"
            icon={<CreditCard className="h-5 w-5" />}
            value={String(machinesQty)}
            subtitle=""
          />

          <MetricCard
            title="Equipe"
            icon={<Users className="h-5 w-5" />}
            value={String(teamQty)}
            subtitle=""
          />

          <MetricCard
            title="Infra"
            icon={<PlugZap className="h-5 w-5" />}
            value={infraTitle}
            subtitle={""}
          />

          <MetricCard
            title="Cardápio"
            icon={<UtensilsCrossed className="h-5 w-5" />}
            value={String(menuCategoriesCount)}
            subtitle=""
          />
        </div>

        {/* opcional: detalhe extra, bem clean */}
        {equipmentsCount > 0 ? (
          <div className="mt-3 text-xs text-zinc-500">
            {equipmentsCount} item(ns) cadastrado(s)
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Calendar className="h-4 w-4" />
          <span>Criada em {formatDateBR(createdAt)}</span>
        </div>

        {id ? <div className="text-xs font-semibold text-zinc-500">ID #{shortId(id)}</div> : null}
      </div>
    </article>
  )
}

/* ---------------- UI ---------------- */

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'orange'
}) {
  const cls =
    tone === 'orange'
      ? 'border-orange-200 bg-orange-50 text-orange-700'
      : 'border-zinc-200 bg-white text-zinc-800'

  return (
    <span
      className={[
        'inline-flex w-full items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold',
        cls,
      ].join(' ')}
    >
      <span className="truncate">{children}</span>
    </span>
  )
}

function MetricCard({
  title,
  icon,
  value,
  subtitle,
}: {
  title: string
  icon: React.ReactNode
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-700">{title}</div>
          <div className="mt-2 truncate text-lg font-extrabold text-zinc-900">{value}</div>
          <div className="mt-1 line-clamp-2 text-sm text-zinc-600">{subtitle}</div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          {icon}
        </div>
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function shortId(id: string) {
  const clean = String(id || '').trim()
  if (clean.length <= 6) return clean.toUpperCase()
  return clean.slice(-6).toUpperCase()
}

function formatDateBR(d?: string | Date) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

function formatStallType(v: string) {
  if (v === 'OPEN') return 'Aberta'
  if (v === 'CLOSED') return 'Fechada'
  if (v === 'TRAILER') return 'Trailer'
  return v || '—'
}

function formatStallSize(v: string) {
  if (v === 'TRAILER') return 'Trailer'
  if (v === 'SIZE_2X2') return '2m × 2m'
  if (v === 'SIZE_3X3') return '3m × 3m'
  if (v === 'SIZE_3X6') return '3m × 6m'
  return v ? v.replace(/_/g, ' ') : '—'
}

function formatCategory(v: string) {
  return v.replace(/_/g, ' ')
}
