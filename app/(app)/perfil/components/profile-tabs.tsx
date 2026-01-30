'use client'

/**
 * Tabs do Perfil.
 *
 * Ajustes pedidos:
 * - Tabs em componente (mantido)
 * - Endereço já faz lookup automático internamente (AddressTab)
 */

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OwnerMe, UpdateOwnerMeRequest } from '@/app/modules/profile/profile.schema'
import { BasicTab } from './profile-basic-tab'
import { AddressTab } from './profile-address-tab'
import { BankTab } from './profile-bank-tab'

export function ProfileTabs(props: {
  original: OwnerMe
  draft: UpdateOwnerMeRequest
  set: <K extends keyof UpdateOwnerMeRequest>(key: K, value: UpdateOwnerMeRequest[K]) => void
  isSaving: boolean
  formatPhoneBR: (input: string) => string
}) {
  const { draft, set, isSaving, formatPhoneBR } = props

  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Informações básicas</TabsTrigger>
        <TabsTrigger value="address">Endereço</TabsTrigger>
        <TabsTrigger value="bank">Financeiro</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicTab draft={draft} set={set} isSaving={isSaving} formatPhoneBR={formatPhoneBR} />
      </TabsContent>

      <TabsContent value="address">
        <AddressTab draft={draft} set={set} isSaving={isSaving} />
      </TabsContent>

      <TabsContent value="bank">
        <BankTab draft={draft} set={set} isSaving={isSaving} />
      </TabsContent>
    </Tabs>
  )
}
