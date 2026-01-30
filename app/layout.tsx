import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast/toaster";
import { QueryProvider } from "./modules/shared/query/query-provider";
import { AuthProvider } from "./providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feira Gastronômica",
  description: "Portal do expositor — acesso autenticado.",
};

/**
 * RootLayout (App Router)
 * Responsabilidade:
 * - Definir HTML base, fontes, providers globais e toaster
 *
 * Importante:
 * - Este arquivo é Server Component por padrão.
 * - Não deve conter hooks (useEffect/useRouter).
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
