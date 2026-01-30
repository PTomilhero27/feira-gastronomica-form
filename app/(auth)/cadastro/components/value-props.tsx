"use client";

import { Clock3, BadgeCheck, Sparkles } from "lucide-react";

/**
 * ValueProps
 *
 * Responsabilidade:
 * - Exibir benefícios rápidos do cadastro, em formato escaneável
 * - Reforçar confiança sem “texto longo”
 */
export function ValueProps() {
  const items = [
    {
      icon: Clock3,
      title: "Rápido",
      description: "Cadastro em poucos minutos",
    },
    {
      icon: BadgeCheck,
      title: "Organizado",
      description: "Triagem por perfil e operação",
    },
    {
      icon: Sparkles,
      title: "Sem compromisso",
      description: "Você decide quando participar",
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="rounded-xl border bg-white/70 p-3">
          <div className="flex items-start gap-2">
            <it.icon className="mt-0.5 h-4 w-4 text-emerald-700" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-emerald-950">{it.title}</p>
              <p className="text-xs text-emerald-950/70">{it.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
