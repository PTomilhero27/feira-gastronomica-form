/**
 * Layout da rota de ativação/redefinição por token.
 *
 * Responsabilidade:
 * - Fornecer contexto visual consistente para o fluxo de ativação.
 * - Declarar metadata específica (SEO e clareza no browser).
 *
 * Decisão:
 * - Apesar do portal ser autenticado no geral, esta rota é pública por natureza,
 *   pois depende de token temporário gerado pelo admin.
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ativação de acesso | Portal do Expositor",
  description:
    "Ative seu acesso ao portal do expositor criando sua senha. Link válido por tempo limitado.",
}

export default function ActivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background">
      {/* Fundo sutil para dar “cara de produto” sem pesar */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background" />

      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">


        {/* Conteúdo (login/registro/recuperação) */}
        <main>{children}</main>


      </div>
    </div>
  )
}
