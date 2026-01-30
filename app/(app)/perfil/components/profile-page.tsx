'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { IdCard, Mail, ShieldCheck } from 'lucide-react'

import { ProfileTabs } from './profile-tabs'
import { OwnerMe, UpdateOwnerMeRequest, updateOwnerMeSchema, digitsOnly } from '@/app/modules/profile/profile.schema'
import { useProfileMeQuery, useProfileUpdateMeMutation } from '@/app/modules/profile/profile.queries'
import { formatZodError } from '@/app/modules/profile/profile.zod.erro'
import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'

type OwnerMeDraft = UpdateOwnerMeRequest & {
  personType: OwnerMe['personType'] // só para UI/badge
}

type FieldChange = { label: string; from: string; to: string; key: keyof UpdateOwnerMeRequest }

const FIELD_LABELS: Record<keyof UpdateOwnerMeRequest, string> = {
  name: 'Nome / Razão social',
  phone: 'Telefone',
  stallsDescription: 'Descrição da operação',

  zipCode: 'CEP',
  addressNumber: 'Número',
  state: 'UF',
  city: 'Cidade',
  addressFull: 'Rua / Bairro (compacto)',

  pixKey: 'Chave Pix',
  bankAccountType: 'Tipo de conta',
  bankName: 'Banco',
  bankAgency: 'Agência',
  bankAccount: 'Conta',
  bankHolderName: 'Nome do titular',
  bankHolderDocument: 'Documento do titular',
}

const EDITABLE_KEYS = Object.keys(FIELD_LABELS) as Array<keyof UpdateOwnerMeRequest>

function s(v: unknown) {
  if (v == null) return ''
  return String(v)
}

function normalizeForCompare(value: unknown) {
  const text = s(value).trim()
  return text === '' ? '' : text
}

