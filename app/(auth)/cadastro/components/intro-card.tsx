"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ValueProps } from "./value-props";

/**
 * IntroCard
 *
 * Responsabilidade:
 * - Apresentar, de forma amigável, o propósito do cadastro
 * - Aumentar confiança e reduzir fricção antes do usuário começar o formulário
 *
 * Decisão de UX:
 * - Texto curto e humano (sem "termos de sistema")
 * - Card em tom verde claro para transmitir acolhimento/segurança
 */
export function IntroCard(props: {
  title: string;
  subtitle: string;
  onStart: () => void;
}) {
  const { title, subtitle, onStart } = props;

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {/* Card verde claro (mais chamativo) */}
      <section className="rounded-2xl border bg-emerald-50/60 p-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-emerald-950">
            Por que estamos pedindo essas informações?
          </p>
          <p className="text-sm text-emerald-950/80">
            É um cadastro simples para conhecermos seu negócio. Assim a organização consegue te chamar
            com mais agilidade quando surgir uma feira que faça sentido para você.
          </p>
        </div>

        <div className="mt-4">
          <ValueProps />
        </div>
      </section>

      <Button className="w-full" size="lg" onClick={onStart}>
        Começar cadastro
      </Button>
    </div>
  );
}
