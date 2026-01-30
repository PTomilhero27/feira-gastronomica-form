'use client'

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog'

/**
 * AlertDialog exibido quando o expositor já vinculou todas as barracas compradas.
 *
 * Responsabilidade:
 * - Dar feedback imediato (UX)
 * - Explicar que, para trocar barraca, precisa desvincular uma existente
 */
export default function AllLinkedAlertDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você já vinculou todas as barracas</AlertDialogTitle>
          <AlertDialogDescription>
            Para vincular outra barraca nesta feira, você precisa desvincular uma barraca já vinculada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end">
          <AlertDialogAction>Entendi</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
