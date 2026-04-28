'use client'

/**
 * Shell público do portal (sem autenticação obrigatória).
 *
 * Responsabilidade:
 * - Navbar com links para áreas públicas
 * - Se o usuário estiver logado, mostra botão "Meu painel" em vez de "Entrar"
 * - Sem ExhibitorAuthGuard (não redireciona para login)
 *
 * Decisão:
 * - Usa useAuth() para checar opcionalmente se está logado
 * - Layout visual consistente com o ExhibitorAppShell
 */

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/providers/auth-provider'

export function PublicAppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()
  const pathname = usePathname()

  if (pathname === '/feiras/futuras') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/feiras/futuras" className="text-sm font-semibold hover:text-primary transition-colors">
              Feira Gastronômica
            </Link>

            {/* Navegação principal (desktop) */}
            <nav className="hidden sm:flex items-center gap-1">
              <PublicNavLink href="/feiras/futuras">Feiras</PublicNavLink>
            </nav>
          </div>

          {/* Botão de login ou acesso ao painel */}
          {isReady && (
            isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Meu painel</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Navegação mobile */}
        <nav className="sm:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2 -mt-1">
          <PublicNavLink href="/feiras/futuras">Feiras</PublicNavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

/**
 * Link de navegação com indicador de ativo (versão pública).
 */
function PublicNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  )
}
