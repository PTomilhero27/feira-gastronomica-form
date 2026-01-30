/**
 * Layout do grupo (auth).
 *
 * Responsabilidade:
 * - Concentrar páginas de autenticação (login/cadastro/recuperação)
 * - Manter uma moldura consistente e separada do painel (app)
 *
 * Decisão:
 * - Este layout é Server Component (sem "use client") para permitir Metadata.
 * - A lógica de redirecionamento/auth NÃO fica aqui (fica no (app)/layout).
 *
 * Ajuste de UX:
 * - Centralizar o conteúdo na viewport
 * - Definir largura máxima para evitar telas esticadas
 * - Background sutil para dar sensação de “produto”
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro - Feira Gastronômica",
  description: "Cadastro do expositor",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background">
      {/* Fundo sutil (sem exagero), ajuda a dar profundidade */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />

      {/* Conteúdo centralizado */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
