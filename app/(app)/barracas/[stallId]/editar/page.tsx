'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { useStallDetailQuery, useStallsListQuery } from '@/app/modules/stalls/stalls.queries'
import { Stall } from '@/app/modules/stalls/stalls.schema'
import { getErrorMessage } from '@/app/modules/shared/utils/get-error-message'
import { StallWizard } from '../../components/stall-wizard'

/**
 * Página: Editar Barraca (Portal do Expositor)
 *
 * Responsabilidade:
 * - Carregar a barraca e abrir wizard em modo edit
 * - Ao salvar: voltar para /barracas
 *
 * Observação importante:
 * - Ideal ter GET /stalls/:stallId no backend
 * - Se não existir, cair para cache/list (menos confiável por paginação)
 */
export default function EditStallPage() {
  const router = useRouter()
  const params = useParams<{ stallId: string }>()
  const stallId = params?.stallId

  const listParams = useMemo(() => ({ page: 1, pageSize: 50 }), [])
  const listQuery = useStallsListQuery(listParams)
  const detailQuery = useStallDetailQuery(stallId)

  function logoutAndRedirect() {
    toast.warning({ title: 'Sessão expirada', subtitle: 'Faça login novamente para continuar.' })
    router.replace('/login')
  }

  // 401 handling (se seu api wrapper já faz isso globalmente, pode remover)
  const anyErr: any = detailQuery.error || listQuery.error
  const status = anyErr?.status ?? anyErr?.response?.status
  if ((detailQuery.isError || listQuery.isError) && status === 401) {
    logoutAndRedirect()
    return null
  }

  // Loading
  if (detailQuery.isLoading && listQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-orange-500" />
      </div>
    )
  }

  // Tenta obter a barraca:
  const stallFromDetail = (detailQuery.data as Stall | undefined) // se o endpoint retornar Stall
  const stallFromList = listQuery.data?.items?.find((s) => s.id === stallId)
  const stall = stallFromDetail ?? stallFromList

  if (!stall) {
    // Se houver erro no detail, mostra mensagem mais útil
    const err = detailQuery.error || listQuery.error
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-orange-50 px-6 py-5">
          <h1 className="text-lg font-bold text-zinc-900">Editar barraca</h1>
          <p className="mt-1 text-sm text-zinc-700">Não foi possível carregar a barraca.</p>
        </div>

        <div className="h-px bg-zinc-200" />

        <div className="px-6 py-6">
          <p className="text-sm text-zinc-600">{err ? getErrorMessage(err) : 'Barraca não encontrada.'}</p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                detailQuery.refetch()
                listQuery.refetch()
              }}
              className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Tentar novamente
            </button>

            <button
              type="button"
              onClick={() => router.replace('/barracas')}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Voltar
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-orange-50 px-6 py-5">
          <h1 className="text-lg font-bold text-zinc-900">Editar barraca</h1>
          <p className="mt-1 text-sm text-zinc-700">
            Atualize os dados e salve as alterações.
          </p>
        </div>
      </section>

      <StallWizard
        mode="edit"
        initialStall={stall}
        onCancel={() => router.back()}
        onSaved={() => router.replace('/barracas')}
      />
    </div>
  )
}
