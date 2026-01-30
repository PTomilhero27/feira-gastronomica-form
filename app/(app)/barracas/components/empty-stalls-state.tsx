// app/(app)/barracas/components/empty-stalls-state.tsx
/**
 * Empty state da listagem de barracas.
 * Responsabilidade: orientar o usuário e dar CTA claro para cadastro.
 */

'use client'

import { useRouter } from 'next/navigation'
import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function EmptyStallsState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-background">
        <Store className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-semibold">Você ainda não cadastrou nenhuma barraca</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Cadastre sua barraca para participar das feiras e manter seu cadastro sempre atualizado.
      </p>

      <div className="mt-6">
        <Button onClick={() => router.push('/barracas/nova')}>
          Cadastrar barraca
        </Button>
      </div>
    </div>
  )
}