export function formatPhoneBR(input: string) {
  const d = digitsOnly(input || '')
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

/**
 * Monta draft SEM NULOS (regra: nunca vazio)
 * - bankAccountType default: CORRENTE
 * - titular default: nome/documento
 */
function buildDraftFromOwner(o: OwnerMe): OwnerMeDraft {
  const name = (o.name ?? '').trim()
  const phone = digitsOnly(o.phone ?? '')
  const stallsDescription = (o.stallsDescription ?? '').trim()

  const zipCode = digitsOnly(o.zipCode ?? '')
  const addressFull = (o.addressFull ?? '').trim()
  const addressNumber = (o.addressNumber ?? '').trim()
  const city = (o.city ?? '').trim()
  const state = (o.state ?? '').trim().toUpperCase()

  const pixKey = (o.pixKey ?? '').trim()
  const bankName = (o.bankName ?? '').trim()
  const bankAgency = digitsOnly(o.bankAgency ?? '')
  const bankAccount = digitsOnly(o.bankAccount ?? '')

  const bankHolderName = (o.bankHolderName ?? name).trim()
  const bankHolderDocument = digitsOnly(o.bankHolderDocument ?? o.document ?? '')

  return {
    personType: o.personType,

    name,
    phone,
    stallsDescription,

    zipCode,
    state,
    city,
    addressNumber,
    addressFull,

    pixKey,

    bankAccountType: 'CORRENTE',
    bankName,
    bankAgency,
    bankAccount,

    bankHolderName,
    bankHolderDocument,
  }
}

/**
 * A regra final agora é: nunca pode vazio.
 * Então o “primeiro preenchimento” vira só uma UX (banner),
 * porque a validação já impede salvar com campo vazio sempre.
 */
function isDraftValid(draft: OwnerMeDraft) {
  try {
    updateOwnerMeSchema.parse(draft)
    return true
  } catch {
    return false
  }
}

function computeChanges(original: OwnerMe, draft: OwnerMeDraft): FieldChange[] {
  const changes: FieldChange[] = []

  for (const key of EDITABLE_KEYS) {
    if (key === 'bankAccountType') continue // sempre CORRENTE no portal

    const label = FIELD_LABELS[key] ?? String(key)

    const fromRaw = (original as any)[key]
    const toRaw = (draft as any)[key]

    const from = normalizeForCompare(fromRaw)
    const to = normalizeForCompare(toRaw)

    if (from !== to) changes.push({ key, label, from, to })
  }

  return changes
}

export function ProfilePage() {
  const meQuery = useProfileMeQuery()
  const updateMutation = useProfileUpdateMeMutation()

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [original, setOriginal] = React.useState<OwnerMe | null>(null)
  const [draft, setDraft] = React.useState<OwnerMeDraft | null>(null)

  React.useEffect(() => {
    if (!meQuery.data) return
    const o = meQuery.data
    setOriginal(o)
    setDraft(buildDraftFromOwner(o))
  }, [meQuery.data])

  const isLoading = meQuery.isLoading
  const isSaving = updateMutation.isPending

  if (isLoading || !original || !draft) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
        <header className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-96" />
        </header>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const changes = computeChanges(original, draft)
  const hasChanges = changes.length > 0

  // Regra final: nunca vazio. Então só deixa salvar se:
  // - tem mudanças
  // - e o draft passa no schema
  const canSave = hasChanges && isDraftValid(draft)

  function set<K extends keyof UpdateOwnerMeRequest>(key: K, value: UpdateOwnerMeRequest[K]) {
    setDraft((prev) => {
      if (!prev) return prev
      return { ...prev, [key]: value }
    })
  }

  function onCancelChanges() {
    setDraft(buildDraftFromOwner(original!))
    toast.warning({ title: 'Alterações desfeitas.' })
  }

  function onOpenConfirm() {
    try {
      updateOwnerMeSchema.parse(draft)
      setConfirmOpen(true)
    } catch (err) {
      const f = formatZodError(err)
      toast.error({ title: `${f.title}: ${f.message}` })
    }
  }

  async function onConfirmSave() {
    try {
      // payload do PATCH (sem personType)
      const payload = updateOwnerMeSchema.parse(draft)
      payload.bankAccountType = 'CORRENTE'

      const updated = await updateMutation.mutateAsync(payload)

      setOriginal(updated)
      setDraft(buildDraftFromOwner(updated))
      setConfirmOpen(false)

      toast.success({ title: 'Dados atualizados com sucesso.' })
    } catch (err) {
      const f = formatZodError(err)
      toast.error({ title: `${f.title}: ${f.message}` })
    }
  }

  const personLabel = original.personType === 'PJ' ? 'Pessoa Jurídica (PJ)' : 'Pessoa Física (PF)'

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">

      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Perfil" },
        ]}
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Atualize seus dados cadastrais. Documento, e-mail e tipo de pessoa são somente leitura.
        </p>

        <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          Para salvar, <b>nenhum campo pode ficar vazio</b>.
        </div>
      </header>

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Identificação
          </CardTitle>
          <CardDescription>Campos que não podem ser alterados pelo portal.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Documento</span>
              <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-500">
                {personLabel}
              </Badge>
            </div>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">{original.document}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">E-mail</span>
              <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-500">Somente leitura</Badge>
            </div>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">{original.email ?? '—'}</div>
          </div>

        </CardContent>
      </Card>

      <ProfileTabs original={original} draft={draft} set={set} isSaving={isSaving} formatPhoneBR={formatPhoneBR} />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {hasChanges ? <span>{changes.length} alteração(ões) pendente(s).</span> : <span>Nenhuma alteração pendente.</span>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onCancelChanges} disabled={!hasChanges || isSaving}>
            Desfazer
          </Button>

          <Button onClick={onOpenConfirm} disabled={!canSave || isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <ConfirmChangesDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        changes={changes}
        isSaving={isSaving}
        onConfirm={onConfirmSave}
      />
    </div>
  )
}

function ConfirmChangesDialog(props: {
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

        <div className="max-h-[50vh] space-y-3 overflow-auto rounded-md border p-3">
          {props.changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma alteração detectada.</p>
          ) : (
            props.changes.map((c) => (
              <div key={String(c.key)} className="rounded-md border p-3">
                <div className="text-sm font-medium">{c.label}</div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-red-100 bg-red-50 p-2">
                    <div className="text-xs text-red-700">Antes</div>
                    <div className="text-sm text-red-900">{c.from || <span className="text-red-700/70">—</span>}</div>
                  </div>

                  <div className="rounded-md border border-green-100 bg-green-50 p-2">
                    <div className="text-xs text-green-700">Depois</div>
                    <div className="text-sm text-green-900">{c.to || <span className="text-green-700/70">—</span>}</div>
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
