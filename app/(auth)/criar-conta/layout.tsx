import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta - Feira Gastronômica",
  description: "Crie sua conta de expositor para acessar o portal.",
};

export default function CriarContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white">
      {/* Fundo sutil, dá profundidade */}
      <div className="pointer-events-none fixed inset-0 bg-white" />

      {/* Conteúdo centralizado */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
