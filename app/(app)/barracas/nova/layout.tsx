// app/(app)/barracas/nova/layout.tsx
import type { Metadata } from 'next'

/**
 * Layout da rota /barracas/nova (Portal do Expositor).
 *
 * Responsabilidade:
 * - Definir metadata (server)
 * - Padronizar a casca visual da tela de criação
 * - Manter consistência com o layout laranja/branco do portal
 *
 * Decisão:
 * - Layout é server para permitir metadata.
 * - O conteúdo (wizard e hooks) fica no page/client.
 */
export const metadata: Metadata = {
  title: 'Cadastrar barraca | Portal do Expositor',
  description: 'Cadastre uma nova barraca para utilizar nas feiras.',
}

export default function NewStallLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">


      {children}
    </div>
  )
}
