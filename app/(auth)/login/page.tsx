"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Spinner } from "@/components/ui/spinner"

import { useExhibitorLoginMutation } from "@/app/modules/exhibitor-auth/exhibitor-auth.queries"
import { ExhibitorLoginPayloadSchema } from "@/app/modules/exhibitor-auth/exhibitor-auth.schemas"
import { useAuth } from "@/app/providers/auth-provider"
import { toast } from "@/components/ui/toast"

/**
 * Página de Login do Portal do Expositor.
 *
 * Responsabilidade:
 * - Capturar credenciais
 * - Chamar backend
 * - Persistir sessão (token + owner)
 * - Redirecionar para área interna
 */
export default function LoginPage() {
  const router = useRouter()
  const { setSession } = useAuth()

  const loginMutation = useExhibitorLoginMutation()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const isSubmitting = loginMutation.isPending

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // ✅ Validação local com Zod (mensagem rápida)
    const parsed = ExhibitorLoginPayloadSchema.safeParse({ email, password })
    if (!parsed.success) {
      toast.error({
        title: "Verifique os campos",
        subtitle: parsed.error.issues?.[0]?.message ?? "Dados inválidos.",
      })
      return
    }

    try {
      const res = await loginMutation.mutateAsync(parsed.data)

      setSession(res.accessToken, res.owner)
      router.replace("/dashboard")
    } catch (err: any) {
      toast.error({
        title: "Não foi possível entrar",
        subtitle:
          err?.message ??
          "E-mail ou senha inválidos. Se for seu primeiro acesso, utilize o link de ativação.",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse o portal do expositor para gerenciar suas feiras, barracas e faturamento.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>

              {/* Depois a gente aponta para a página de recuperação (por token) */}
              <Link
                href="/recuperar"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button className="w-full gap-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Entrando
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
