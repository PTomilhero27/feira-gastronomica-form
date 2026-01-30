'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserRound, Phone, ClipboardList } from 'lucide-react'
import { UpdateOwnerMeRequest } from '@/app/modules/profile/profile.schema'

/**
 * Aba: Básico (editável)
 *
 * Ajustes pedidos:
 * - Remove “Tipo” daqui (fica só no bloco Identificação como badge)
 * - Nome + Telefone lado a lado
 * - Telefone formatado na UI (input mostra formatado; set recebe digits)
 * - Textarea: texto/placeholder ajustados
 */
export function BasicTab(props: {
  draft: UpdateOwnerMeRequest
  set: <K extends keyof UpdateOwnerMeRequest>(key: K, value: UpdateOwnerMeRequest[K]) => void
  isSaving: boolean
  formatPhoneBR: (input: string) => string
}) {
  const { draft, set, isSaving, formatPhoneBR } = props

  // UI controlada: mostra formatado, salva dígitos
  const phoneUi = formatPhoneBR(draft.phone ?? '')

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-muted-foreground" />
          Informações básicas
        </CardTitle>
        <CardDescription>Dados principais do expositor.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex cursor-pointer items-center gap-2"
              onClick={() => document.getElementById('name')?.focus()}
            >
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Nome / Razão social
            </Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              disabled={isSaving}
              placeholder="Digite seu nome ou razão social"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="flex cursor-pointer items-center gap-2"
              onClick={() => document.getElementById('phone')?.focus()}
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={phoneUi}
              onChange={(e) => {
                // manda cru; o schema faz digitsOnly no parse, mas aqui já deixamos coerente
                set('phone', e.target.value)
              }}
              disabled={isSaving}
              inputMode="tel"
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-muted-foreground">Usaremos esse contato para comunicação da feira.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="stallsDescription"
            className="flex cursor-pointer items-center gap-2"
            onClick={() => document.getElementById('stallsDescription')?.focus()}
          >
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            Descrição da operação
          </Label>

          <Textarea
            id="stallsDescription"
            className="min-h-28"
            value={draft.stallsDescription ?? ''}
            onChange={(e) => set('stallsDescription', e.target.value)}
            disabled={isSaving}
            placeholder="Descreva brevemente o que você vende e sua estrutura (ex: barraca, food truck, equipamento)."
          />

          <p className="text-xs text-muted-foreground">
            Isso ajuda na triagem e na organização da feira (contratos, mapa, comunicação).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
