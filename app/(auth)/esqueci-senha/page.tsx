"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import { useForgotPasswordMutation } from "@/app/modules/exhibitor-auth/exhibitor-auth.queries"
import { ForgotPasswordPayloadSchema } from "@/app/modules/exhibitor-auth/exhibitor-auth.schemas"
import { toast } from "@/components/ui/toast"

/**
 * Página de Recuperação de Senha.
 *
 * Responsabilidade:
 * - Capturar email do expositor
 * - Chamar POST /exhibitor-auth/forgot-password
 * - Exibir confirmação (sempre, por segurança)
 *
 * UX:
 * - Mensagem genérica independente de o email existir ou não
 * - Link para voltar ao login
 * - Link para criar conta
 */
export default function ForgotPasswordPage() {
  const mutation = useForgotPasswordMutation()

  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)

  const isSubmitting = mutation.isPending

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsed = ForgotPasswordPayloadSchema.safeParse({ email: email.trim().toLowerCase() })
    if (!parsed.success) {
      toast.error({
        title: "E-mail inválido",
        subtitle: parsed.error.issues?.[0]?.message ?? "Informe um e-mail válido.",
      })
      return
    }

    try {
      await mutation.mutateAsync(parsed.data)
      setSent(true)
    } catch (err: any) {
      toast.error({
        title: "Erro ao enviar",
        subtitle: err?.message ?? "Tente novamente em instantes.",
      })
    }
  }

  // ──────────────────────────────────────────
  // Tela de confirmação (após envio)
  // ──────────────────────────────────────────
  if (sent) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center text-center py-10 space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, enviaremos um
              link para redefinir sua senha. O link é válido por <strong>30 minutos</strong>.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2 pt-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setSent(false)
                setEmail("")
              }}
            >
              <Mail className="h-4 w-4" />
              Enviar para outro e-mail
            </Button>

            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ──────────────────────────────────────────
  // Formulário de email
  // ──────────────────────────────────────────
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
        </div>
        <CardDescription>
          Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">E-mail</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <Button className="w-full gap-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Enviar link de redefinição
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>
              Lembrou a senha?{" "}
              <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Fazer login
              </Link>
            </p>
            <p>
              Não tem conta?{" "}
              <Link href="/cadastro" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
