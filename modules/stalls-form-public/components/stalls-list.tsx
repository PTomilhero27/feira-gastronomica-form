'use client'

import { useMemo, useState } from 'react'
import { Stall } from '@/modules/stalls/api/stalls.schema'
import { StallPreviewCard } from './stall-preview-card'
import { Button } from '@/components/ui/button'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Lista de barracas.
 *
 * Responsabilidade:
 * - Renderizar cards de barracas
 * - Exibir empty state
 * - Destacar barracas já vinculadas
 * - Confirmar ações críticas (vincular/desvincular/excluir) via AlertDialog
 * - Repassar intenção confirmada para o pai executar API e refresh
 *
 * Importante:
 * - Não chama API aqui
 * - Apenas confirma intenção e chama callbacks
 */
export function StallsList({
  stalls,
  linkedStallIds,
  onCreate,
  onEdit,

  // ✅ Chamados APÓS confirmação do usuário
  onConfirmLink,
  onConfirmUnlink,
  onConfirmDelete,

  deletingId,
  linkingId,
  unlinkingId,
}: {
  stalls: Stall[]
  linkedStallIds?: string[]

  onCreate: () => void
  onEdit: (stall: Stall) => void

  onConfirmLink: (stall: Stall) => void
  onConfirmUnlink: (stall: Stall) => void
  onConfirmDelete: (stall: Stall) => void

  deletingId?: string | null
  linkingId?: string | null
  unlinkingId?: string | null
}) {
  const linkedSet = useMemo(() => new Set(linkedStallIds ?? []), [linkedStallIds])

  const [linkTarget, setLinkTarget] = useState<Stall | null>(null)
  const [unlinkTarget, setUnlinkTarget] = useState<Stall | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Stall | null>(null)

  const isLinkingDialogOpen = !!linkTarget
  const isUnlinkingDialogOpen = !!unlinkTarget
  const isDeletingDialogOpen = !!deleteTarget

  if (!stalls.length) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
        <h2 className="text-base font-semibold">Você ainda não tem barracas cadastradas</h2>
        <p className="mt-1 text-sm text-zinc-600">Clique em “Criar barraca” para começar.</p>

        <Button variant="default" onClick={onCreate} className="mt-3">
          Criar barraca
        </Button>
      </section>
    )
  }

  // ---------
  // Requests (abre dialog)
  // ---------
  function requestLink(stall: Stall) {
    setLinkTarget(stall)
  }

  function requestUnlink(stall: Stall) {
    setUnlinkTarget(stall)
  }

  function requestDelete(stall: Stall) {
    setDeleteTarget(stall)
  }

  // ---------
  // Confirms (fecha dialog e chama callback)
  // ---------
  function confirmLink() {
    if (!linkTarget) return
    onConfirmLink(linkTarget)
    setLinkTarget(null)
  }

  function confirmUnlink() {
    if (!unlinkTarget) return
    onConfirmUnlink(unlinkTarget)
    setUnlinkTarget(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    onConfirmDelete(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <>
      <section className="space-y-3">
        {stalls.map((stall) => {
          const isLinked = linkedSet.has(stall.id)

          return (
            <StallPreviewCard
              key={stall.id}
              stall={stall}
              selected={isLinked}
              onEdit={() => onEdit(stall)}
              onRequestLink={!isLinked ? () => requestLink(stall) : undefined}
              onRequestUnlink={isLinked ? () => requestUnlink(stall) : undefined}
              onDelete={() => requestDelete(stall)}
              deleting={deletingId === stall.id}
              linking={linkingId === stall.id}
              unlinking={unlinkingId === stall.id}
            />
          )
        })}

        <Button variant="outline" onClick={onCreate} className="w-full">
          Criar barraca
        </Button>
      </section>

      {/* ✅ MODAL: CONFIRMAR VÍNCULO */}
      <AlertDialog open={isLinkingDialogOpen} onOpenChange={(open) => !open && setLinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vincular barraca</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja vincular a barraca <strong>{linkTarget?.pdvName}</strong> a esta feira?
              <br />
              Você poderá desvincular depois, se necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLink} className="bg-emerald-600 hover:bg-emerald-700">
              Vincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ MODAL: CONFIRMAR DESVÍNCULO */}
      <AlertDialog open={isUnlinkingDialogOpen} onOpenChange={(open) => !open && setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular barraca</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desvincular a barraca <strong>{unlinkTarget?.pdvName}</strong> desta feira?
              <br />
              Essa ação não exclui a barraca.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlink} className="bg-amber-600 hover:bg-amber-700">
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ MODAL: CONFIRMAR EXCLUSÃO */}
      <AlertDialog open={isDeletingDialogOpen} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir barraca</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a barraca <strong>{deleteTarget?.pdvName}</strong>?
              <br />
              Essa ação remove a barraca do sistema e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
