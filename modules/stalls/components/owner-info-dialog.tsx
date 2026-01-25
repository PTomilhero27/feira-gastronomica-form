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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { onlyDigits, maskCpfCnpj } from '@/modules/shared/utils/document'

import type {
  InterestOwnerForm,
} from '@/modules/interests/api/interests.schemas'
import {
  interestOwnerFormSchema,
} from '@/modules/interests/api/interests.schemas'

import type { PublicOwner } from '@/modules/stalls-form-public/api/stalls-form.schemas'

import { Identification } from '@/modules/interests/components/steps/identification'
import { Address } from '@/modules/interests/components/steps/address'
import { Financial } from '@/modules/interests/components/steps/financial'

/**
 * OwnerInfoDialog (modal editável)
 *
 * Responsabilidade:
 * - Reutilizar os Steps do wizard público
 * - Editar dados pessoais/financeiros
 * - Documento e personType são read-only
 * - Scroll correto (header/footer fixos)
 */
export function OwnerInfoDialog({
  open,
  onOpenChange,
  owner,
  onSave,
  onLookupCep,
  isSaving = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void


  owner: InterestOwnerForm 

  onSave: (payload: InterestOwnerForm) => Promise<void>

  onLookupCep: (zipcodeDigits: string) => Promise<{
    addressFull: string
    addressCity: string
    addressState: string
  }>

  isSaving?: boolean
}) {
  const [tab, setTab] = React.useState<'ident' | 'address' | 'bank'>('ident')
  const [triedSave, setTriedSave] = React.useState(false)
  const [cepStatus, setCepStatus] =
    React.useState<'idle' | 'loading' | 'error' | 'success'>('idle')

  const [bankHolderTouched, setBankHolderTouched] = React.useState({
    doc: false,
    name: false,
  })

  /**
   * Normaliza o owner parcial para o form completo
   */
  const defaultValues = React.useMemo<InterestOwnerForm>(() => ({
    personType: owner.personType,
    document: owner.document ,
    fullName: owner.fullName ,

    email: owner.email ,
    phone: owner.phone ,

    addressFull: owner.addressFull ,
    addressCity: owner.addressCity ,
    addressState: owner.addressState,
    addressZipcode: owner.addressZipcode,

    pixKey: owner.pixKey,
    bankName: owner.bankName,
    bankAgency: owner.bankAgency,
    bankAccount: owner.bankAccount,
    bankAccountType: owner.bankAccountType,
    bankHolderDoc: owner.bankHolderDoc,
    bankHolderName: owner.bankHolderName,

    stallsDescription: owner.stallsDescription,
  }), [owner])

  const form = useForm<InterestOwnerForm>({
    resolver: zodResolver(interestOwnerFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const isBusy = isSaving

  /**
   * Reset seguro ao abrir
   */
  React.useEffect(() => {
    if (!open) return

    setTab('ident')
    setTriedSave(false)
    setCepStatus('idle')
    setBankHolderTouched({ doc: false, name: false })

    form.reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues])

  const inferredDocType = React.useMemo<'CPF' | 'CNPJ'>(() => {
    const d = onlyDigits(form.watch('document') ?? '')
    return d.length === 14 ? 'CNPJ' : 'CPF'
  }, [form])

  const lockedFields = React.useMemo(
    () => ({ document: true, docType: true }),
    [],
  )

  /**
   * Sincronização automática do titular
   */
  React.useEffect(() => {
    const doc = onlyDigits(form.watch('document') ?? '')
    const name = form.watch('fullName')

    if ((doc.length === 11 || doc.length === 14) && !bankHolderTouched.doc) {
      form.setValue('bankHolderDoc', maskCpfCnpj(doc), { shouldDirty: false })
    }

    if (name?.trim() && !bankHolderTouched.name) {
      form.setValue('bankHolderName', name, { shouldDirty: false })
    }
  }, [
    form,
    bankHolderTouched.doc,
    bankHolderTouched.name,
  ])

  async function tryAutoFillCep(rawCep: string) {
    const digits = onlyDigits(rawCep)
    if (digits.length !== 8) return

    try {
      setCepStatus('loading')
      const data = await onLookupCep(digits)

      form.setValue('addressFull', data.addressFull ?? '', { shouldDirty: true })
      form.setValue('addressCity', data.addressCity ?? '', { shouldDirty: true })
      form.setValue('addressState', data.addressState ?? '', { shouldDirty: true })

      setCepStatus('success')
    } catch {
      setCepStatus('error')
    }
  }

  function showError(_step: 1 | 2 | 3, field: keyof InterestOwnerForm) {
    if (!triedSave) return null
    const err = (form.formState.errors as any)?.[field]?.message
    if (!err) return null
    return <p className="text-sm text-red-600">{String(err)}</p>
  }

  async function handleSave() {
    setTriedSave(true)

    const ok = await form.trigger()
    if (!ok) return

    const values = form.getValues()

    await onSave({
      ...values,
      document: onlyDigits(values.document),
      phone: onlyDigits(values.phone ?? ''),
      addressZipcode: onlyDigits(values.addressZipcode ?? ''),
      bankHolderDoc: onlyDigits(values.bankHolderDoc ?? ''),
    })
  }

  const personBadgeLabel = owner?.personType === 'PJ' ? 'PJ' : 'PF'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0">
        {/* HEADER */}
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            Informações pessoais
            <Badge variant="secondary" className="rounded-full">
              {personBadgeLabel}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ident">Identificação</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="bank">Financeiro</TabsTrigger>
            </TabsList>

            <div className="mt-4 rounded-2xl border bg-card p-4">
              <TabsContent value="ident" className="m-0 space-y-4">
                <Identification
                  form={form}
                  isBusy={isBusy}
                  lockedFields={lockedFields}
                  inferredDocType={inferredDocType}
                  showError={showError}
                />
              </TabsContent>

              <TabsContent value="address" className="m-0 space-y-4">
                <Address
                  form={form}
                  isBusy={isBusy}
                  cepStatus={cepStatus}
                  onCepChange={(raw) => void tryAutoFillCep(raw)}
                  showError={showError}
                  lockAutoFields
                />
              </TabsContent>

              <TabsContent value="bank" className="m-0 space-y-4">
                <Financial
                  form={form}
                  isBusy={isBusy}
                  showError={showError}
                  onBankHolderTouched={(kind) =>
                    setBankHolderTouched((p) => ({ ...p, [kind]: true }))
                  }
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* FOOTER */}
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            Cancelar
          </Button>

          <Button onClick={handleSave} disabled={isBusy}>
            {isBusy ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
