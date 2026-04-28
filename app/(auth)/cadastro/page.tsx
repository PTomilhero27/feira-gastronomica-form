"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

import { IntroCard } from "./components/intro-card";
import { RegisterForm } from "./components/register-form";
import { SuccessCard } from "./components/success-card";

/**
 * Página de Cadastro de Interessados
 *
 * Responsabilidade:
 * - Orquestrar o fluxo: Intro → Form → Sucesso
 *
 * Fluxo:
 * 1. Intro: explica o que é o cadastro
 * 2. Form: dados básicos → chama POST /public/interests/upsert
 * 3. Sucesso: confirmação do envio (sem verificação de email)
 *
 * Nota: Para criar conta com acesso ao portal, usar /criar-conta
 */
type PageState = "intro" | "form" | "success";

export default function CadastroPage() {
  const [state, setState] = React.useState<PageState>("intro");

  function handleFormSuccess() {
    setState("success");
  }

  return (
    <div className="mx-auto w-full">
      <Card className="rounded-2xl p-5 sm:p-7">
        {state === "intro" ? (
          <IntroCard
            title="Quero participar das próximas feiras"
            subtitle="Demonstre interesse e entraremos em contato quando surgir uma vaga compatível com seu perfil."
            onStart={() => setState("form")}
          />
        ) : null}

        {state === "form" ? (
          <RegisterForm
            onBack={() => setState("intro")}
            onSuccess={handleFormSuccess}
          />
        ) : null}

        {state === "success" ? <SuccessCard /> : null}
      </Card>

      {/* Links de navegação */}
      {state !== "success" && (
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
