'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useLookupMutation } from '@/modules/forms/api/forms.queries'
import { maskCpfCnpj, onlyDigits } from '@/modules/shared/utils/document'

/**
 * Etapa 1: Documento (CPF/CNPJ).
 * Responsabilidade:
 * - Coletar documento
 * - Consultar backend (lookup)
 * - Redirecionar para seleção de barraca (próxima tela)
 *
 * Regra de negócio (importante):
 * - Se nenhuma barraca estiver ativa na feira, vamos bloquear na próxima tela
 *   e mostrar "procure a organização".
 */
const schema = z.object({
  document: z
    .string()
    .min(11, 'Informe um CPF/CNPJ válido.')
    .refine((v) => {
      const d = onlyDigits(v)
      return d.length === 11 || d.length === 14
    }, 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).'),
})

type FormValues = z.infer<typeof schema>

export function DocumentStep({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const lookup = useLookupMutation(campaignId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { document: '' },
  })

  const documentValue = form.watch('document')

  async function onSubmit(values: FormValues) {
    const res = await lookup.mutateAsync({ document: onlyDigits(values.document) })

    // Guardamos o resultado em sessionStorage para usar na próxima tela sem depender de querystring grande.
    // (Alternativa: passar um token do backend. Depois podemos evoluir.)
    sessionStorage.setItem(
      `campaign:${campaignId}:lookup`,
      JSON.stringify(res),
    )

    router.push(`/forms/${campaignId}/select-stall`)
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold">Cadastro do Expositor</h1>
        <p className="text-sm text-muted-foreground">
          Informe seu CPF/CNPJ para localizar suas barracas nesta feira.
        </p>
      </div>

      <Card className="mt-4 rounded-2xl p-4">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="document">CPF/CNPJ</Label>
            <Input
              id="document"
              inputMode="numeric"
              placeholder="Digite seu CPF ou CNPJ"
              value={documentValue}
              onChange={(e) => form.setValue('document', maskCpfCnpj(e.target.value))}
              disabled={lookup.isPending}
            />
            {form.formState.errors.document ? (
              <p className="text-sm text-red-600">{form.formState.errors.document.message}</p>
            ) : null}
          </div>

          {lookup.isError ? (
            <Alert>
              <AlertTitle>Não foi possível consultar</AlertTitle>
              <AlertDescription>
                Verifique sua conexão e tente novamente. Se persistir, procure a organização.
              </AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={lookup.isPending}>
            {lookup.isPending ? 'Consultando…' : 'Continuar'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        * O formulário pode ficar indisponível após o prazo definido pela organização.
      </p>
    </div>
  )
}
