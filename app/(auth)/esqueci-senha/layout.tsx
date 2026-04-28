import type { Metadata } from 'next'

/**
 * Layout da rota /esqueci-senha.
 *
 * Responsabilidade:
 * - Metadata SEO para a página de recuperação de senha
 */
export const metadata: Metadata = {
  title: 'Esqueci minha senha — Feira Gastronômica',
  description: 'Recupere o acesso à sua conta do portal do expositor.',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
