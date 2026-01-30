'use client'

import { useUnlinkStallFromFairMutation } from '@/app/modules/exhibitor-fairs/exhibitor-fairs.queries'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

/**
 * Confirmação de desvínculo da barraca.
 *
 * Regra de UX:
 * - Avisar que, para vincular outra, precisa desvincular uma existente
 * - A validação final é do backend (owner + vínculo)
 */
export default function UnlinkStallAlertDialog({
  open,
  onOpenChange,
  fairId,
  stallId,
  stallName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fairId: string
  stallId: string
  stallName: string
}) {
  const unlink = useUnlinkStallFromFairMutation()

  async function handleConfirm() {
    await unlink.mutateAsync({ fairId, stallId })
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desvincular barraca</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a desvincular <span className="font-medium">{stallName}</span> desta feira.
            <br />
            <br />
            Se quiser vincular outra barraca, você precisa desvincular uma existente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-end gap-2">
          <AlertDialogCancel disabled={unlink.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={unlink.isPending}>
            {unlink.isPending ? 'Desvinculando...' : 'Desvincular'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
