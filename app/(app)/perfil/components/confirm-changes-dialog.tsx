'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowRight, Minus, Plus } from 'lucide-react'

export type FieldChange = { label: string; from: string; to: string; key: string }

/**
 * Modal: confirmação de alterações
 * - “Antes” com fundo vermelho fraco
 * - “Depois” com fundo verde fraco
 * - Ícones para reforçar visualmente
 */
export function ConfirmChangesDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  changes: FieldChange[]
  isSaving: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar alterações</DialogTitle>
          <DialogDescription>Revise os campos alterados antes de confirmar.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-3 overflow-auto rounded-md border p-3">
          {props.changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma alteração detectada.</p>
          ) : (
            props.changes.map((c) => (
              <div key={c.key} className="rounded-md border p-3">
                <div className="text-sm font-medium">{c.label}</div>

                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                  <div className="rounded-md bg-red-50 p-2 ring-1 ring-red-100">
                    <div className="flex items-center gap-2 text-xs text-red-700">
                      <Minus className="h-4 w-4" />
                      Antes
                    </div>
                    <div className="mt-1 text-sm text-red-900">
                      {c.from ? c.from : <span className="text-red-400">—</span>}
                    </div>
                  </div>

                  <div className="hidden items-center justify-center sm:flex">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="rounded-md bg-green-50 p-2 ring-1 ring-green-100">
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <Plus className="h-4 w-4" />
                      Depois
                    </div>
                    <div className="mt-1 text-sm text-green-900">
                      {c.to ? c.to : <span className="text-green-400">—</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={props.isSaving}>
            Cancelar
          </Button>
          <Button onClick={props.onConfirm} disabled={props.isSaving || props.changes.length === 0}>
            {props.isSaving ? 'Salvando...' : 'Confirmar e salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
