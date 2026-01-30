// app/(app)/barracas/[stallId]/editar/layout.tsx
import type { Metadata } from 'next'

/**
 * Layout da rota /barracas/[stallId]/editar (Portal do Expositor).
 *
 * Responsabilidade:
 * - Definir metadata (server)
 * - Padronizar a casca visual da tela de edição
 * - Manter consistência visual com o portal
 *
 * Observação:
 * - O title aqui é estático por padrão.
 * - Se futuramente quiser o PDV no title, dá para usar generateMetadata com fetch.
 */
export const metadata: Metadata = {
  title: 'Editar barraca | Portal do Expositor',
  description: 'Edite os dados da sua barraca.',
}

export default function EditStallLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">

      {children}
    </div>
  )
}
