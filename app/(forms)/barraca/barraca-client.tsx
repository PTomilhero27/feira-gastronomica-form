'use client'

import { useSearchParams } from 'next/navigation'
import { StallsPublicFlow } from '@/modules/stalls-form-public/components/stalls-public-flow'

/**
 * Camada client responsável por ler a querystring.
 *
 * Responsabilidade:
 * - Ler fairId via useSearchParams()
 * - Renderizar o fluxo público de barracas
 *
 * Por que existe:
 * - useSearchParams exige estar dentro de um Suspense boundary no App Router.
 */
export function BarracaClient() {
  const params = useSearchParams()
  const fairId = (params.get('fairId') ?? '').trim()

  return (
    <main className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <StallsPublicFlow fairId={fairId} />
      </div>
    </main>
  )
}
