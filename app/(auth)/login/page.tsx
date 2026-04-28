"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock } from "lucide-react"

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
 * - Redirecionar para área interna (ou returnUrl se presente)
 *
 * Decisão:
 * - returnUrl vem do query param ?returnUrl=...
 * - Usado quando o usuário é redirecionado para login ao tentar ação protegida
 * - Suspense boundary necessário para useSearchParams (Next.js 16)
 */
export default function LoginPage() {
  return (
    <div className="grid w-full items-center gap-10 lg:grid-cols-[1.5fr_1fr] xl:gap-14">
      <section className="flex flex-col gap-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_8px_30px_rgba(1,0,119,0.04)] lg:p-10">
        <div>
          <div className="mb-6 flex gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#010077]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#196132]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#f5bd2c]" />
          </div>

          <span className="inline-flex rounded-full bg-[#010077]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#010077]">
            Only in BR
          </span>

          <div className="mt-6 space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#010077] lg:text-5xl">
              Painel do<br />expositor
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Gestão de feiras, contratos, relatórios e operação em um painel mais claro, direto e organizado.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#010077]">Operação</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">Feiras, barracas e fluxo do evento.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#010077]">Relação</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">Interessados, vitrine e acompanhamento.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#010077]">Financeiro</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">Contratos, relatórios e pagamentos.</p>
          </div>
        </div>
      </section>

      <React.Suspense fallback={<LoginSkeleton />}>
        <LoginContent />
      </React.Suspense>
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSession } = useAuth()

  const loginMutation = useExhibitorLoginMutation()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const isSubmitting = loginMutation.isPending

  // ✅ returnUrl: redireciona para onde o usuário estava antes
  const returnUrl = searchParams.get("returnUrl")

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

      // ✅ Redireciona para returnUrl ou dashboard
      const target = returnUrl ? decodeURIComponent(returnUrl) : "/dashboard"
      router.replace(target)
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
    <Card className="flex w-full flex-col overflow-hidden rounded-[32px] border-x border-b border-t-8 border-slate-200 border-t-[#010077] bg-white p-1 shadow-[0_8px_30px_rgba(1,0,119,0.04)]">
      <div className="flex flex-col p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex rounded-full bg-[#010077]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#010077]">
            Only in BR
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-[#010077]">
            <Lock className="h-3 w-3" />
          </div>
        </div>

        <p className="mb-6 text-[11px] font-semibold text-[#010077]/70">
          Acesso seguro ao painel de expositores
        </p>

        <div className="mb-6 space-y-1.5">
          <CardTitle className="text-3xl font-extrabold text-[#010077] lg:text-4xl">Entrar</CardTitle>
          <CardDescription className="text-xs leading-relaxed text-slate-500">
            Entre com seu e-mail e senha<br />para continuar no painel.
          </CardDescription>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[11px] font-semibold text-[#010077]">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-xl border-transparent bg-[#010077]/5 px-4 text-xs font-medium text-[#010077] transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#010077]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[11px] font-semibold text-[#010077]">
                Senha
              </Label>
              <Link
                href="/esqueci-senha"
                className="text-[10px] font-semibold text-[#010077]/60 underline-offset-4 hover:text-[#010077] hover:underline"
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
              className="h-11 rounded-xl border-transparent bg-[#010077]/5 px-4 text-xs font-medium text-[#010077] transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#010077]"
            />
          </div>

          <Button 
            className="mt-2 h-11 w-full rounded-xl bg-[#010077] text-sm font-bold text-white transition hover:bg-[#010077]/90" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="pt-2 text-center text-[10px] font-medium text-slate-500">
            Não tem conta?{" "}
            <Link
              href="/criar-conta"
              className="font-bold text-[#010077] underline-offset-4 hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-4 px-6 pb-6 text-center text-[10px] font-semibold text-slate-400">
        Painel interno Only in BR
      </div>
    </Card>
  )
}

/**
 * Skeleton do login enquanto o Suspense resolve useSearchParams.
 */
function LoginSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse o portal do expositor para gerenciar suas feiras, barracas e faturamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
