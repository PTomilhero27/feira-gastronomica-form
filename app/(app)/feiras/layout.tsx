import type { Metadata } from 'next'

/**
 * Layout da rota /feiras (Portal do Expositor).
 *
 * Responsabilidade:
 * - Definir metadata da seção
 * - Manter consistente o padrão do projeto (cada página nova com layout.tsx)
 */
export const metadata: Metadata = {
  title: 'Feiras | Portal do Expositor',
  description: 'Acompanhe suas feiras e gerencie o vínculo das suas barracas.',
}

export default function FairsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
