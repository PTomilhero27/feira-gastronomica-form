'use client'

/**
 * Hook para verificar autenticação antes de ações protegidas.
 *
 * Responsabilidade:
 * - Checar se o usuário está autenticado
 * - Se não, redirecionar para login com returnUrl
 * - Retornar flag para o componente saber se pode prosseguir
 *
 * Decisão:
 * - NÃO bloqueia a página inteira (como o AuthGuard)
 * - Usado em ações pontuais (ex.: demonstrar interesse)
 * - Redireciona para /login?returnUrl=<página_atual>
 * - Após login, o usuário volta para onde estava
 */

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { toast } from '@/components/ui/toast'

export function useRequireAuth() {
  const { isAuthenticated, isReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Verifica se o usuário está autenticado.
   * Se não, mostra toast e redireciona para login.
   * Retorna true se autenticado, false se não.
   */
  function requireAuth(): boolean {
    if (!isReady) return false

    if (!isAuthenticated) {
      toast.warning({
        title: 'Login necessário',
        subtitle: 'Faça login para demonstrar interesse.',
        duration: 3500,
      })
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/login?returnUrl=${returnUrl}`)
      return false
    }

    return true
  }

  return {
    isAuthenticated,
    isReady,
    requireAuth,
  }
}
