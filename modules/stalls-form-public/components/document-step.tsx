'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useStallsValidateMutation } from '../api/stalls-form.queries'
import { onlyDigits, maskCpfCnpj } from '@/modules/shared/utils/document'
import { getErrorMessage } from '@/modules/shared/utils/get-error-message'
import { StallsFormContext, ValidateRequest, validateRequestSchema } from '@/modules/stalls/api/stalls.schema'

/**
 * Etapa 1: validação do documento (CPF/CNPJ) via modal.
 *
 * Regras:
 * - Abre automaticamente ao entrar
 * - Enquanto digita, aplica máscara CPF/CNPJ
 * - Envia para API apenas dígitos (onlyDigits)
 * - Se OK: fecha modal e segue fluxo (onValidated)
 * - Se erro: abre modal de erro com retry
 */
export function DocumentStep({
  fairId,
  onValidated,
}: {
  fairId: string
  onValidated: (ctx: StallsFormContext) => void
}) {
  const mutation = useStallsValidateMutation(fairId)

  type ModalState = 'doc' | 'error' | 'closed'
  const [modal, setModal] = React.useState<ModalState>('doc')
  const [lastErrorMessage, setLastErrorMessage] = React.useState<string>('')

  const form = useForm<ValidateRequest>({
    resolver: zodResolver(validateRequestSchema),
    defaultValues: { document: '' },
    mode: 'onBlur',
  })

  const isBusy = mutation.isPending

  async function handleValidate(values: ValidateRequest) {
    try {
      const ctx = await mutation.mutateAsync({
        document: onlyDigits(values.document),
      })

      setModal('closed')
      onValidated(ctx)
    } catch (err) {
      setLastErrorMessage(getErrorMessage(err))
      setModal('error')
    }
  }

  function retry() {
    mutation.reset()
    setLastErrorMessage('')
    setModal('doc')
  }

  /**
   * Máscara em tempo real (CPF/CNPJ).
   * Decisão:
   * - Usamos setValue para manter o react-hook-form no controle
   * - "shouldDirty" true para refletir alteração
   * - "shouldValidate" opcional: aqui deixo false pra não "pular" erro enquanto digita
   */
  function onDocumentChange(raw: string) {
    const masked = maskCpfCnpj(raw)
    form.setValue('document', masked, { shouldDirty: true, shouldValidate: false })
  }

  const documentValue = form.watch('document')

  return (
    <>
      {/* MODAL 1 — DOCUMENTO */}
      <Dialog open={modal === 'doc'} onOpenChange={() => {}}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Validar acesso</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-zinc-600">
              Informe seu CPF ou CNPJ para liberar o cadastro/edição das barracas.
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-800">CPF ou CNPJ</label>

              <Input
                placeholder="Digite seu CPF/CNPJ"
                inputMode="numeric"
                autoComplete="off"
                disabled={isBusy}
                value={documentValue}
                onChange={(e) => onDocumentChange(e.target.value)}
                onBlur={() => void form.trigger('document')}
              />

              {form.formState.errors.document?.message ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.document.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              onClick={form.handleSubmit(handleValidate)}
              disabled={isBusy}
              className="w-full"
            >
              {isBusy ? 'Validando...' : 'Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2 — ERRO */}
      <Dialog open={modal === 'error'} onOpenChange={() => {}}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Não foi possível validar</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-zinc-600">
              Tivemos um problema ao validar seu documento. Você pode tentar novamente.
            </p>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              {lastErrorMessage || 'Ocorreu um erro inesperado.'}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" onClick={retry} className="w-full">
              Tentar novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
