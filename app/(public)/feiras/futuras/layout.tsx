import type { Metadata } from 'next'

/**
 * Layout da rota /feiras/futuras (PÚBLICA).
 *
 * Responsabilidade:
 * - Metadata SEO para a seção de feiras futuras
 * - Rota pública (sem autenticação obrigatória)
 *
 * Decisão:
 * - Movida de (app) para (public) para permitir acesso sem login
 * - A autenticação é verificada apenas nas ações protegidas (interesse)
 */
export const metadata: Metadata = {
  title: 'Feiras Futuras | Feira Gastronômica',
  description: 'Explore as próximas feiras disponíveis, veja espaços e demonstre interesse.',
}

export default function FutureFairsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
