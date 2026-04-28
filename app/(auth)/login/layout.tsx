/**
 * Layout do grupo (auth).
 * Responsabilidade:
 * - Concentrar páginas de autenticação (login/registro/recuperação)
 * - Manter uma moldura consistente e separada do painel (app)
 *
 * Decisão:
 * - Este layout é Server Component (sem "use client") para permitir Metadata.
 * - A lógica de redirecionamento/auth NÃO fica aqui (vamos fazer no (app)/layout).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso - Feira Gastronômica",
  description: "Portal do expositor — autenticação e acesso ao painel.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white" />
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6">
        {children}
      </div>
    </div>
  );
}
