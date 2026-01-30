'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useMyFairsQuery } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.queries'
import FairCard from './fair-card'
import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'

/**
 * Página de Feiras (Portal do Expositor).
 *
 * Responsabilidade:
 * - Buscar as feiras do expositor na API
 * - Renderizar lista de cards com estados: loading / erro / vazio
 *
 * Decisão:
 * - Mantemos essa página bem “fina”: a regra e a UI detalhada ficam no FairCard.
 */
export default function FairsPage() {
  const { data, isLoading, isError, refetch } = useMyFairsQuery()
  const items = data?.items ?? []
  const hasItems = items.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Feiras' },
        ]}
      />

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Feiras</h1>
          <p className="text-muted-foreground">
            Acompanhe sua participação, pagamento e vincule suas barracas na feira.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        )}

        {isError && (
          <Card className="rounded-2xl border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">Não foi possível carregar suas feiras</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tente novamente. Se persistir, entre em contato com o suporte.
              <div className="mt-3">
                <button
                  className="text-primary underline underline-offset-4"
                  onClick={() => refetch()}
                >
                  Recarregar
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && !hasItems && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Nenhuma feira encontrada</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Quando você for vinculado a uma feira pela organização, ela aparecerá aqui.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && hasItems && (
          <div className="grid gap-4">
            {items.map((fair) => (
              <FairCard key={fair.fairId} fair={fair} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
