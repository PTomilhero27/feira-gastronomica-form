"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

import { IntroCard } from "./components/intro-card";
import { RegisterForm } from "./components/register-form";
import { SuccessCard } from "./components/success-card";

/**
 * Página de Cadastro de Interessados
 *
 * Responsabilidade:
 * - Orquestrar o fluxo: Intro -> Form -> Sucesso
 * - Manter a página enxuta delegando UI para componentes
 */
type PageState = "intro" | "form" | "success";

export default function CadastroPage() {
  const [state, setState] = React.useState<PageState>("intro");

  return (
    <div className="mx-auto w-full   ">
      <Card className="rounded-2xl p-5 sm:p-7">
        {state === "intro" ? (
          <IntroCard
            title="Quero participar das próximas feiras"
            subtitle="Preencha um cadastro rápido para conhecermos seu negócio e te avisarmos quando surgir uma oportunidade compatível."
            onStart={() => setState("form")}
          />
        ) : null}

        {state === "form" ? (
          <RegisterForm
            onBack={() => setState("intro")}
            onSuccess={() => setState("success")}
          />
        ) : null}

        {state === "success" ? (
          <SuccessCard/>
        ) : null}
      </Card>
    </div>
  );
}
