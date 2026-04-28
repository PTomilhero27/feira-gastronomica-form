"use client";

import * as React from "react";
import { CheckCircle2, RotateCw, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/app/modules/public/interests/public-interests.queries";
import { toast } from "@/components/ui/toast";

/**
 * VerifyEmailCard
 *
 * Responsabilidade:
 * - Coletar código de 6 dígitos enviado por email
 * - Chamar POST /public/interests/verify-email para ativar a conta
 * - Permitir reenvio do código (rate-limit: 1 por minuto)
 * - Mostrar tela de sucesso após verificação
 */
export function VerifyEmailCard({ email }: { email: string }) {
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const [code, setCode] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      toast.error({
        title: "Código inválido",
        subtitle: "O código deve ter 6 dígitos numéricos.",
      });
      return;
    }

    try {
      await verifyMutation.mutateAsync({ email, code: trimmedCode });
      setVerified(true);
    } catch (err: any) {
      toast.error({
        title: "Código inválido",
        subtitle: err?.message ?? "Verifique o código e tente novamente.",
      });
    }
  }

  async function handleResend() {
    try {
      await resendMutation.mutateAsync({ email });
      setCooldown(60);
      toast.success({
        title: "Código reenviado",
        subtitle: "Verifique sua caixa de entrada.",
      });
    } catch (err: any) {
      toast.error({
        title: "Erro ao reenviar",
        subtitle: err?.message ?? "Aguarde antes de tentar novamente.",
      });
    }
  }

  if (verified) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
          <header className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-700" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-emerald-950">
              Conta criada com sucesso!
            </h2>

            <p className="text-sm text-emerald-950/75">
              Seu e-mail foi verificado e sua conta está ativa. Você já pode acessar o portal.
            </p>
          </header>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full h-12 text-base">
                Fazer login
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um código de <strong>6 dígitos</strong> para{" "}
          <strong className="text-foreground">{email}</strong>.
          <br />
          Insira o código abaixo para ativar sua conta.
        </p>
      </header>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code" className="sr-only">Código de verificação</Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={verifyMutation.isPending}
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 gap-2"
          disabled={verifyMutation.isPending || code.length !== 6}
        >
          {verifyMutation.isPending ? (
            <>
              <Spinner className="h-4 w-4" />
              Verificando...
            </>
          ) : (
            "Verificar e ativar conta"
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Não recebeu o código? Verifique a pasta de spam.
        </p>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resendMutation.isPending || cooldown > 0}
          className="gap-2 text-sm"
        >
          <RotateCw className={`h-4 w-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />
          {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
        </Button>
      </div>
    </div>
  );
}
