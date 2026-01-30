'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { BankAutocomplete } from '@/app/modules/shared/components/bank-autocomplete'
import { Landmark, Wallet, UserRound } from 'lucide-react'
import { digitsOnly, UpdateOwnerMeRequest } from '@/app/modules/profile/profile.schema'

/**
 * Aba: Financeiro
 *
 * Ajustes pedidos/decisões:
 * - Sem UI de tipo de conta (portal assume CORRENTE)
 * - Sem dígito: "Conta" vai tudo no bankAccount
 * - Labels clicáveis focam no input
 */
export function BankTab(props: {
  draft: UpdateOwnerMeRequest
  set: <K extends keyof UpdateOwnerMeRequest>(key: K, value: UpdateOwnerMeRequest[K]) => void
  isSaving: boolean
}) {
  const { draft, set, isSaving } = props

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-muted-foreground" />
          Financeiro
        </CardTitle>
        <CardDescription>Dados para repasse e conferência.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="pixKey"
            className="flex cursor-pointer items-center gap-2"
            onClick={() => document.getElementById('pixKey')?.focus()}
          >
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Chave Pix
          </Label>
          <Input
            id="pixKey"
            value={draft.pixKey ?? ''}
            onChange={(e) => set('pixKey', e.target.value)}
            placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            Banco
          </Label>
          <BankAutocomplete
            value={draft.bankName ?? ''}
            onChange={(v) => set('bankName', v)}
            disabled={isSaving}
            placeholder="Selecione ou digite seu banco (ex: 341, itaú)..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="bankAgency"
              className="cursor-pointer"
              onClick={() => document.getElementById('bankAgency')?.focus()}
            >
              Agência
            </Label>
            <Input
              id="bankAgency"
              inputMode="numeric"
              placeholder="Ex: 1234"
              value={draft.bankAgency ?? ''}
              onChange={(e) => set('bankAgency', digitsOnly(e.target.value))}
              maxLength={8}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="bankAccount"
              className="cursor-pointer"
              onClick={() => document.getElementById('bankAccount')?.focus()}
            >
              Conta
            </Label>
            <Input
              id="bankAccount"
              inputMode="numeric"
              placeholder="Ex: 1234567"
              value={draft.bankAccount ?? ''}
              onChange={(e) => set('bankAccount', digitsOnly(e.target.value))}
              maxLength={20}
              disabled={isSaving}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="bankHolderDocument"
              className="flex cursor-pointer items-center gap-2"
              onClick={() => document.getElementById('bankHolderDocument')?.focus()}
            >
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Documento do titular
            </Label>
            <Input
              id="bankHolderDocument"
              inputMode="numeric"
              placeholder="CPF/CNPJ do titular"
              value={draft.bankHolderDocument ?? ''}
              onChange={(e) => set('bankHolderDocument', digitsOnly(e.target.value))}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="bankHolderName"
              className="cursor-pointer"
              onClick={() => document.getElementById('bankHolderName')?.focus()}
            >
              Nome do titular
            </Label>
            <Input
              id="bankHolderName"
              placeholder="Nome do titular"
              value={draft.bankHolderName ?? ''}
              onChange={(e) => set('bankHolderName', e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
