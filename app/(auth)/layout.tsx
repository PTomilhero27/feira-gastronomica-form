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
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[1120px]">{children}</div>
    </main>
  )
}
