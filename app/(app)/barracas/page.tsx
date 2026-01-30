// app/(app)/barracas/page.tsx
/**
 * Página "Minhas Barracas" (Portal do Expositor).
 *
 * Responsabilidade:
 * - Buscar as barracas do expositor (GET /stalls)
 * - Tratar loading/erro/empty state
 * - Centralizar ações de excluir e navegação para editar/criar
 *
 * Decisões:
 * - A autorização é feita no backend (Owner via User.ownerId)
 * - No front, tratamos apenas UX: spinner, toast e redirect no 401
 */

'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'


import { EmptyStallsState } from './components/empty-stalls-state'
import { StallList } from './components/stall-list'
import { useStallsDeleteMutation, useStallsListQuery } from '@/app/modules/stalls/stalls.queries'
import { tokenStore } from '@/app/modules/shared/auth/token'
import { toast } from '@/components/ui/toast'
import { Stall } from '@/app/modules/stalls/stalls.schema'
import { useAuth } from '@/app/providers/auth-provider'
import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'

export default function StallsPage() {
    const router = useRouter()
    const { clearSession } = useAuth()
    // Você pode evoluir isso para paginação real depois.
    const params = useMemo(() => ({ page: 1, pageSize: 20 }), [])

    const listQuery = useStallsListQuery(params)
    const deleteMutation = useStallsDeleteMutation()

    function handleAuthExpired() {
        // ✅ Padrão do projeto: expiração/invalid token => logout + redirect + toast
        try {
            tokenStore.remove()
            // Se você tiver um event bus/Provider, dispare aqui.
            // Caso não tenha, pode remover authEvents e só fazer replace.
            clearSession()
        } catch {
            // Sem drama: mesmo se falhar, segue o fluxo.
        }

        toast.warning({ title: 'Sua sessão expirou. Faça login novamente.' })
        router.replace('/login')
    }

    async function handleDelete(stallId: string) {
        try {
            await deleteMutation.mutateAsync(stallId)
            toast.success({ title: 'Barraca excluída com sucesso.' })
        } catch (err: any) {
            // Se seu api centralizado já joga 401 padronizado, capture aqui.
            const status = err?.status ?? err?.response?.status
            if (status === 401) return handleAuthExpired()

            toast.error(err?.message ?? 'Não foi possível excluir a barraca.')
        }
    }

    // ✅ Loading (Spinner, não "...")
    if (listQuery.isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner />
            </div>
        )
    }

    // ✅ Erro (inclui 401)
    if (listQuery.isError) {
        const err: any = listQuery.error
        const status = err?.status ?? err?.response?.status
        if (status === 401) handleAuthExpired()

        return (
            <div className="space-y-4">
                <h1 className="text-xl font-semibold">Minhas Barracas</h1>

                <div className="rounded-xl border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Não foi possível carregar suas barracas. Tente novamente.
                    </p>

                    <div className="mt-4 flex gap-2">
                        <Button onClick={() => listQuery.refetch()} disabled={listQuery.isFetching}>
                            Recarregar
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const items: Stall[] = listQuery.data?.items ?? []

    return (
        <div className="space-y-6">

            <AppBreadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Barracas" },
                ]}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Minhas Barracas</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie as barracas cadastradas no seu perfil.
                    </p>
                </div>

                <Button onClick={() => router.push('/barracas/nova')}>
                    Cadastrar barraca
                </Button>
            </div>

            {items.length === 0 ? (
                <EmptyStallsState />
            ) : (
                <StallList
                    items={items}
                    onEdit={(id) => router.push(`/barracas/${id}/editar`)}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                />
            )}
        </div>
    )
}
