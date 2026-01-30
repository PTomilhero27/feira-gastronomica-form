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
    <main className="mx-auto w-full max-w-5xl ">
      <div className="min-h-[calc(100vh-220px)] grid place-items-center">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </main>

  )
}
