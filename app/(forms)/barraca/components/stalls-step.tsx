'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { getErrorMessage } from '@/modules/shared/utils/get-error-message'
import { stallsPublicService } from '@/modules/stalls/api/stalls.service'
import {
  useSelectStallForFairMutation,
  useStallsDeleteMutation,
  useUnlinkStallFromFairMutation,
} from '@/modules/stalls/api/stalls.queries'
import { StallWizard } from '@/modules/stalls/components/stall-wizard'
import type { Stall } from '@/modules/stalls/api/stalls.schema'
import type { StallsFormContext } from '@/modules/stalls-form-public/api/stalls-form.schemas'
import { StallsSummaryCard } from '@/modules/stalls/components/stalls-summary-card'
import { OwnerInfoDialog } from '@/modules/stalls/components/owner-info-dialog'
import { onlyDigits } from '@/modules/shared/utils/document'
import { StallsList } from '@/modules/stalls-form-public/components/stalls-list'
import type { InterestOwnerForm } from '@/modules/interests/api/interests.schemas'
import { useUpsertOwnerMutation } from '@/modules/interests/api/interests.queries'
import { fetchAddressByCep } from '@/modules/shared/service/cep'

/**
 * Tela pós-validação: resumo + lista + ações.
 *
 * Responsabilidade:
 * - Exibir métricas (compradas vs já vinculadas)
 * - Permitir criar/editar/excluir barracas
 * - Permitir editar informações do owner (modal)
 * - Vincular/Desvincular barraca na feira (select/unlink)
 *
 * Observação:
 * - Confirmações (AlertDialog) ficam na StallsList.
 * - Aqui executamos as mutations (API).
 * - StepProgress agora fica dentro do StallWizard.
 */
