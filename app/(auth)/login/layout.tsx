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
    <div className="min-h-dvh w-full bg-background">
      {/* Fundo sutil para dar “cara de produto” sem pesar */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background" />

      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
        {/* Cabeçalho / marca */}
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Portal do Expositor</h1>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta para acessar suas feiras, barracas e informações.
          </p>
        </header>

        {/* Conteúdo (login/registro/recuperação) */}
        <main>{children}</main>


      </div>
    </div>
  );
}
