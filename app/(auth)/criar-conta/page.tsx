"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

import { IntroCard } from "./components/intro-card";
import { RegisterForm } from "./components/register-form";
import { VerifyEmailCard } from "./components/verify-email-card";

/**
 * Página de Criar Conta (Expositor com senha)
 *
 * Responsabilidade:
 * - Orquestrar o fluxo: Intro → Form (com senha) → Verificação (código 6 dígitos)
 *
 * Fluxo:
 * 1. Intro: explica o que é o cadastro
 * 2. Form: dados + senha + confirmação → chama POST /public/interests/upsert
 * 3. Verify: código de 6 dígitos por email → chama POST /public/interests/verify-email
 * 4. Sucesso: conta ativa, pode fazer login
 */
type PageState = "intro" | "form" | "verify";

export default function CriarContaPage() {
  const [state, setState] = React.useState<PageState>("intro");
  const [registeredEmail, setRegisteredEmail] = React.useState("");

  function handleFormSuccess(email: string) {
    setRegisteredEmail(email);
    setState("verify");
  }

  return (
    <div className="mx-auto w-full">
      <Card className="rounded-2xl p-5 sm:p-7">
        {state === "intro" ? (
          <IntroCard
            title="Quero participar das próximas feiras"
            subtitle="Crie sua conta para gerenciar suas barracas, acompanhar feiras e demonstrar interesse em espaços disponíveis."
            onStart={() => setState("form")}
          />
        ) : null}

        {state === "form" ? (
          <RegisterForm
            onBack={() => setState("intro")}
            onSuccess={handleFormSuccess}
          />
        ) : null}

        {state === "verify" ? (
          <VerifyEmailCard email={registeredEmail} />
        ) : null}
      </Card>

      {/* Link para login */}
      {state !== "verify" && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Fazer login
          </Link>
        </p>
      )}
    </div>
  );
}
