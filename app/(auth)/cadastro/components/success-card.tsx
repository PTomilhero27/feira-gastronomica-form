"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * SuccessCard
 *
 * Responsabilidade:
 * - Exibir confirmação amigável após o envio do cadastro
 *
 * Ajustes solicitados:
 * - Remover botões (sem ações)
 * - Dar destaque visual (tom verde no card principal)
 * - Aumentar o ícone
 */
export function SuccessCard() {
  return (
    <div className="space-y-6">
      {/* Card principal (verde, mais chamativo) */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-700" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950">
            Recebemos seu cadastro
          </h2>

          <p className="text-sm text-emerald-950/75">
            Suas informações já estão na nossa base de dados para análise.
          </p>
        </header>

        <div className="mt-6 rounded-xl border bg-white/70 p-4">
          <p className="text-sm font-medium text-emerald-950">O que acontece agora?</p>
          <p className="mt-2 text-sm text-emerald-950/75">
            Vamos analisar seu perfil e sua operação. Quando surgir uma feira compatível,
            entraremos em contato com orientações sobre os próximos passos.
          </p>
        </div>
      </section>
    </div>
  );
}
