'use client'

import { useMemo, useState } from 'react'
import { DocumentStep } from './document-step'
import { WindowStateBanner } from './window-state-banner'
import type { StallsFormContext } from '../api/stalls-form.schemas'
import { StallsStep } from '@/app/(forms)/barraca/components/stalls-step'

/**
 * Fluxo público do cadastro de barracas.
 * Responsabilidade:
 * - Orquestrar etapas (Documento -> Overview/Wizard)
 * - Exibir informações vindas do backend
 *
 * Decisão:
 * - O banner de janela (WindowStateBanner) aparece APENAS no overview.
 * - Ao entrar no wizard (create/edit), escondemos banner e demais infos para foco total.
 */
export function StallsPublicFlow({ fairId }: { fairId: string }) {
  const [context, setContext] = useState<StallsFormContext | null>(null)

  /**
   * Controle de UI do fluxo:
   * - overview: mostra banner + cards + lista/empty
   * - wizard: esconde banner e deixa só o formulário
   */
  const [uiMode, setUiMode] = useState<'overview' | 'wizard'>('overview')

  const hasFairId = useMemo(() => Boolean(fairId?.trim()), [fairId])

  if (!hasFairId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Link inválido</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Este link precisa do parâmetro <span className="font-mono">fairId</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {context && uiMode === 'overview' ?

        <>
          <header className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold">Cadastro de Barracas</h1>
            <p className="text-sm text-zinc-600">
              Informe seu CPF/CNPJ para validar o acesso.
            </p>

            {context?.fair?.name ? (
              <p className="text-xs text-zinc-500">Feira: {context.fair.name}</p>
            ) : null}
          </header>

          <WindowStateBanner context={context} />


        </> : null}


      {!context ? (
        <DocumentStep fairId={fairId} onValidated={setContext} />
      ) : (
        <StallsStep
          context={context}
          onUpdateLocal={(next) => setContext(next)}
          onUiModeChange={(next) => setUiMode(next)}
        />
      )}
    </div>
  )
}
