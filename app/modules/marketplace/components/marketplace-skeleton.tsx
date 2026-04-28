'use client'

/**
 * Skeletons reutilizáveis do módulo Marketplace.
 *
 * Responsabilidade:
 * - Fornecer feedback visual de carregamento em todas as telas
 * - Manter consistência visual entre estados de loading
 *
 * Decisão:
 * - Componentes skeleton separados para facilitar reuso e manutenção
 * - Cada skeleton replica a estrutura aproximada do componente real
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

// ──────────────────────────────────────────────
// Skeleton: Card de feira futura na listagem
// ──────────────────────────────────────────────

export function FutureFairCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      {/* Imagem de capa */}
      <Skeleton className="h-40 w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Título */}
        <Skeleton className="h-5 w-3/4" />
        {/* Cidade / período */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Descrição curta */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        {/* Botões */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Lista de feiras futuras
// ──────────────────────────────────────────────

export function FutureFairsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <FutureFairCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Hero da feira (página de detalhes)
// ──────────────────────────────────────────────

export function FutureFairHeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <Skeleton className="h-48 sm:h-64 w-full rounded-none" />
      <div className="p-4 sm:p-6 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Seção genérica da feira
// ──────────────────────────────────────────────

export function FutureFairSectionSkeleton() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6 space-y-3">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </Card>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Página de detalhes completa
// ──────────────────────────────────────────────

export function FutureFairDetailSkeleton() {
  return (
    <div className="space-y-6">
      <FutureFairHeroSkeleton />
      <FutureFairSectionSkeleton />
      <FutureFairSectionSkeleton />
      <FutureFairSectionSkeleton />
    </div>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Mapa da feira
// ──────────────────────────────────────────────

export function FairMapSkeleton() {
  return (
    <div className="space-y-4">
      {/* Legenda skeleton */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24 rounded-full" />
        ))}
      </div>
      {/* Mapa skeleton */}
      <Skeleton className="h-[60vh] w-full rounded-2xl" />
    </div>
  )
}

// ──────────────────────────────────────────────
// Skeleton: Slot drawer (detalhes do espaço)
// ──────────────────────────────────────────────

export function SlotDetailsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-24" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  )
}
