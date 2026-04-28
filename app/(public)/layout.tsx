import type { Metadata } from 'next'
import { PublicAppShell } from '@/app/components/public-app-shell'

/**
 * Layout do grupo (public).
 *
 * Responsabilidade:
 * - Páginas acessíveis sem autenticação (ex.: feiras futuras, mapa)
 * - Usar shell público (navbar sem auth guard)
 *
 * Decisão:
 * - Separado do (app) que exige autenticação
 * - Quando o usuário quiser demonstrar interesse, a autenticação é
 *   verificada no componente/ação, não no layout
 */
export const metadata: Metadata = {
  title: 'Feira Gastronômica',
  description: 'Explore feiras gastronômicas e encontre seu espaço ideal.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicAppShell>{children}</PublicAppShell>
}
