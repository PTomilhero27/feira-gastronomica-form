'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { useCampaignQuery } from '@/modules/forms/api/forms.queries'

/**
 * CampaignGuard
 * Responsabilidade:
 * - Carregar a campanha
 * - Bloquear acesso se estiver inativa ou expirada
 *
 * Decisão:
 * - NÃO usa render-prop (função como children) para evitar erro no Next.
 * - Apenas valida e renderiza `children` quando permitido.
 */
export function CampaignGuard({
  campaignId,
  children,
}: {
  campaignId: string
  children: React.ReactNode
}) {
  const { data, isLoading, isError } = useCampaignQuery(campaignId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Card className="rounded-2xl p-4">
          <div className="text-sm font-semibold">Carregando…</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Validando disponibilidade do formulário.
          </div>
        </Card>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Alert>
          <AlertTitle>Link inválido</AlertTitle>
          <AlertDescription>
            Não foi possível carregar este formulário. Verifique o link recebido.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const now = Date.now()
  const endsAt = new Date(data.endsAt).getTime()
  const expired = Number.isFinite(endsAt) && now > endsAt
  const inactive = data.status !== 'ACTIVE'

  if (inactive || expired) {
    return (
      <div className="mx-auto max-w-md p-6">
        <Alert>
          <AlertTitle>Formulário indisponível</AlertTitle>
          <AlertDescription>
            {data.messageClosed?.trim()
              ? data.messageClosed
              : 'Este formulário não está disponível no momento. Procure a organização.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
