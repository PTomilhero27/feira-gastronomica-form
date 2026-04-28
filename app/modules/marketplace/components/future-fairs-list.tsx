'use client'

/**
 * Componente de listagem de feiras futuras.
 *
 * Responsabilidade:
 * - Buscar dados via TanStack Query
 * - Renderizar grid de cards com estados: loading, erro, vazio, lista
 *
 * Decisão:
 * - Componente client por usar hooks
 * - Similar ao padrão do fairs-page.tsx existente
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'

import { useFutureFairsQuery } from '../marketplace.queries'
import { FutureFairCard } from './future-fair-card'
import { FutureFairsListSkeleton } from './marketplace-skeleton'
import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'

export function FutureFairsList() {
  const { data, isLoading, isError, refetch } = useFutureFairsQuery()
  const items = data?.items ?? []
  const hasItems = items.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <AppBreadcrumb
        items={[
          { label: 'Feiras futuras' },
        ]}
      />

      {/* Cabeçalho */}
      <div className="mt-6 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Feiras futuras</h1>
          <p className="text-sm text-muted-foreground">
            Explore as próximas feiras disponíveis, veja o mapa de espaços e demonstre interesse.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mt-6">
        {/* Loading */}
        {isLoading && <FutureFairsListSkeleton />}

        {/* Erro */}
        {isError && (
          <Card className="rounded-2xl border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">
                Não foi possível carregar as feiras futuras
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Tente novamente. Se persistir, entre em contato com o suporte.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2 rounded-xl"
                onClick={() => refetch()}
              >
                <RefreshCcw className="h-4 w-4" />
                Recarregar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vazio */}
        {!isLoading && !isError && !hasItems && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Nenhuma feira futura disponível</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Quando novas feiras forem abertas para inscrição, elas aparecerão aqui.
            </CardContent>
          </Card>
        )}

        {/* Lista */}
        {!isLoading && !isError && hasItems && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((fair) => (
              <FutureFairCard key={fair.id} fair={fair} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
