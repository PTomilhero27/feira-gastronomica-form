import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/modules/shared/query/query-provider";
import { Toaster } from "@/components/ui/toast/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inscrição – Feira Gastronômica",
  description:
    "Preencha o formulário para participar da próxima feira gastronômica. Cadastre seu negócio, informe seus produtos e manifeste seu interesse em fazer parte do evento.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />

      </body>
    </html>
  );
}
