"use client"

/**
 * Card do fluxo de ativação/redefinição de senha.
 *
 * Responsabilidade:
 * - Validar token (via query)
 * - Mostrar formulário de senha + confirmação
 * - Enviar token+senha ao backend
 * - ✅ Exibir tela de sucesso com CTA "Fazer login"
 *
 * Decisões:
 * - Uma única tela serve para "primeiro acesso" e "reset".
 * - Validação de token não depende de status HTTP (backend retorna ok/reason).
 * - ✅ NÃO mostramos botão/mensagem "voltar ao login" em estados de erro.
 * - ✅ Erros de submit são exibidos via toast (sem poluir o card).
 */
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Lock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  LogIn,
} from "lucide-react"

import {
  isTokenValid,
  tokenFailureMessage,
} from "@/app/modules/exhibitor-auth/exhibitor-auth.schemas"

import {
  useSetPasswordWithTokenMutation,
  useValidateExhibitorTokenQuery,
} from "@/app/modules/exhibitor-auth/exhibitor-auth.queries"

/**
 * ✅ Spinner do projeto (ajuste o import conforme seu caminho real)
 */
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

/**
 * ✅ Toast (shadcn). Ajuste o import se seu projeto estiver em outro path.
 */

type PasswordCheck = {
  minLen: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

function evaluatePassword(password: string): PasswordCheck {
  return {
    minLen: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  }
}

function isStrongEnough(password: string) {
  // ✅ Regras mínimas “boas” (MVP forte)
  const c = evaluatePassword(password)
  return c.minLen && c.hasUpper && c.hasLower && c.hasNumber && c.hasSymbol
}

function PasswordRule({
  ok,
  label,
}: {
  ok: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={ok ? "text-emerald-700" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )
}

export function ActivateAccountCard({ token }: { token: string }) {
  const router = useRouter()

  const validateQuery = useValidateExhibitorTokenQuery(token)
  const setPasswordMutation = useSetPasswordWithTokenMutation()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const data = validateQuery.data

  /**
   * Label do modo:
   * - RESET_PASSWORD => "Redefinir senha"
   * - ACTIVATE_ACCOUNT => "Criar senha"
   */
  const modeLabel = useMemo(() => {
    const t = data?.tokenType
    if (t === "RESET_PASSWORD") return "Redefinir senha"
    return "Criar senha"
  }, [data?.tokenType])

  const passwordCheck = useMemo(() => evaluatePassword(password), [password])

  const canSubmit =
    !setPasswordMutation.isPending &&
    Boolean(token) &&
    Boolean(data && isTokenValid(data)) &&
    isStrongEnough(password) &&
    password === confirm

  async function handleSubmit() {
    try {
      const res = await setPasswordMutation.mutateAsync({ token, password })

      if (res.success) {
        // ✅ Mostra tela de sucesso (sem redirecionar automaticamente)
        setShowSuccess(true)
      } else {
        toast.error({
          title: "Não foi possível salvar",
          subtitle: "Tente novamente. Se persistir",
        })
      }
    } catch (err: any) {
      // ✅ Erro vindo do api layer / backend (mensagem amigável)
      toast.error({
        title: "Erro ao salvar senha",
        subtitle:
          err?.message ||
          "Não foi possível concluir. Tente novamente em instantes.",
      })
    }
  }

  // ✅ Tela de sucesso (após salvar senha)
  if (showSuccess) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Tudo certo!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border bg-emerald-50/50 p-4">
            <div className="text-sm font-medium text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              Senha definida com sucesso
            </div>
            <div className="mt-1 text-sm text-emerald-900/80">
              Agora você já pode acessar o portal com seu e-mail e a senha recém-criada.
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => router.replace("/login")}
          >
            <LogIn className="h-4 w-4" />
            Fazer login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado 1: carregando validação do token
  if (validateQuery.isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Validando link
          </CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" />
          Aguarde um instante
        </CardContent>
      </Card>
    )
  }

  // Estado 2: erro REAL (rede/500/parsing)
  if (validateQuery.isError) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Não foi possível validar o link
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Erro inesperado</AlertTitle>
            <AlertDescription>
              Houve um problema ao validar o link. Tente novamente em instantes.
            </AlertDescription>
          </Alert>

          <Button variant="outline" onClick={() => validateQuery.refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado 3: resposta vazia
  if (!data) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Não foi possível carregar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Tente atualizar a página. Se persistir.
        </CardContent>
      </Card>
    )
  }

  // Estado 4: token inválido/expirado/usado (ok=false)
  if (!data.ok) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Link inválido ou expirado
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Não foi possível validar o link</AlertTitle>
            <AlertDescription>{tokenFailureMessage(data.reason)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Estado 5: token válido (ok=true)
  if (!isTokenValid(data)) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Link válido, mas incompleto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O backend retornou um contrato incompleto. Verifique a API e tente novamente.
        </CardContent>
      </Card>
    )
  }

  const displayName =
    (data.displayName?.trim() ? data.displayName.trim() : null) ??
    data.email ??
    "Expositor"

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          {modeLabel}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contexto do token (UX) */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="text-xs text-muted-foreground">Conta</div>
          <div className="text-sm font-medium">{displayName}</div>

          <div className="mt-2 text-xs text-muted-foreground">
            Link válido até{" "}
            <span className="font-medium text-foreground">
              {new Date(data.expiresAt).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <Separator />

        {/* Form senha */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Nova senha</div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha forte"
            autoComplete="new-password"
          />

          {/* ✅ Validações visuais */}
          <div className="mt-2 grid gap-1">
            <PasswordRule ok={passwordCheck.minLen} label="Pelo menos 8 caracteres" />
            <PasswordRule ok={passwordCheck.hasUpper} label="Uma letra maiúscula" />
            <PasswordRule ok={passwordCheck.hasLower} label="Uma letra minúscula" />
            <PasswordRule ok={passwordCheck.hasNumber} label="Um número" />
            <PasswordRule ok={passwordCheck.hasSymbol} label="Um símbolo (ex.: !@#)" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Confirmar senha</div>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
          />
          {confirm.length > 0 && password !== confirm && (
            <div className="text-xs text-red-600">As senhas não conferem.</div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full gap-2">
          {setPasswordMutation.isPending ? (
            <>
              <Spinner className="h-4 w-4" />
              Salvando
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirmar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
