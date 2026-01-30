'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { toast } from '@/components/ui/toast'
import { tokenStore } from '@/app/modules/shared/auth/token'
import { StallWizard } from '../../components/stall-wizard'


/**
 * StallCreatePage (Portal do Expositor)
 *
 * Responsabilidade:
 * - Exibir o wizard em modo "create"
 * - Manter layout consistente do portal (header + container)
 * - Controlar navegação de cancelar / finalizar
 *
 * Decisão:
 * - Este componente é client para permitir hooks e navegação.
 * - A casca (metadata/layout) fica no layout.tsx da rota.
 */
export function StallCreatePage() {
  const router = useRouter()

  function goBack() {
    router.push('/barracas')
  }


  return (
    <div className="space-y-6">

      {/* Wizard */}
      <StallWizard
        mode="create"
        onCancel={goBack}
        onSaved={goBack}
      />
    </div>
  )
}