export function StallsStep({
  context,
  onUpdateLocal,
  onUiModeChange,
}: {
  context: StallsFormContext
  onUpdateLocal: (next: StallsFormContext) => void
  onUiModeChange?: (next: 'overview' | 'wizard') => void
}) {
  const [mode, setMode] = useState<'overview' | 'create' | 'edit'>('overview')
  const [editing, setEditing] = useState<Stall | null>(null)

  const [ownerInfoOpen, setOwnerInfoOpen] = useState(false)
  const [allOwnerStalls, setAllOwnerStalls] = useState<Stall[]>([])
  const [isLoadingStalls, setIsLoadingStalls] = useState(false)

  const upsertOwner = useUpsertOwnerMutation()

  const owner = context.owner
  const document = owner?.document ?? ''
  const fairId = context.fair.id

  const canRender = useMemo(() => Boolean(document && fairId), [document, fairId])

  const linkedStallIds = context.linkedStallIds ?? []
  const stallsQtyPurchased = context.stallsQty
  const linkedStallsQty = context.linkedStallsQty

  // Excluir barraca do sistema (hard delete)
  const deleteMutation = useStallsDeleteMutation(fairId)
  const deletingId = deleteMutation.isPending ? deleteMutation.variables?.stallId ?? null : null

  // Vincular barraca à feira
  const selectMutation = useSelectStallForFairMutation(fairId)
  const linkingId = selectMutation.isPending ? selectMutation.variables?.stallId ?? null : null

  // Desvincular barraca da feira
  const unlinkMutation = useUnlinkStallFromFairMutation(fairId)
  const unlinkingId = unlinkMutation.isPending ? unlinkMutation.variables?.stallId ?? null : null

  // ---------------------------------------
  // Integração: carregar barracas do owner
  // ---------------------------------------
  async function fetchOwnerStalls() {
    if (!document || !fairId) return
    setIsLoadingStalls(true)

    try {
      const resp = await stallsPublicService.listOwnerStalls(fairId, { document })
      setAllOwnerStalls(resp)
    } catch (err) {
      toast.error({
        title: 'Não foi possível carregar suas barracas',
        subtitle: getErrorMessage(err),
      })
      setAllOwnerStalls([])
    } finally {
      setIsLoadingStalls(false)
    }
  }

  useEffect(() => {
    if (!canRender) return
    fetchOwnerStalls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRender])

  async function refresh() {
    const next = await stallsPublicService.validate(fairId, { document })
    onUpdateLocal(next)
    await fetchOwnerStalls()
  }

  // ---------------------------------------
  // Wizard navigation
  // ---------------------------------------
  function goCreate() {
    setEditing(null)
    setMode('create')
    onUiModeChange?.('wizard')
  }

  function goEdit(stall: Stall) {
    setEditing(stall)
    setMode('edit')
    onUiModeChange?.('wizard')
  }

  function goBackToOverview() {
    setEditing(null)
    setMode('overview')
    onUiModeChange?.('overview')
  }

  async function onDoneWizard() {
    await refresh()
    goBackToOverview()
  }

  // ---------------------------------------
  // ViaCEP: lookup de endereço por CEP
  // ---------------------------------------
  async function lookupCepFn(zipcodeDigits: string) {
    try {
      const zip = onlyDigits(zipcodeDigits)
      if (zip.length !== 8) {
        return { addressFull: '', addressCity: '', addressState: '' }
      }

      const data = await fetchAddressByCep(zip)

      const parts = [data.street, data.neighborhood].filter(Boolean)
      const addressFull = parts.length ? parts.join(' - ') : ''

      return {
        addressFull,
        addressCity: data.city ?? '',
        addressState: data.state ?? '',
      }
    } catch (err) {
      toast.error({
        title: 'CEP não encontrado',
        subtitle: getErrorMessage(err),
      })
      return { addressFull: '', addressCity: '', addressState: '' }
    }
  }

  async function saveOwner(payload: InterestOwnerForm) {
    try {
      await upsertOwner.mutateAsync(payload as any)

      toast.success({
        title: 'Informações atualizadas',
        subtitle: 'Seus dados foram salvos com sucesso.',
      })

      setOwnerInfoOpen(false)
      await refresh()
    } catch (err) {
      toast.error({
        title: 'Não foi possível salvar',
        subtitle: getErrorMessage(err),
      })
    }
  }

  // ---------------------------------------
  // Ações confirmadas (vêm da lista)
  // ---------------------------------------
  async function onConfirmLink(stall: Stall) {
    try {
      await selectMutation.mutateAsync({ document, stallId: stall.id })
      toast.success({
        title: 'Barraca vinculada',
        subtitle: `A barraca "${stall.pdvName}" foi vinculada à feira.`,
      })
      await refresh()
    } catch (err) {
      toast.error({
        title: 'Não foi possível vincular',
        subtitle: getErrorMessage(err),
      })
    }
  }

  async function onConfirmUnlink(stall: Stall) {
    try {
      await unlinkMutation.mutateAsync({ document, stallId: stall.id })
      toast.success({
        title: 'Barraca desvinculada',
        subtitle: `A barraca "${stall.pdvName}" foi desvinculada da feira.`,
      })
      await refresh()
    } catch (err) {
      toast.error({
        title: 'Não foi possível desvincular',
        subtitle: getErrorMessage(err),
      })
    }
  }

  async function onConfirmDelete(stall: Stall) {
    try {
      await deleteMutation.mutateAsync({ stallId: stall.id, input: { document } })
      toast.success({ title: 'Barraca excluída' })
      await refresh()
    } catch (err) {
      toast.error({ title: 'Não foi possível excluir', subtitle: getErrorMessage(err) })
    }
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  if (!canRender) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Contexto inválido</h2>
        <p className="mt-2 text-sm text-zinc-600">Não foi possível identificar documento ou feira.</p>
      </div>
    )
  }

  // MODO WIZARD
  if (mode === 'create' || (mode === 'edit' && editing)) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === 'create' ? 'Criar barraca' : 'Editar barraca'}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">Preencha as etapas e salve no final.</p>
        </div>

        <StallWizard
          fairId={fairId}
          document={document}
          mode={mode === 'create' ? 'create' : 'edit'}
          initialStall={mode === 'edit' ? editing! : undefined}
          onCancel={goBackToOverview}
          onSaved={onDoneWizard}
        />
      </div>
    )
  }

  // MODO OVERVIEW
  return (
    <div className="space-y-4">
      <StallsSummaryCard
        stallsQty={stallsQtyPurchased}
        stallsCount={linkedStallsQty}
        onOpenOwnerInfo={() => setOwnerInfoOpen(true)}
      />

      <OwnerInfoDialog
        open={ownerInfoOpen}
        onOpenChange={setOwnerInfoOpen}
        owner={owner}
        onSave={saveOwner}
        onLookupCep={lookupCepFn}
        isSaving={upsertOwner.isPending}
      />

      {isLoadingStalls ? (
        <div className="rounded-2xl border p-6 text-center">Carregando…</div>
      ) : (
        <StallsList
          stalls={allOwnerStalls}
          linkedStallIds={linkedStallIds}
          onCreate={goCreate}
          onEdit={goEdit}
          onConfirmLink={onConfirmLink}
          onConfirmUnlink={onConfirmUnlink}
          onConfirmDelete={onConfirmDelete}
          deletingId={deletingId}
          linkingId={linkingId}
          unlinkingId={unlinkingId}
        />
      )}
    </div>
  )
}
