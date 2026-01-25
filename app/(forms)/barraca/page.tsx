'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { BarracaClient } from './barraca-client'
import { Spinner } from '@/components/ui/spinner'

/**
 * Página pública (100% autenticada pelo "document gate" do fluxo).
 *
 * Responsabilidade:
 * - Fornecer um Suspense boundary obrigatório para hooks de navegação
 *   como useSearchParams (exigência do Next em build/SSR).
 *
 */
export default function BarracaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-zinc-50 text-zinc-900">
          <div className="mx-auto w-full max-w-lg px-4 py-10">
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-700">
              Carregando formulário <Spinner />
            </div>
          </div>
        </main>
      }
    >
      <BarracaClient />
    </Suspense>
  )
}
