/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Card de Barraca (Portal do Expositor)
 *
 * Responsabilidade:
 * - Exibir um resumo visual da barraca (dados principais + métricas)
 * - Expor ações de editar/excluir
 *
 * Ajuste (novo modelo):
 * - Suporte ao tipo/tamanho CART (Carrinho)
 * - UI deve exibir "Carrinho" tanto no Tipo quanto no Tamanho quando aplicável
 */
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

  /**
   * Ajuste UX:
   * - Se for CART, o "tamanho" deve aparecer como Carrinho
   *   (mesmo se a API mandar stallSize vazio em dados legados).
   */
  const resolvedSizeLabel =
    stallType === 'CART' ? 'Carrinho' : formatStallSize(stallSize)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      {/* Indicador de cor superior sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#010077] to-[#254cc9]" />

      <div className="p-5">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#010077]/5 text-[#010077]">
              <Store className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 leading-tight">
                {pdvName || 'Barraca Sem Nome'}
              </h3>
              {bannerName && (
                <p className="mt-0.5 truncate text-sm font-medium text-slate-500">
                  {bannerName}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#010077]"
              aria-label="Editar barraca"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => id && onDelete(id)}
              disabled={!id || Boolean(isDeleting)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Excluir barraca"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Categoria e Tamanho */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {formatStallType(stallType)}
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {resolvedSizeLabel}
          </span>
          {mainCategory && (
            <span className="inline-flex items-center rounded-full bg-[#f5bd2c]/20 px-2.5 py-0.5 text-xs font-bold text-[#010077]">
              {formatCategory(mainCategory)}
            </span>
          )}
        </div>

        {/* Detalhes (Métricas Horizontais) */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CreditCard className="h-3.5 w-3.5" /> Máquinas
              </span>
              <span className="mt-1 font-bold text-slate-900">{machinesQty}</span>
            </div>

            <div className="flex flex-col border-l border-slate-200/60 pl-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users className="h-3.5 w-3.5" /> Equipe
              </span>
              <span className="mt-1 font-bold text-slate-900">{teamQty}</span>
            </div>

            <div className="flex flex-col border-slate-200/60 sm:border-l pl-0 sm:pl-3 pt-3 sm:pt-0 border-t sm:border-t-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <UtensilsCrossed className="h-3.5 w-3.5" /> Cardápio
              </span>
              <span className="mt-1 font-bold text-slate-900">{menuCategoriesCount} cats.</span>
            </div>

            <div className="flex flex-col border-l border-slate-200/60 pl-3 pt-3 sm:pt-0 border-t sm:border-t-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <PlugZap className="h-3.5 w-3.5" /> Infra
              </span>
              <span className="mt-1 font-bold text-slate-900">{infraTitle}</span>
            </div>

          </div>
        </div>

        {/* Equipamentos opcionais */}
        {equipmentsCount > 0 && (
          <div className="mt-3 text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            {equipmentsCount} equipamento(s) • {equipmentsTotalQty} un.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>Criada em {formatDateBR(createdAt)}</span>
        </div>
        {id && <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">#{shortId(id)}</div>}
      </div>
    </article>
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
  if (v === 'CART') return 'Carrinho'
  return v || '—'
}

function formatStallSize(v: string) {
  if (v === 'CART') return 'Carrinho'
  if (v === 'TRAILER') return 'Trailer'
  if (v === 'SIZE_2X2') return '2m × 2m'
  if (v === 'SIZE_3X3') return '3m × 3m'
  if (v === 'SIZE_3X6') return '3m × 6m'
  return v ? v.replace(/_/g, ' ') : '—'
}

function formatCategory(v: string) {
  return v.replace(/_/g, ' ')
}
