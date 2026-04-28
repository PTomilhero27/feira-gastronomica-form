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

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#010077] to-[#122154] p-8 shadow-[0_2px_15px_-3px_rgba(1,0,119,0.3)]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white">Feiras</h1>
          <p className="text-slate-200 text-sm font-medium">
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
          <Card className="rounded-2xl border-red-200 bg-red-50/50 shadow-sm">
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
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-slate-50/50">
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
