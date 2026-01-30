'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAddressByCep } from '@/app/modules/shared/service/cep'
import { toast } from '@/components/ui/toast'
import { MapPin } from 'lucide-react'
import { digitsOnly, UpdateOwnerMeRequest } from '@/app/modules/profile/profile.schema'

/**
 * Aba: Endereço
 *
 * Ajustes pedidos:
 * - Layout mais “arrumado” (CEP + Número + UF na primeira linha)
 * - Busca de CEP automática quando digitar 8 dígitos (sem botão)
 * - Mantém addressFull como "Rua - Bairro (compacto)" por conta do schema atual do Prisma
 */
export function AddressTab(props: {
  draft: UpdateOwnerMeRequest
  set: <K extends keyof UpdateOwnerMeRequest>(key: K, value: UpdateOwnerMeRequest[K]) => void
  isSaving: boolean
}) {
  const { draft, set, isSaving } = props
  const [isCepBusy, setIsCepBusy] = React.useState(false)

  const cepDigits = digitsOnly(draft.zipCode ?? '')
  const lastCepRef = React.useRef<string>('')

  async function lookupCep(cep: string) {
    try {
      setIsCepBusy(true)
      const info = await fetchAddressByCep(cep)

      const compact = [info.street, info.neighborhood].filter(Boolean).join(' - ')

      set('zipCode', cep)
      set('addressFull', compact)
      set('city', info?.city)
      set('state', info.state)

      toast.success({ title: 'CEP encontrado. Endereço preenchido.' })
    } catch (err: any) {
      toast.error({ title: err?.message ?? 'Não foi possível buscar o CEP.' })
    } finally {
      setIsCepBusy(false)
    }
  }

  // ✅ Auto lookup quando tiver 8 dígitos (com debounce)
  React.useEffect(() => {
    if (isSaving) return
    if (cepDigits.length !== 8) return
    if (lastCepRef.current === cepDigits) return

    const t = window.setTimeout(() => {
      lastCepRef.current = cepDigits
      lookupCep(cepDigits)
    }, 450)

    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits, isSaving])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          Endereço
        </CardTitle>
        <CardDescription>
          Esses dados serão usados em contratos e comunicação.
          {isCepBusy ? <span className="ml-2 text-xs text-muted-foreground">Buscando CEP...</span> : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Linha 1 */}
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="zipCode" className="cursor-pointer" onClick={() => document.getElementById('zipCode')?.focus()}>
              CEP
            </Label>
            <Input
              id="zipCode"
              value={draft.zipCode ?? ''}
              onChange={(e) => {
                const d = digitsOnly(e.target.value)
                set('zipCode', d )

                // se usuário apagar/alterar, libera nova busca
                if (d.length !== 8) lastCepRef.current = ''
              }}
              placeholder="01001000"
              disabled={isSaving}
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">Ao digitar 8 dígitos, buscamos automaticamente.</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="addressNumber"
              className="cursor-pointer"
              onClick={() => document.getElementById('addressNumber')?.focus()}
            >
              Número
            </Label>
            <Input
              id="addressNumber"
              value={draft.addressNumber ?? ''}
              onChange={(e) => set('addressNumber', e.target.value )}
              placeholder="100"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="state" className="cursor-pointer" onClick={() => document.getElementById('state')?.focus()}>
              UF
            </Label>
            <Input
              id="state"
              value={draft.state ?? ''}
              onChange={(e) => set('state', (e.target.value || '').toUpperCase())}
              placeholder="SP"
              maxLength={2}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Linha 2 */}
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="city" className="cursor-pointer" onClick={() => document.getElementById('city')?.focus()}>
              Cidade
            </Label>
            <Input
              id="city"
              value={draft.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              disabled={isSaving}
              placeholder="São Paulo"
            />
          </div>

          <div className="space-y-2 sm:col-span-3">
            <Label
              htmlFor="addressFull"
              className="cursor-pointer"
              onClick={() => document.getElementById('addressFull')?.focus()}
            >
              Rua / Bairro (compacto)
            </Label>
            <Input
              id="addressFull"
              value={draft.addressFull ?? ''}
              onChange={(e) => set('addressFull', e.target.value)}
              placeholder="Ex: Rua João Antônio de Moraes - Jardim Sampaio"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Como o sistema usa um campo compacto, você pode ajustar manualmente rua/bairro aqui.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
